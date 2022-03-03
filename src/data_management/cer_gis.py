import geopandas as gpd
import os
import pandas as pd
import numpy as np
import json
import time
from util import set_cwd_to_script
set_cwd_to_script()
# crs_proj = 'EPSG:2960'
crs_proj = 'ESRI:102002'
crs_geo = 'EPSG:4269'
companies = {"TRANS MOUNTAIN PIPELINE ULC (T260)": "Trans Mountain Pipeline ULC"}


def import_trans_mountain(crs_target=crs_proj):
    def process_tm(data, plname, status):
        data = data.set_geometry('geometry')
        data = data.to_crs(crs_target)
        data.crs = crs_target

        data['OPERATOR'] = "Trans Mountain Pipeline ULC"
        data["PLNAME"] = plname
        data["STATUS"] = status

        data = data.dissolve(by=['OPERATOR', 'PLNAME', 'STATUS']).reset_index()
        data['geometry'] = data.boundary
        return data

    mainline = gpd.read_file(os.path.join(os.getcwd(), "..", "company_data", "trans_mountain_files", "existing-pipeline.json"))
    tmx = gpd.read_file(os.path.join(os.getcwd(), "..", "company_data", "trans_mountain_files", "pipeline-spread-geometries.json"))

    mainline = process_tm(mainline, "Existing Mainline", "Operating")
    tmx = process_tm(tmx, "TMX", "Approved")

    return mainline, tmx


def import_geodata(path, d_type, crs_target):

    if d_type not in ["incidents", "pipe"]:
        data = gpd.read_file(path)
        data = data.set_geometry('geometry')
        data = data.to_crs(crs_target)
        data.crs = crs_target
    elif d_type != "pipe":
        data = pd.read_csv(path,
                           encoding="latin-1",
                           skiprows=0,
                           engine="python",
                           error_bad_lines=False)
    if d_type == 'poly1':
        data = data.dissolve(by="NAME1").reset_index()
        poly1_remove = ['ACQTECH',
                        'METACOVER',
                        'PROVIDER',
                        'DATASETNAM',
                        'SPECVERS',
                        'LANGUAGE1',
                        'LANGUAGE2',
                        'LANGUAGE4',
                        'NAME4',
                        'NAME3',
                        'LANGUAGE3',
                        'LANGUAGE5',
                        'NAME5',
                        'CREDATE',
                        'REVDATE',
                        'NID',
                        'JUR1',
                        'JUR2',
                        'JUR3',
                        'JUR4',
                        'WEBREF',
                        'ACCURACY']

        # add the band id to land id's
        # bands source:
        # https://open.canada.ca/data/en/dataset/b6567c5c-8339-4055-99fa-63f92114d9e4

        # band_names source:
        # https://open.canada.ca/data/en/dataset/b6567c5c-8339-4055-99fa-63f92114d9e4
        data["ALCODE"] = [x[1:] if x[0] == "0" else x for x in data["ALCODE"]]
        bands = pd.read_csv("./raw_data/Relation_Premiere_Nation_reserve_Relation_First_Nation_Reserve_CSV/Relation_Premiere_Nation_reserve_Relation_First_Nation_Reserve_CSV.csv")
        bands["ADMIN_LAND_ID"] = [str(x) for x in bands["ADMIN_LAND_ID"]]
        data = data.merge(bands, how="left", left_on=["ALCODE"], right_on=["ADMIN_LAND_ID"])

        # add the band names
        band_names = pd.read_csv("./raw_data/Premiere_Nation_First_Nation_CSV/Premiere_Nation_First_Nation.csv")
        for delete in ["LONGITUDE", "LATITUDE", "COORD_SYS"]:
            del band_names[delete]

        data = data.merge(band_names, how="left", left_on=["BAND_NUMBER"], right_on=["BAND_NUMBER"])

        data["ALTYPE"] = data["ALTYPE"].replace({"Indian Reserve":
                                                 "First Nations Reserve"})

        for remove in poly1_remove:
            del data[remove]

        del data["ALCODE"]
        del data["ADMIN_LAND_ID"]
        del data["BAND_NUMBER"]

    elif d_type == 'pipe':
        mainline, tmx = import_trans_mountain()
        data = pd.concat([mainline, tmx], ignore_index=True)
    elif d_type == "incidents":
        remove = ['Reported Date',
                  'Nearest Populated Centre',
                  'Province',
                  'Release Type',
                  'Significant']

        for r in remove:
            del data[r]
        data['Company'] = data['Company'].replace({"Westcoast Energy Inc., carrying on business as Spectra Energy Transmission": "Westcoast Energy Inc."})
        data = gpd.GeoDataFrame(data, geometry=gpd.points_from_xy(data.Longitude,
                                                                  data.Latitude))
        data = data.rename(columns={'Approximate Volume Released (m³)': 'Approximate Volume Released',
                                    'Approximate Volume Released (m3)': 'Approximate Volume Released'})
        data.crs = crs_geo
        data = data.to_crs(crs_proj)
        data.crs = crs_proj

    print('Imported '+d_type+' file with CRS: '+str(data.crs))
    return data


def import_files(crs_target):
    data_paths = {'poly1': './raw_data/AL_TA_CA_SHP_eng/AL_TA_CA_2_140_eng.shp',
                  'pipe': '',
                  'incidents': './raw_data/cer_data/incident-data.csv'}

    out = {}
    for d_type, path in data_paths.items():
        out[d_type] = import_geodata(path, d_type, crs_target)
    return out['poly1'], out['pipe'], out['incidents']


def line_clip(pipe,
              land,
              polygon_id,
              forceclip=True,
              landCol="NAME1",
              clip_location='',
              poly1_on_pipe_location='',
              save=False):

    if save:
        for savePath in [clip_location, poly1_on_pipe_location]:
            folder = savePath.split("/")[1:-1][0]
            if not os.path.isdir(os.path.join(os.getcwd(), folder)):
                os.mkdir(os.path.join(os.getcwd(), folder))

    if pipe.crs != land.crs:
        print('Warning: Different CRS: '+str(pipe.crs)+' '+str(land.crs))

    pipe = pipe.dissolve(by=['OPERATOR', 'PLNAME', 'STATUS']).reset_index()

    pipe_on_land = gpd.sjoin(pipe, land, how='inner', op='intersects').reset_index(drop=True).copy()
    land_on_pipe = gpd.sjoin(land, pipe, how='inner', op='intersects').reset_index(drop=True).copy()
    land_on_pipe = land_on_pipe.drop_duplicates(subset=polygon_id)

    # check for invalid polygons
    # https://stackoverflow.com/questions/13062334/polygon-intersection-error-in-shapely-shapely-geos-topologicalerror-the-opera
    for shp in [pipe_on_land, land_on_pipe]:
        shp['valid'] = [x.is_valid for x in shp['geometry']]
        del shp['index_right']
        # shp['geometry'] = [shape.buffer(0) if valid == False else shape for shape, valid in zip(shp['geometry'], shp['valid'])]

    if os.path.isfile(os.getcwd()+'/'+clip_location) and not forceclip:
        pipe_clipped = gpd.read_file(os.getcwd()+'/'+clip_location)
        print('clip already complete with crs: '+str(pipe_on_land.crs))

    else:
        completed = []
        for landName in land_on_pipe[landCol]:
            p1 = pipe_on_land[pipe_on_land[landCol] == landName].copy()
            l1 = land_on_pipe[land_on_pipe[landCol] == landName].copy()

            clip1 = gpd.clip(p1, l1).copy()
            clip1 = to_metres(clip1, crs_target=crs_proj)
            clip1 = clip1.to_crs(crs_geo)
            clip1.crs = crs_geo
            completed.append(clip1)

        if len(completed) > 0:
            pipe_clipped = pd.concat(completed, ignore_index=True)
        else:
            pipe_clipped = pd.DataFrame()
        if save:
            pipe_clipped.to_file(os.getcwd()+'/'+clip_location)
            print('saved pipe_on_land (clip) with crs: '+str(pipe_clipped.crs))

    # convert back to geographic CRS after length/distance measures are calculated.
    land_on_pipe = land_on_pipe.to_crs(crs_geo)
    land_on_pipe.crs = crs_geo

    if save:
        land_on_pipe.to_file(os.getcwd()+'/'+poly1_on_pipe_location)
        print('saved land_on_pipe with crs: '+str(land_on_pipe.crs))

    return pipe_clipped, land_on_pipe


def to_metres(gdf, crs_target, length=True):
    gdf = gdf.set_geometry('geometry')
    if gdf.crs != crs_target:
        print('wrong crs for length!')
        gdf['geometry'] = gdf.geometry.to_crs(crs_target)
    if length:
        gdf['length_gpd'] = gdf.geometry.length
    return gdf


def get_folder_name(company):
    return company.replace(' ', '').replace('.', '')


def output_poly1(pipe, overlap, company):
    folder_name = get_folder_name(company)
    if not os.path.exists("../company_data/"+folder_name):
        os.mkdir("../company_data/"+folder_name)

    if not overlap.empty:
        del pipe['geometry']
        del pipe['valid']
        pipe = pipe.where(pipe.notnull(), None)
        overlap = overlap[['NAME1', 'geometry']].copy()
        overlap = overlap.drop_duplicates(subset='NAME1')

        pipe = pipe.sort_values(by=["NAME1", "STATUS", "PLNAME"])
        landInfo = {}
        totalLength = 0
        for land in set(pipe['NAME1']):
            p1 = pipe[pipe['NAME1'] == land].copy()

            landMeta = {"altype": list(p1["ALTYPE"])[0],
                        "operator": list(p1["OPERATOR"])[0],
                        "bandName": list(p1["BAND_NAME"])[0]}
            currentLand = []
            for plname, status, length in zip(p1['PLNAME'],
                                              p1['STATUS'],
                                              p1['length_gpd']):

                currentLand.append({"plname": plname,
                                    "status": status,
                                    "length": round(length, 1)})

                totalLength = totalLength + length
            landInfo[land] = {"overlaps": currentLand, "meta": landMeta}

            with open('../company_data/'+folder_name+'/landInfo.json', 'w') as fp:
                json.dump(landInfo, fp)

        overlap = overlap.to_crs(crs_geo)
        overlap.crs = crs_geo
        overlap.to_file("../company_data/"+folder_name+"/poly1.json", driver="GeoJSON")

    else:
        overlap = {'company': company, "overlaps": 0}
        with open('../company_data/'+folder_name+'/poly1.json', 'w') as f:
            json.dump(overlap, f)

        with open('../company_data/'+folder_name+'/landInfo.json', 'w') as fp:
            json.dump({}, fp)

    return overlap


def eventProximity(gdf, poly1, company):
    poly1 = poly1[['NAME1', 'geometry', 'OPERATOR']].copy()
    poly1 = poly1.drop_duplicates(subset=['NAME1', 'OPERATOR'])
    poly1 = poly1.to_crs(crs_proj)
    poly1.crs = crs_proj

    folder_name = get_folder_name(company)
    pnt = gdf[gdf['Company'] == company].copy().reset_index(drop=True)
    poly_company = poly1[poly1['OPERATOR'] == company].copy().reset_index(drop=True)
    if not pnt.empty:
        pnt["Approximate Volume Released"] = pd.to_numeric(pnt["Approximate Volume Released"], errors="coerce")
        pnt["Approximate Volume Released"] = [round(x, 2) for x in pnt["Approximate Volume Released"]]
        # pnt = pnt.where(pd.notnull(pnt), None)
        pnt["Approximate Volume Released"] = pnt["Approximate Volume Released"].replace({np.nan: None})
        close = {}
        total = {"on": 0, "15km": 0}
        for p, eid, iType, iStatus, iVol, iSub, lat, long, what, why in zip(pnt.geometry,
                                                                            pnt['Incident Number'],
                                                                            pnt['Incident Types'],
                                                                            pnt['Status'],
                                                                            pnt['Approximate Volume Released'],
                                                                            pnt['Substance'],
                                                                            pnt['Latitude'],
                                                                            pnt['Longitude'],
                                                                            pnt['What Happened'],
                                                                            pnt['Why It Happened']):

            for land, land_id in zip(poly_company.geometry,
                                     poly_company['NAME1']):
                proximity = land.distance(p)
                if proximity <= 15000:
                    if proximity == 0:
                        total["on"] = total["on"] + 1
                    else:
                        total["15km"] = total["15km"] + 1

                    row = {"distance": int(round(proximity, 0)),
                           "id": eid,
                           "landId": land_id,
                           "type": iType,
                           "status": iStatus,
                           "vol": iVol,
                           "sub": iSub,
                           "what": what,
                           "why": why,
                           "loc": [round(lat, 5), round(long, 5)]}
                    if land_id in close:
                        close[land_id].append(row)
                    else:
                        close[land_id] = [row]

        close['meta'] = total
        with open('../company_data/'+folder_name+'/events.json', 'w') as f:
            json.dump(close, f)
    else:
        close = {"meta": {"on": 0, "15km": 0}}
        with open('../company_data/'+folder_name+'/events.json', 'w') as f:
            json.dump(close, f)
    return close


def overlap_percentage(pipe_overlap, pipe, company):
    pipe_overlap = pipe_overlap.to_crs(crs_proj)
    pipe_overlap.crs = crs_proj
    
    pipe = pipe.to_crs(crs_proj)
    pipe.crs = crs_proj
    
    pipe_overlap = pipe_overlap[pipe_overlap["PLNAME"] == "TMX"].copy().reset_index(drop=True)
    pipe = pipe[pipe["PLNAME"] == "TMX"].copy().reset_index(drop=True)
    pipe = to_metres(pipe, crs_target=crs_proj)
    
    tmx_length = pipe["length_gpd"].sum()
    tmx_overlap_length = pipe_overlap["length_gpd"].sum()
    overlap_info = {"tmx_length": round(tmx_length, 0),
                    "tmx_reserve_overlap_length": round(tmx_overlap_length, 0),
                    "overlap_percentage": round((tmx_overlap_length/tmx_length)*100, 5),
                    "unit": "metre"}
    
    folder_name = get_folder_name(company)
    with open('../company_data/'+folder_name+'/overlap_percentage.json', 'w') as f:
            json.dump(overlap_info, f)
    
    return overlap_info


def worker(company, pipe, poly1, incidents):
    pipec = pipe[pipe["OPERATOR"] == company].copy().reset_index(drop=True)
    poly1c = poly1.copy()
    pipe_on_poly1, poly1_on_pipe = line_clip(pipec,
                                             poly1c,
                                             polygon_id="NAME1",
                                             forceclip=True,
                                             landCol="NAME1")
    
    overlap_percentage(pipe_on_poly1, pipe, company)
    output_poly1(pipe_on_poly1, poly1_on_pipe, company)
    eventProximity(incidents, poly1_on_pipe, company)
    print('Done:' + company)


if __name__ == "__main__":

    start = time.time()
    jobs = []
    poly1_, pipe_, incidents_ = import_files(crs_target=crs_proj)
    for company_ in companies.values():
        worker(company_, pipe_, poly1_, incidents_)

    elapsed = (time.time() - start)
    print("GIS process time:", round(elapsed, 0), ' seconds')
