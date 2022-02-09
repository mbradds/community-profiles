import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const __dirname = path.resolve();

const pathToTm = path.resolve(
  __dirname,
  "src",
  "company_data",
  "trans_mountain_files"
);

const tmSimplify = 100;
const tmPrecision = 0.0001;

const pathToLand = path.resolve(
  __dirname,
  "src",
  "company_data",
  "TransMountainPipelineULC"
);

const landSimplify = 100;
const landPrecision = 0.0001;

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
