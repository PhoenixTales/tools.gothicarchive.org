#!/usr/bin/env node
import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import config from "./config.json" with { type: "json" };
import utils from './utils.js';

const verifier = {
  _issues: [],
  _toolsRoot: "",
  _projectRoot: "",

  main() {
    this._init();
    
    this._checkRepositoriesAreCloned();
    this._checkStandardFiles();
    this._checkFileTypes();

    this._reportIssues();
  },

  _init() {
    this._toolsRoot = path.dirname(url.fileURLToPath(new URL(import.meta.url)));
    this._projectRoot = path.dirname(this._toolsRoot);
  },

  _checkRepositoriesAreCloned() {
    for(let repository in config.repositories) {
      const repositoryPath = this._getRepositoryPath(repository);
      if (! fs.existsSync(repositoryPath)) {
        this._issues.push({ 
          type: "REPOSITORY_MISSING",
          repository: repository
        });
      }
    }
  },

  _checkStandardFiles() {
    for(let repository in config.repositories) {
      const repositoryPath = this._getRepositoryPath(repository);
      for (let standardFile of config.standardFiles) {
        const expectedPath = path.resolve(repositoryPath, standardFile);
        if (! fs.existsSync(expectedPath)) {
          this._issues.push({ 
            type: "STANDARD_FILE_MISSING",
            repository: repository,
            file: standardFile
          });
        }
      }
    }
  },

  _checkFileTypes() {
    for(let repository in config.repositories) {
      const repositoryPath = this._getRepositoryPath(repository);
      const allowedTypes = /** @type {string[]} */ (config.repositories[repository].fileTypes);
      if (allowedTypes[0] == "*") {
        continue;
      }
      const allFiles = utils.listRecursively(repositoryPath);
      const standardFilesSet = new Set(config.standardFiles.map(f => path.resolve(repositoryPath, f)));
      for(let file of allFiles) {
        if (standardFilesSet.has(file)) {
          continue;
        }
        const extension = utils.getExtension(file);
        if (allowedTypes.indexOf(extension) < 0) {
          this._issues.push({ 
            type: "FILE_IN_WRONG_REPOSITORY",
            repository: repository,
            file: file.substring(repositoryPath.length+1),
            extension: extension
          });
        }
      }
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
  },

  //region utilities
  _getRepositoryPath(name) {
    return path.resolve(this._projectRoot, name + "." + config.domain);
  }
  //endregion
}

verifier.main();
