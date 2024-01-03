'use strict';

const url = require('url');
const fs = require('fs');
const puppeteer = require('puppeteer');
var yargs = require('yargs');
const { on } = require('events');
// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

function printVerbose(text, verboseLevel = verbose) {
    if (verboseLevel) {
        // may be changed to integer later on
        console.log(text);
    }
}

// Read targets from a file
async function readTargets(targetInput) {
    if (!targetInput) return ['https://www.youtube.com'];

    if (fs.existsSync(targetInput)) {
        var targets = fs.readFileSync(targetInput).toString().split('\n');
        return await targets.filter(Boolean); // Filter for empty string
    } else {
        throw new Error('File does not exists: ' + targetInput);
    }
}

// Write results to a file
function writeResults(urlSet, resultPath) {
    resultPath = resultPath ? resultPath : './results.txt';

    fs.writeFileSync(resultPath, JSON.stringify(urlSet, null, 4));

    // printVerbose('End Result:');
    // printVerbose(JSON.stringify(urlSet, null, 4));
    // printVerbose('='.repeat(100));
    // printVerbose('Output is written to ' + resultPath);
}

// Get combine with base url if not
function formatURL(href, base) {
    try {
        return url.format(new URL(href), { fragment: false });
    } catch (e) {
        return url.format(new URL(href, base), { fragment: false });
    }
}

// Get base url
function getBase(url) {
    var normalizedUrl = urlNormalize(url);

    return normalizedUrl.split('/').slice(0, 3).join('/'); // i.e. http://www.google.com/search?q=1337
}

// Normalize url
function urlNormalize(url) {
    url = url.split('/');
    try {
        if (url.length == 0) return 'http://' + url[0]; // i.e. www.google.com
    } catch (e) {
        printVerbose('Irregular URL Format');
    }
    return url.join('/');
}

// Filter for blacklist (result will still be recorded, but wont be crawled)
function blacklistFilter(urls, blacklistPath) {
    // hard match
    return readTargets(blacklistPath).then((blacklisted) => {
        // for every blacklist entry
        return urls.filter((url) => {
            // filter urls for those entries
            return (
                !blacklisted.includes(url) &&
                !blacklisted.some((entry) => url.startsWith(entry))
            );
        });
    });
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

    console.log(nextPart);

    return nextPart;
}
// Scrap
async function scrap(target) {
    const browser = await puppeteer.launch({ dumpio: true });

    var urls = []; // not a set just in case number of occurence needs to be counted

    const page = await browser.newPage(); // create new page
    await page.exposeFunction('formatURL', formatURL);
    const response = await page.goto(target, { waitUntil: 'load', timeout: 0 }); // access target
    await page.waitFor(5000);
    const pageUrl = page.url();

    // scrapping
    var curr_page_urls = [];
    curr_page_urls = await page.evaluate(
        async (pageUrl, curr_page_urls) => {
            const anchors = Array.from(document.querySelectorAll('a')); // get <a> tag

            for (const anchor of anchors) {
                const href = anchor.getAttribute('href'); // get href attr
                const hrefUrl = await formatURL(href, pageUrl); // get base url
                curr_page_urls.push(hrefUrl);
            }
            return curr_page_urls;
        },
        pageUrl,
        curr_page_urls
    ); //can use pageUrl and curr_page_urls directly

    await page.close();

    urls = urls.concat(curr_page_urls);

    await browser.close();
    return urls;
}

// arg: [alias, nargs, isrequired, defaultValue]
const argsMap = {
    t: ['targets', 'Input file path', true, './targets.txt'],
    u: ['url', 'Targets array list', false, ['https://www.twitter.com']], // unhandled
    r: ['results', 'Output file path', false, './results.txt'],
    d: ['depth', 'Crawling depth', false, 1],
    b: [
        'blacklist',
        'Blacklist file path to prevent an url for being crawled (hard match)',
        false,
        './blacklist.txt',
    ],
    full: [
        'full',
        'Use full url for crawling instead of its base',
        false,
        false,
    ],
    v: ['verbose', 'Verbosity level', false, true],
    base: [
        'base',
        'Must include the base url to except external links when crawling',
        false,
        false,
    ],
};

function cliHandler(yargs, argsMap) {
    const targetOptKW = 't';
    const resultOptKW = 'r';
    const onlyBaseOptKW = 'base';
    // https://github.com/yargs/yargs/blob/master/docs/examples.md
    // generate aliases and descriptions
    for (const [key, value] of Object.entries(argsMap)) {
        yargs.describe(key, value[1]);
    }

    yargs.usage(
        'Usage: node $0 -' +
            targetOptKW +
            ' ./targets.txt -' +
            resultOptKW +
            ' ./results.txt [options]'
    );
    //도움말
    yargs.help('h');
    //별칭
    yargs.alias('h', 'help');
    yargs.demandOption([targetOptKW]);
    yargs.boolean(['h']);
    yargs.boolean([onlyBaseOptKW]);
    yargs.epilog('-kangmanjoo InfoSec 2024-');

    return yargs;
}

// Main
async function main(
    targetPath,
    resultPath,
    blacklistPath,
    depth,
    full,
    onlyBase
) {
    try {
        // see if target file exists
        var targets = await readTargets(targetPath);
    } catch (err) {
        console.log(err.message);
        return;
    }

    // loop from here
    for (const target of targets) {
        const startTime = performance.now();

        var endResult = {};
        var currDepth = 1;

        var preURLs = [];
        preURLs.push(target);
        var curURLs = [];
        curURLs.push(target);

        while (currDepth < depth + 1 && targets.length > 0) {
            // scrap till depth
            printVerbose('Depth ' + currDepth + ' commenced');
            printVerbose('-'.repeat(100));
            printVerbose('URL Set counts: ' + curURLs.length);

            var postURLs = [];

            for (const curURL of curURLs) {
                // Main
                var results = await scrap(curURL);

                var resultSet = Array.from(new Set(results)); // Remove duplicates

                // Filtering results with blacklist
                var resultFiltered = await blacklistFilter(
                    resultSet,
                    blacklistPath
                );
                resultFiltered = httpFilter(resultFiltered);

                // Depth-level Reporting to file
                if (onlyBase) {
                    resultFiltered = IncludeBaseURLFIlter(
                        resultFiltered,
                        target
                    );
                }

                postURLs.push(...resultFiltered); // output as input for next iter
            }
            var postURLs = Array.from(new Set(postURLs)); // Remove duplicates

            // exclude scrapped targets on next iter
            const combinedArray = [...preURLs, ...curURLs];
            postURLs = postURLs.filter((r) => !combinedArray.includes(r));

            // Depth-level Reporting to file
            printVerbose('='.repeat(100));

            // count postURLs print
            printVerbose('Depth : ' + currDepth);
            printVerbose('NEW URL Set counts: ' + postURLs.length);

            // add scrapped URLs to preURLs
            preURLs = preURLs.concat(curURLs);

            curURLs = postURLs;

            currDepth++;
        }
        preURLs = preURLs.concat(curURLs);

        endResult[target] = preURLs;

        writeResults(endResult, resultPath);

        const endTime = performance.now();
        const executionTimeInSeconds = (endTime - startTime) / 1000;

        console.log(
            `${target}의 sublink 탐색에 소요된 시간: ${executionTimeInSeconds} 초`
        );
    }
}

// Execution
yargs = cliHandler(yargs, argsMap);

const args = yargs.argv;
const targetPath = args.t ? args.t.toString() : undefined;
const resultPath = args.r ? args.r.toString() : undefined;
const blacklistPath = args.b ? args.b.toString() : undefined;
const depth = args.d ? parseInt(args.d.toString()) : argsMap['d'][3];
const full = args.full ? args.full : argsMap['full'][3];
const verbose = args.v ? args.v : argsMap['v'][3]; // accessed globally by printVerbose
const onlyBase = args.base ? args.base : argsMap['base'][3];

main(targetPath, resultPath, blacklistPath, depth, full, onlyBase);
