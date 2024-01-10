const fs = require('fs');
// Read targets from a file
const path = require('path');
const Extensions = require('./Config/Extensions.js');
const Validator = require('./Validator.js');
const logger = require('../Logger/logger.js');

var verboseLevel = true;

function setVerboseLevel(level) {
    verboseLevel = level;
}

async function readTargets(targetInput) {
    const targetPath = __dirname + '/../inputs/' + targetInput;

    if (fs.existsSync(targetPath)) {
        var targets = fs.readFileSync(targetPath).toString().split('\n');
        return await targets.filter(Boolean); // Filter for empty string
    } else {
        throw new Error('File does not exists: ' + targetInput);
    }
}

// Write results to a file
function writeResults(urlSet, resultOutput) {
    var resultPath = __dirname + '/../results/';
    resultPath += resultOutput ? resultOutput : 'results.txt';

    fs.appendFileSync(resultPath, JSON.stringify(urlSet, null, 4));
}

function printVerbose(text) {
    if (verboseLevel) {
        // may be changed to integer later on
        console.log(text);
    }
}

async function readExtensionConfig() {
    const filePath = path.join(__dirname, 'Config', 'Extensions.txt');
    console.log(filePath);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Extensions.txt:', err);
            return;
        }
        // read extensions from file
        Extensions = data.split('\n').map((line) => line.trim());
        console.log(Extensions);
        return Extensions;
    });
}

async function classifyExtension(AllURLs) {
    var extensions = Extensions.extensions;

    var extensionMap = extensions.reduce((map, ext) => {
        map[ext] = 0;
        return map;
    }, {});

    AllURLs.map(async (url) => {
        var ext = await Validator.validateIncludeExtension(url);
        if (ext != false) extensionMap[ext]++;
    });

    return extensionMap;
}

async function saveResults(target, resultPath, AllURLs) {
    var endResult = {};
    endResult[target] = {};
    endResult[target].Count = AllURLs.length;
    endResult[target].Extension = {};
    endResult[target].URLs = AllURLs;
    var extensionMap = await classifyExtension(AllURLs);
    endResult[target].Extension = extensionMap;

    endResult = writeResults(endResult, resultPath);
}

module.exports = {
    readTargets,
    writeResults,
    printVerbose,
    saveResults,
    readExtensionConfig,
    classifyExtension,
    setVerboseLevel,
};
