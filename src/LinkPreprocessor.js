const url = require('url');
const MessageHandler = require('./messageHandler.js');
const IOView = require('./IOView.js');

// Filter for blacklist (result will still be recorded, but wont be crawled)
async function blacklistFilter(urls, blacklistPath) {
    try {
        // hard match
        const blacklisted = await IOView.readTargets(blacklistPath);
        console.log(blacklisted.toString());
        // filter urls for those entries
        return urls.filter((url) => {
            return !blacklisted.some((entry) => url.includes(entry));
        });
    } catch (error) {
        MessageHandler.errorMessageHandler('Error reading blacklist file: ' + error);
        return urls;
    }
}

//filter for url not start with http
function httpFilter(urls) {
    return urls.filter((url) => {
        return url.startsWith('http');
    });
}

function IncludeBaseURLFIlter(urls, base) {
    // Remove "www." from the URL. Extract the part that follows
    const filteredBase = extractProtocolNextPart(base);

    // Returns false if the input string contains that part
    return urls.filter((url) => {
        return url.includes(filteredBase);
    });
}

function extractProtocolNextPart(url) {
    // Extract the part that follows the protocol
    const protocols = ['http://', 'https://', 'www.'];
    let nextPart = url;

    for (const protocol of protocols) {
        const protocolIndex = url.indexOf(protocol);
        if (protocolIndex !== -1) {
            nextPart = url.slice(protocolIndex + protocol.length);
        }
    }
    return nextPart;
}

async function filtering(onlyBase, resultSet, target, blacklistPath) {
    var resultFiltered = resultSet;
    if (blacklistPath != undefined) {
        resultFiltered = await blacklistFilter(resultSet, blacklistPath);
    }
    resultFiltered = httpFilter(resultFiltered);

    // Depth-level Reporting to file
    if (onlyBase) {
        resultFiltered = IncludeBaseURLFIlter(resultFiltered, target);
    }

    return resultFiltered;
}
module.exports = {
    filtering,
    blacklistFilter,
    httpFilter,
    IncludeBaseURLFIlter,
    extractProtocolNextPart,
};
