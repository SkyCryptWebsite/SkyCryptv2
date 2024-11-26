import { base } from "$app/paths";
import fs from "fs-extra";
import path from "path";

export function getFolderPath() {
  return path.resolve(base);
}

export function getCacheFolderPath() {
  if (!fs.pathExistsSync(path.resolve(base, "cache"))) {
    fs.mkdirSync(path.resolve(base, "cache"));
  }

  return path.resolve(base, "cache");
}

export function getCacheFilePath(dirPath: string, type: string, name: string, format = "png") {
  const subdirs = [type];

  // for texture and head type, we get the first 2 characters to split them further
  if (type == "texture" || type == "head") {
    subdirs.push(name.slice(0, 2));
  }

  // for potion and leather type, we get what variant they are to split them further
  if (type == "leather" || type == "potion") {
    subdirs.push(name.split("_")[0]);
  }

  // check if the entire folder path is available
  if (!fs.pathExistsSync(path.resolve(dirPath, subdirs.join("/")))) {
    // check if every subdirectory is available
    for (let i = 1; i <= subdirs.length; i++) {
      const checkDirs = subdirs.slice(0, i);
      const checkPath = path.resolve(dirPath, checkDirs.join("/"));

      if (!fs.pathExistsSync(checkPath)) {
        fs.mkdirSync(checkPath);
      }
    }
  }

  return path.resolve(dirPath, `${subdirs.join("/")}/${type}_${name}.${format}`);
}
