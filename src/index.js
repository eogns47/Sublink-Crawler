var yargs = require('yargs');
const IOView = require('./IOView');
const LinkCrawler = require('./LinkCrawler.js');
const logger = require('../Logger/logger.js');

function printVerbose(text, verboseLevel = verbose) {
    if (verboseLevel) {
        // may be changed to integer later on
        console.log(text);
    }
}

// arg: [alias, nargs, isrequired, defaultValue]
const argsMap = {
    t: ['targets', 'Input file path', true, 'targets.txt'],
    u: ['url', 'Targets array list', false, ['https://www.twitter.com']], // unhandled
    r: ['results', 'Output file path', false, 'results.txt'],
    d: ['depth', 'Crawling depth', false, 1],
    b: ['blacklist', 'Blacklist file path to prevent an url for being crawled (hard match)', false, './blacklist.txt'],
    full: ['full', 'Use full url for crawling instead of its base', false, false],
    v: ['verbose', 'Verbosity level', false, true],
    base: ['base', 'Must include the base url to except external links when crawling', false, false],
};

function cliHandler(yargs, argsMap) {
    const targetOptKW = 't';
    const resultOptKW = 'r';
    const onlyBaseOptKW = 'base';
    const verboseOptKW = 'v';
    // https://github.com/yargs/yargs/blob/master/docs/examples.md
    // generate aliases and descriptions
    for (const [key, value] of Object.entries(argsMap)) {
        yargs.describe(key, value[1]);
    }

    yargs.usage('Usage: node $0 -' + targetOptKW + ' targets.txt -' + resultOptKW + ' results.txt [options]');
    //도움말
    yargs.help('h');
    //별칭
    yargs.alias('h', 'help');
    yargs.demandOption([targetOptKW]);
    yargs.boolean(['h']);
    yargs.boolean([onlyBaseOptKW]);
    yargs.boolean([verboseOptKW]);

    yargs.epilog('-kangmanjoo InfoSec 2024-');

    return yargs;
}

// Main
async function main(targetPath, resultPath, blacklistPath, depth, full, onlyBase) {
    try {
        // see if target file exists
        var targets = await IOView.readTargets(targetPath);
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
                var results = await LinkCrawler.scrap(curURL);

                var resultSet = Array.from(new Set(results)); // Remove duplicates

                // Filtering results with blacklist
                var resultFiltered = await LinkCrawler.blacklistFilter(resultSet, blacklistPath);
                resultFiltered = LinkCrawler.httpFilter(resultFiltered);

                // Depth-level Reporting to file
                if (onlyBase) {
                    resultFiltered = LinkCrawler.IncludeBaseURLFIlter(resultFiltered, target);
                }

                postURLs.push(...resultFiltered); // output as input for next iter
            }
            var postURLs = Array.from(new Set(postURLs)); // Remove duplicates

            // exclude scrapped targets on next iter
            const combinedArray = [...preURLs, ...curURLs];
            postURLs = postURLs.filter((r) => !combinedArray.includes(r));

            // Depth-level Reporting to file

            // count postURLs print
            printVerbose('NEW URL Set counts: ' + postURLs.length);
            printVerbose('='.repeat(100) + '\n');

            // add scrapped URLs to preURLs
            preURLs = preURLs.concat(curURLs);

            curURLs = postURLs;

            currDepth++;
        }
        preURLs = preURLs.concat(curURLs);

        endResult[target] = preURLs;

        IOView.writeResults(endResult, resultPath);
        logger.log('info', '에러처리');

        const endTime = performance.now();
        const executionTimeInSeconds = (endTime - startTime) / 1000;

        console.log(`${target}의 sublink 탐색에 소요된 시간: ${executionTimeInSeconds} 초`);
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
const verbose = args.v !== undefined ? args.v : argsMap['v'][3]; // accessed globally by printVerbose
const onlyBase = args.base ? args.base : argsMap['base'][3];

main(targetPath, resultPath, blacklistPath, depth, full, onlyBase);
