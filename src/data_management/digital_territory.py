import geopandas as gpd
import requests
import json
from cer_gis import crs_geo
from util import set_cwd_to_script
set_cwd_to_script()


def pull_from_native_land():
    try:
        print("getting latest territory data from native-land.ca")
        url = "https://native-land.ca/wp-content/themes/Native-Land-Theme/files/indigenousTerritories.json"
        solditems = requests.get(url)
        data = solditems.json()
        with open('./raw_data/traditional_territory/indigenousTerritories.json', 'w') as f:
            json.dump(data, f)
    except:
        print("Cant reach native-land.ca")


def getCanadaTerritories():
    pull_from_native_land()
    print("importing files...")
    canada = gpd.read_file("./raw_data/lpr_000b16a_e/lpr_000b16a_e.shp")
    canada = canada.to_crs(crs_geo)
    canada.crs = crs_geo

    df = gpd.read_file("./raw_data/traditional_territory/indigenousTerritories.json")
    df = df.to_crs(crs_geo)
    df.crs = crs_geo

    for delete in ["PRNAME", "PRENAME", "PRFNAME", "PREABBR", "PRFABBR"]:
        del canada[delete]

    print("dissolving canada...")
    canada = canada.dissolve(by="PRUID")
    print("calculating intersection...")
    within = gpd.sjoin(df, canada, how="inner", op="intersects")
    within = within.drop_duplicates(subset=["id"])
    for delete in ["id", "FrenchName", "FrenchDescription", "index_right"]:
        del within[delete]
    within = within.reset_index(drop=True)
    print("saving data...")
    within.to_file("../company_data/community_profiles/indigenousTerritoriesCa.json", driver="GeoJSON")
    return within


if __name__ == "__main__":
    df_ = getCanadaTerritories()
