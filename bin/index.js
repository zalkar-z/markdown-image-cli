#!/usr/bin/env node

const yargs = require("yargs");
const fs = require('fs');
const path = require('path');

const options = yargs
 .usage("Usage: -d directory")
 .option("d", { alias: "directory", describe: "Directory to be scanned", type: "string", demandOption: true })
 .argv;

function checkIfEmpty(pathList) {
    if (!pathList) return [];

    var emptyPaths = [];
    for (var i = 0; i < pathList.length; i++) {
        var currentPath = pathList[i];
        if (currentPath[1] == '[' && currentPath[2] == ']') {
            emptyPaths.push(currentPath);
        } else if (currentPath[currentPath.length - 2] == '(' 
                    && currentPath[currentPath.length - 1] == ')') {
            emptyPaths.push(currentPath);
        }
    }
    return emptyPaths;
}

function mainImageCheck(filePath) {
    var contents = fs.readFileSync(filePath, 'utf8');
    var regex = /(\!\[.*\]\(.*\))/g;
    var pathList = contents.match(regex);

    // for (var i = 0; i < pathList.length; i++) {
    //     console.log(pathList[i]);
    // }
    // console.log(pathList);

    console.log("---");
    console.log("Now checking ", filePath, "...");

    var emptyPaths = checkIfEmpty(pathList);
    if (emptyPaths.length > 0) {
        console.error("The following image tags are incomplete:");
        console.error(emptyPaths);
        process.exit(1);
    }

    console.log("Test completed. All image tags are correct and functional!");
    console.log("---");
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory ? 
        walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
  };

var totalImages = 0;

walkDir(options.directory, function(filePath) {
    if (path.extname(filePath) == '.md') {
        mainImageCheck(filePath);
    }
});


