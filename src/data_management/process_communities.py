import os
import json
import pandas as pd
import numpy as np
from util import set_cwd_to_script
set_cwd_to_script()


def next_election(df, col="Leadership"):
    elections = []
    input_elections = [str(x).lower() for x in list(df[col])]
    input_elections = [x.replace(":", "") for x in input_elections]
    for lead in input_elections:
        if "next election" in lead:
            lead = lead.split("next election")
            lead = [str(x).strip() for x in lead]
            this_election = lead[-1]
            if "." in this_election:
                this_election = this_election.split(".")[0]
            if this_election[0] == ",":
                this_election = this_election[1:]
            this_election = this_election.strip().capitalize()
            elections.append(this_election)
        else:
            elections.append(None)
    df["nextElection"] = elections
    df["nextElection"] = pd.to_datetime(df["nextElection"], errors="coerce")
    elections_list = []
    no_data = 0
    for date in df["nextElection"]:
        if date.year > 0:
            elections_list.append([date.month, date.day, date.year])
        else:
            elections_list.append([])
            no_data += 1
    df['nextElection'] = elections_list
    print("There are "+str(no_data)+" communities without election data, out of "+str(len(elections_list))+" communities.")
    return df


def processTerritoryInfo():
    bc = pd.read_excel(os.path.join(os.getcwd(),
                                    "raw_data",
                                    "traditional_territory",
                                    "Alberta TMX Indigenous Community Listing October 27 2021.xlsx"),
                       sheet_name="TMX_Indigenous Com",
                       skiprows=1,
                       engine="openpyxl")

    ab = pd.read_excel(os.path.join(os.getcwd(),
                                    "raw_data",
                                    "traditional_territory",
                                    "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                       sheet_name="BC First Nations",
                       skiprows=1,
                       engine="openpyxl")

    sources = pd.read_excel(os.path.join(os.getcwd(),
                                         "raw_data",
                                         "traditional_territory",
                                         "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                            sheet_name="image sources",
                            skiprows=0,
                            engine="openpyxl")

    spreads = pd.read_excel(os.path.join(os.getcwd(),
                                         "raw_data",
                                         "traditional_territory",
                                         "TMX_IAMC_Indigenous_Community_Profiles.xlsx"),
                            sheet_name="Spreads",
                            skiprows=0,
                            engine="openpyxl")

    bc.columns = [x.strip() for x in bc.columns]
    ab.columns = [x.strip() for x in ab.columns]
    for col in bc.columns:
        if col not in ab:
            ab[col] = ""

    df = pd.concat([bc, ab], ignore_index=True)
    spreads = spreads.where(spreads.notnull(), None)
    with open('../company_data/TransMountainPipelineULC/spreads.json', 'w') as fp:
        json.dump(spreads.to_dict(orient="records"), fp)

    df = df[~df['Lat'].isnull()].reset_index(drop=True)
    df = df[df["Show"] != "No"].reset_index(drop=True)
    for textCol in ["mapFile",
                    "Community",
                    "Leadership",
                    "Contact person",
                    "Address",
                    "Contact Information",
                    "Protocol",
                    "Project Spreads",
                    "Concerns - Issues",
                    "History",
                    "Community Website"]:

        newText = []
        for t in df[textCol]:
            if isinstance(t, str):
                newText.append(t.strip())
            else:
                newText.append(t)

        df[textCol] = newText

    df["mapFile"] = df["mapFile"].replace({"nan": None})
    df = pd.merge(df, sources, how="left", left_on="Community", right_on="Community")
    df = df.where(df.notnull(), None)
    df = next_election(df)

    no_website = ["No Community Website", "No official Community site", "Not Available"]
    for no_site in no_website:
        df["Community Website"] = df["Community Website"].replace({no_site: None})

    for col in df:
        if "Unnamed" in col:
            del df[col]

    # get spread number for each community
    spread_numbers = []
    df["Project Spreads"] = [str(x) for x in df["Project Spreads"]]
    for project_spread in df["Project Spreads"]:
        project_spread = project_spread.lower()
        if "lower mainland" in project_spread:
            lm = True
        else:
            lm = False
        if "thompson okanagan" in project_spread:
            to = True
        else:
            to = False
        if "spread" in project_spread:
            ps = project_spread.split("spread")[-1].strip()[0]
            try:
                spread_numbers.append(int(ps))
            except:
                if ps == "i" and lm:
                    spread_numbers.append(7)
                elif ps == "f" and to:
                    spread_numbers.append(4)
                else:
                    raise
        else:
            spread_numbers.append(None)
    df["spreadNumber"] = spread_numbers
    df = df.where(df.notnull(), None)
    df = df.replace({np.nan: None})
    df["Project Spreads"] = df["Project Spreads"].replace({"None": None})

    land = {}

    def addInfo(row):
        return {"community": row["Community"].strip(),
                "leadership": row["Leadership"],
                "contactPerson": row["Contact person"],
                "address": row["Address"],
                "contactInfo": row["Contact Information"],
                "protocol": row["Protocol"],
                "concerns": row["Concerns - Issues"],
                "about": row["History"],
                "spread": row["Project Spreads"],
                "web": row["Community Website"],
                "map": row["mapFile"],
                "srcTxt": row["Source"],
                "srcLnk": row["Link"],
                "pronounce": row["Pronounciation"],
                "election": row["nextElection"],
                "spreadNumber": row["spreadNumber"]}

    for i, row in df.iterrows():
        if not row["mapFile"]:
            landKey = row["Community"]
        else:
            landKey = row["mapFile"]

        if landKey in land and land[landKey]["loc"][0] == row["Lat"] and land[landKey]["loc"][1] == row["Long"]:
            print("Error: "+landKey+" already processed!")
        else:
            land[landKey] = {"loc": [row["Lat"], row["Long"]],
                             "info": [addInfo(row)]}

    with open('../company_data/community_profiles/community_info.json', 'w') as fp:
        json.dump(land, fp)
    return df


if __name__ == "__main__":
    print("updating tranditional territory metadata...")
    df_community = processTerritoryInfo()
    print("done!")
