const url = require('url');
const MessageHandler = require('./messageHandler.js');
const IOView = require('./IOView.js');

async function validateLinkIsWebPage(url) {
    if (url.includes('.PDF') || url.includes('.PNG')) return false;
    else {
        return true;
    }
}

// Filter for blacklist (result will still be recorded, but wont be crawled)
async function blacklistFilter(urls, blacklistPath) {
    try {
        // hard match
        const blacklisted = await IOView.readTargets(blacklistPath);

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
    // URL에서 "www." 다음에 오는 부분 추출
    const filteredBase = extractProtocolNextPart(base);

    // 입력된 문자열에 해당 부분이 포함되면 false 반환
    return urls.filter((url) => {
        return url.includes(filteredBase);
    });
}

function extractProtocolNextPart(url) {
    // 프로토콜 다음에 오는 부분 추출
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
    var resultFiltered = await blacklistFilter(resultSet, blacklistPath);
    resultFiltered = httpFilter(resultFiltered);

    // Depth-level Reporting to file
    if (onlyBase) {
        resultFiltered = IncludeBaseURLFIlter(resultFiltered, target);
    }

    return resultFiltered;
}

module.exports = {
    filtering,
    validateLinkIsWebPage,
    blacklistFilter,
    httpFilter,
    IncludeBaseURLFIlter,
    extractProtocolNextPart,
};
