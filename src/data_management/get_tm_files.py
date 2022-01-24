import requests
import json
from util import set_cwd_to_script
set_cwd_to_script()


def get_tm_files(url):
    try:
        file_name = url.split("/")[-1].split(".")[0]
        print("getting latest "+file_name+" data from Trans Mountain")
        solditems = requests.get(url)
        data = solditems.json()
        with open('../company_data/trans_mountain_files/'+file_name+'.json', 'w') as f:
            json.dump(data, f)
    except:
        print("Cant reach Trans Mountain")



if __name__ == "__main__":
    get_tm_files("https://www.transmountain.com/map-data/pipeline-spread-geometries.geojson")
    get_tm_files("https://www.transmountain.com/map-data/existing-pipeline.geojson")
    