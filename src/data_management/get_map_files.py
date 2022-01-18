import os
from io import BytesIO
import ssl
from urllib.request import urlopen
import pandas as pd
from zipfile import ZipFile
script_dir = os.path.dirname(__file__)
ssl._create_default_https_context = ssl._create_unverified_context


def getMap(zipLink, folder):
    print("getting "+zipLink.split("/")[-1] + " ...")
    savePath = os.path.join(script_dir, "raw_data", folder)
    if not os.path.exists(savePath):
        os.makedirs(savePath)
    with urlopen(zipLink) as zipresp:
        with ZipFile(BytesIO(zipresp.read())) as zfile:
            zfile.extractall(savePath)
    print("downloaded and unzipped: "+folder)


def getCsv(link, fileName):
    savePath = os.path.join(script_dir, "raw_data", "cer_data", fileName)
    df = pd.read_csv(link,
                     skiprows=0,
                     encoding="latin-1",
                     engine="python",
                     error_bad_lines=False)
    df.to_csv(savePath, index=False)


if __name__ == "__main__":
    getMap("http://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/files-fichiers/2016/lpr_000b16a_e.zip", "lpr_000b16a_e")
    getMap("https://ftp.maps.canada.ca/pub/nrcan_rncan/vector/geobase_al_ta/shp_eng/AL_TA_CA_SHP_eng.zip", "AL_TA_CA_SHP_eng")
    getMap("https://data.aadnc-aandc.gc.ca/geomatics/directories/output/DonneesOuvertes_OpenData/Traite_Pre_1975_Treaty/Traite_Pre_1975_Treaty_SHP.zip", "Traite_Pre_1975_Treaty_SHP")
    getMap("https://data.aadnc-aandc.gc.ca/geomatics/directories/output/DonneesOuvertes_OpenData/Premiere_Nation_First_Nation/Premiere_Nation_First_Nation_CSV.zip", "Premiere_Nation_First_Nation_CSV")
    getMap("https://data.aadnc-aandc.gc.ca/geomatics/directories/output/DonneesOuvertes_OpenData/Premiere_Nation_First_Nation/Relation_Premiere_Nation_reserve_Relation_First_Nation_Reserve_CSV.zip", "Relation_Premiere_Nation_reserve_Relation_First_Nation_Reserve_CSV")
