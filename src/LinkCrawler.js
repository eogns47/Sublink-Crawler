('use strict'); // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Strict_mode
// restricts some of the language's features that are confusing or poorly thought out

const IOView = require('./IOView.js');
const LinkPreprocessor = require('./LinkPreprocessor.js');
const MessageHandler = require('./messageHandler.js');
const url = require('url');
const puppeteer = require('puppeteer');
var yargs = require('yargs');
const { on } = require('events');
const { get } = require('http');
const printVerbose = IOView.printVerbose;
const fs = require('fs');
const logger = require('../Logger/logger.js');
const Validator = require('./Validator.js');
const chalk = require('chalk');
const shell = require('shelljs');
// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

function formatURL(href, base) {
    try {
        return url.format(new URL(href), { fragment: false });
    } catch (e) {
        return url.format(new URL(href, base), { fragment: false });
    }
}

async function scrapAllURLs(curURLs, target, blacklistPath, onlyBase) {
    var postURLs = [];
    for (const curURL of curURLs) {
        // Main
        if ((await Validator.validateIncludeExtension(curURL)) != false) continue;
        if ((await Validator.validateLinkIncludeBaseURl(curURL, target)) == false) continue;

        var results = await scrap(curURL);

        var resultSet = Array.from(new Set(results)); // Remove duplicates

        // Filtering results with blacklist
        var resultFiltered = await LinkPreprocessor.filtering(onlyBase, resultSet, target, blacklistPath);
        postURLs.push(...resultFiltered); // output as input for next iter
    }
    return Array.from(new Set(postURLs));
}

// Scrap
async function scrap(target) {
    const browser = await puppeteer.launch({
        // executablePath: '/usr/bin/chromium-browser',
        headless: true,
        ignoreHTTPSErrors: true,
        ignoreHTTPErrors: true,
        args: [
            '--disable-gpu', // gpu x
            '--disable-font-subpixel-positioning', //disable font subpixel
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', //dont use shared memory
            '--window-size=1920x1080',
        ],
    });
    try {
        var urls = []; // not a set just in case number of occurence needs to be counted
        const page = await browser.newPage(); // create new page
        await page.exposeFunction('formatURL', formatURL);

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36'
        );
        for (i = 0; i < 5; i++) {
            try {
                const response = await page.goto(target, { waitUntil: 'networkidle2' }); // access target
                break;
            } catch (error) {
                MessageHandler.errorMessageHandler('!! ' + error + ' !! \nRetry ' + (i + 1) + ' times ...');
                continue;
            }
        }
        await page.waitFor(3000);
        const pageUrl = page.url();

        // scrapping
        var curr_page_urls = [];
        curr_page_urls = await get_a_Tag(page);

        urls = urls.concat(curr_page_urls);
        await page.close();

        return urls;
    } catch (error) {
        MessageHandler.errorMessageHandler('!!!!! ' + error + ' !!!!!');
        // 에러가 난 경우 target을 results 하위 urls 하위에 텍스트파일로 저장
        IOView.writeErrorResults(target);
        return []; // or throw error to handle it in the upper level
    } finally {
        await Promise.all((await browser.pages()).map((page) => page.close()));
        await browser.close();
        // shell.exec('pkill chrome');
        // shell.exec('pkill chromium');
    }
}

async function get_a_Tag(page) {
    const pageUrl = page.url();
    var curr_page_urls = [];
    return (curr_page_urls = await page.evaluate(
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
    ));
}

function excludeScrappedURLs(postURLs, preURLs, curURLs) {
    const combinedArray = [...preURLs, ...curURLs];
    if (!Array.isArray(postURLs)) {
        MessageHandler.errorMessageHandler('postURLs is not an array');
        return [];
    } else return postURLs.filter((r) => !combinedArray.includes(r));
}

async function crawler(target, depth, blacklistPath, onlyBase) {
    var currDepth = 1;

    var preURLs = [];
    var curURLs = [];
    curURLs.push(target);

    printVerbose('='.repeat(100) + '\n');
    printVerbose('🚀Target: ' + chalk.green(target) + ' Crawling Started !\n');

    while (currDepth < depth + 1) {
        // scrap till depth
        printVerbose('Depth ' + chalk.green(currDepth) + ' commenced');
        printVerbose('-'.repeat(100));
        printVerbose('URL Set counts: ' + curURLs.length + '\n');
        var postURLs = await scrapAllURLs(curURLs, target, blacklistPath, onlyBase);
        // exclude scrapped targets on next iter
        postURLs = await excludeScrappedURLs(postURLs, preURLs, curURLs);

        // count postURLs print
        MessageHandler.infoMessageHandler(
            'NEW URL Set counts of ' + target + ' in depth ' + currDepth + ' : ' + postURLs.length
        );
        printVerbose('\n');

        // add scrapped URLs to preURLs
        preURLs = preURLs.concat(curURLs);
        curURLs = postURLs;
        currDepth++;
    }

    preURLs = preURLs.concat(curURLs);
    return preURLs;
}

module.exports = {
    scrap,
    crawler,
    formatURL,
};
