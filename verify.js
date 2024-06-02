#!/usr/bin/env node
import fs from 'node:fs';
import url from 'url';
import path from 'path';
import config from "./config.json" with { type: "json" };

const verifier = {
  _issues: [],
  _toolsRoot: "",
  _projectRoot: "",

  main() {
    this._init();
    this._checkRepositoriesAreCloned();
    this._reportIssues();
  },

  _init() {
    this._toolsRoot = path.dirname(url.fileURLToPath(new URL(import.meta.url)));
    this._projectRoot = this._toolsRoot + "/..";
  },

  _checkRepositoriesAreCloned() {
    const projectDirs = fs.readdirSync(this._projectRoot);
    const expectedDirs = Object.keys(config.repositories).map(name => name + "." + config.domain);
    const missingDirs = expectedDirs.filter(d => projectDirs.indexOf(d) < 0);
    for(let missingDir of missingDirs) {
      this._issues.push({ 
        type: "REPOSITORY_MISSING",
        name: missingDir
      });
    }
  },

  _reportIssues() {
    if (this._issues.length == 0) {
      console.log("no issues found");
      return;
    }
    for(let issue of this._issues) {
      console.error(JSON.stringify(issue));
    }
  }
}

verifier.main();
