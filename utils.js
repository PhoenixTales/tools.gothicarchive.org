import fs from 'node:fs';
import path from 'node:path';

const utils = {
  /**
   * @param {string} dirPath 
   * @returns {string[]}
   */
  listRecursively(dirPath) {
    const files = [];
    const children = fs.readdirSync(dirPath);
    for(let child of children) {
      const childPath = path.resolve(dirPath, child);
      const childStat = fs.statSync(childPath);
      if (childStat.isFile()) {
        files.push(childPath);
        continue;
      }
      if (childStat.isDirectory()) {
        if (child.startsWith(".")) {
          continue;
        }
        const grandChildren = this.listRecursively(childPath);
        files.push(... grandChildren);
      }
    }
    return files;
  },

  /**
   * @param {string} filePath 
   * @returns {string}
   */
  getExtension(filePath) {
    return filePath.replace(new RegExp(".*\\.", "g"), "").toLowerCase();
  }
}

export default utils;
