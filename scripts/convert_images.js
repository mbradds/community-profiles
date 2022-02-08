import { fromPath } from "pdf2pic";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import path from "path";
import fs from "fs";

const stageLocation =
  "./src/data_management/raw_data/traditional_territory/stage_maps";

const completeLocation = "./src/company_data/community_profiles/images";

const options = {
  density: 100,
  width: 700,
  height: 700,
  savePath: stageLocation,
  format: "png",
};

function deleteDirContents(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      fs.unlink(path.join(dir, file), (err2) => {
        if (err2) throw err2;
      });
    });
  });
}

async function stageMaps(dir) {
  deleteDirContents(stageLocation);
  const files = fs.readdirSync(dir);
  return files.map((file) => {
    const absolutePath = path.join(dir, file);
    let saveFilename = file.split("/").slice(-1)[0];
    [saveFilename] = saveFilename.split(".");
    options.saveFilename = saveFilename;
    const storeAsImage = fromPath(absolutePath, options);
    const pageToConvertAsImage = 1;
    return storeAsImage(pageToConvertAsImage).then((resolve) => {
      console.log(`${file} completed staging`);
      return resolve;
    });
  });
}

function simplifyMaps() {
  console.log("Simplifying traditional territory map images...");
  deleteDirContents(completeLocation);
  return imagemin([`${stageLocation}/*.{jpg,png}`], {
    destination: completeLocation,
    plugins: [
      imageminPngquant({
        quality: [0.4, 0.4],
      }),
    ],
  });
}

async function processMaps() {
  const maps = await stageMaps(
    "./src/data_management/raw_data/traditional_territory/input_maps"
  );

  await Promise.all(maps);
  simplifyMaps();
}

processMaps();
