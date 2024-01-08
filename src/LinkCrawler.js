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
        if (LinkPreprocessor.validateLinkIsWebPage(curURL) == false) continue;
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
    try {
        const browser = await puppeteer.launch({
            args: [
                '--disable-gpu', // GPU 가속 비활성화
                '--disable-font-subpixel-positioning', // 폰트 서비스 비활성화
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', //dont use shared memory
            ],
        });

        var urls = []; // not a set just in case number of occurence needs to be counted
        const page = await browser.newPage(); // create new page
        await page.exposeFunction('formatURL', formatURL);

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36'
        );

        const response = await page.goto(target, { waitUntil: 'networkidle2', timeout: 0 }); // access target

        await page.waitFor(3000);
        const pageUrl = page.url();

        // scrapping
        var curr_page_urls = [];
        curr_page_urls = await get_a_Tag(page);

        await page.close();
        urls = urls.concat(curr_page_urls);
        //curr_contesnts = await page.content();
        //fs.writeFileSync('../results/contents.txt', JSON.stringify(curr_contesnts, null, 4));

        await browser.close();
        return urls;
    } catch (error) {
        MessageHandler.errorMessageHandler(error);
        return []; // 또는 에러를 throw하여 상위에서 처리하도록 변경할 수 있습니다.
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
    printVerbose('🚀Target: ' + target + ' Crawling Started !\n');

    while (currDepth < depth + 1) {
        // scrap till depth
        printVerbose('Depth ' + currDepth + ' commenced');
        printVerbose('-'.repeat(100));
        printVerbose('URL Set counts: ' + curURLs.length);
        var postURLs = await scrapAllURLs(curURLs, target, blacklistPath, onlyBase);
        // exclude scrapped targets on next iter
        postURLs = await excludeScrappedURLs(postURLs, preURLs, curURLs);

        // count postURLs print
        printVerbose('NEW URL Set counts: ' + postURLs.length);
        printVerbose('-'.repeat(100) + '\n');

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
