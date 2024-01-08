var yargs = require('yargs');
const IOView = require('./IOView');
const LinkCrawler = require('./LinkCrawler.js');
const logger = require('../Logger/logger.js');
const { performance } = require('perf_hooks');
const MessageHandler = require('./messageHandler.js');

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
    //help
    yargs.help('h');
    //alias
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
        MessageHandler.errorMessageHandler(err);
        return;
    }

    // loop from here
    for (const target of targets) {
        const startTime = performance.now();

        var AllURLs = await LinkCrawler.crawler(target, depth, blacklistPath, onlyBase);

        IOView.saveResults(target, resultPath, AllURLs);

        const endTime = performance.now();
        const executionTimeInSeconds = (endTime - startTime) / 1000;

        MessageHandler.infoMessageHandler(`${target} 의 sublink 탐색에 소요된 시간: ${executionTimeInSeconds} 초`);
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
