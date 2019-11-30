#!/usr/bin/env node

const yargs = require("yargs");
const fs = require('fs');
const path = require('path');

const options = yargs
 .usage("Usage: -d directory")
 .option("d", { alias: "directory", describe: "Directory to be scanned", type: "string", demandOption: true })
 .argv;

 var errors = [];

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

function checkImageLink(pathList) {
    if (!pathList) return [[], []];

    var internalPaths = [];
    var externalPaths = []; // everything that is not referring to /images directory

    for (var i = 0; i < pathList.length; i++) {
        var firstIndex = pathList[i].indexOf("](");
        var newImagePath = pathList[i].substring(firstIndex + 2, pathList[i].length - 1);
        if (newImagePath.indexOf("/images") == 0) {
            internalPaths.push(newImagePath);
        } else {
            externalPaths.push(newImagePath);
        }
    }
    return [internalPaths, externalPaths];
}

function checkIfImageExists(pathList) {
    if (!pathList) return [];

    let deadPaths = [];

    for (var i = 0; i < pathList.length; i++) {
        if (!fs.existsSync("." + pathList[i])) {
            deadPaths.push(pathList[i]);
        }
    }
    return deadPaths;
}

function mainImageCheck(filePath) {
    var contents = fs.readFileSync(filePath, 'utf8');
    var regex = /(\!\[.*\]\(.*\))/g;
    var pathList = contents.match(regex);

    const emptyPaths = checkIfEmpty(pathList);
    if (emptyPaths.length > 0) 
        errors.push([filePath, "The following image tags are incomplete:", emptyPaths]);

    const [internalPaths, externalPaths] = checkImageLink(pathList);
    if (externalPaths.length > 0)
        errors.push([filePath, "The following links should refer to internal /images directory:", externalPaths]);
    
    const deadPaths = checkIfImageExists(internalPaths);
    if (deadPaths.length > 0)
        errors.push([filePath, "The following images are referred in markdown files, but don't exist in local /images directory:", deadPaths]);
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory ? 
        walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
  };


walkDir(options.directory, function(filePath) {
    if (path.extname(filePath) == '.md') {
        mainImageCheck(filePath);
    }
});

if (errors.length > 0) {
    console.error("There are errors to be fixed:");
    for (let i = 0; i < errors.length; i++) {
        console.log("-");
        console.log("File:", errors[i][0]);
        console.log("Error:", errors[i][1]);
        let temp = errors[i][2];
        for (let j = 0; j < temp.length; j++) {
            console.log(temp[j]);
        }
    }
    process.exit(1);
} else {
    console.log("All image tags are correct and functional. Good job!");
}
