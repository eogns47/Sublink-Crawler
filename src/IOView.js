const fs = require('fs');
// Read targets from a file
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

    fs.writeFileSync(resultPath, JSON.stringify(urlSet, null, 4));
}

module.exports = {
    readTargets,
    writeResults,
};
