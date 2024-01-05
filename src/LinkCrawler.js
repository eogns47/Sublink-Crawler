('use strict'); // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Strict_mode
// restricts some of the language's features that are confusing or poorly thought out

const IOView = require('./IOView.js');
const LinkPreprocessor = require('./LinkPreprocessor.js');

const url = require('url');
const puppeteer = require('puppeteer');
var yargs = require('yargs');
const { on } = require('events');
// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color

function formatURL(href, base) {
    try {
        return url.format(new URL(href), { fragment: false });
    } catch (e) {
        return url.format(new URL(href, base), { fragment: false });
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
        console.error('Error reading blacklist file:', error);
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
        );

        await page.close();

        urls = urls.concat(curr_page_urls);

        await browser.close();
        return urls;
    } catch (error) {
        console.error('Error during scraping ' + target.toString() + ' : ', error);
        return []; // 또는 에러를 throw하여 상위에서 처리하도록 변경할 수 있습니다.
    }
}

module.exports = {
    scrap,
    blacklistFilter,
    httpFilter,
    IncludeBaseURLFIlter,
    extractProtocolNextPart,
};
