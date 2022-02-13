import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const __dirname = path.resolve();

// Trans Mountain asset data
const pathToTm = path.resolve(
  __dirname,
  "src",
  "company_data",
  "trans_mountain_files"
);
const tmSimplify = 50;
const tmPrecision = 0.0001;

// First Nations Reserve data
const pathToLand = path.resolve(
  __dirname,
  "src",
  "company_data",
  "TransMountainPipelineULC"
);

const landSimplify = 50;
const landPrecision = 0.0001;

// Traditional Territory data
const pathToTerr = path.resolve(
  __dirname,
  "src",
  "company_data",
  "community_profiles"
);

const terrSimplify = 60;
const terrPrecision = 0.01;

function simplifyMaps(
  pathToFiles: string,
  simplify: number,
  precision: number,
  includeFiles: string[] = []
) {
  let fileList: string[];
  if (includeFiles.length === 0) {
    fileList = fs.readdirSync(pathToFiles);
  } else {
    fileList = includeFiles;
  }
  fileList.forEach((tmFile) => {
    if (!tmFile.includes(".min.")) {
      const absolutePath = path.join(pathToFiles, tmFile);
      const fileNoExt = `${tmFile.split(".")[0]}.min.json`;
      execSync(
        `mapshaper -i ${absolutePath} -proj EPSG:4269 -simplify ${simplify}% keep-shapes -o force ${path.join(
          pathToFiles,
          fileNoExt
        )} precision=${precision}`
      );
    }
  });
}

simplifyMaps(pathToTm, tmSimplify, tmPrecision);
simplifyMaps(pathToLand, landSimplify, landPrecision, ["poly1.json"]);
simplifyMaps(pathToTerr, terrSimplify, terrPrecision, [
  "indigenousTerritoriesCa.json",
]);
