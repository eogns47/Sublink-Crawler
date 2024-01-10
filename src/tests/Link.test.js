import { formatURL } from '../LinkCrawler.js';
import { IncludeBaseURLFIlter } from '../LinkPreprocessor.js';
import { httpFilter } from '../LinkPreprocessor.js';
import { blacklistFilter } from '../LinkPreprocessor.js';
import Validator from '../Validator.js';

describe('📜 Link PreProcessing Test 📜', () => {
    test('formatURL() test', async () => {
        const base = 'https://www.naver.com';
        const href = '/main';
        const result = await formatURL(href, base);
        expect(result).toBe('https://www.naver.com/main');
    });
    test('include base url filter test', async () => {
        const base = 'https://www.naver.com';
        const urls = ['https://www.naver.com/main', 'https://www.naver.com/', 'www.naver.com/'];
        const result = IncludeBaseURLFIlter(urls, base);
        expect(result).toEqual(['https://www.naver.com/main', 'https://www.naver.com/', 'www.naver.com/']);
    });
    test('not include base url filter test', async () => {
        const base = 'https://www.naver.com';
        const urls = ['https://www.google.com/main', 'https://www.naver.com/main'];
        const result = IncludeBaseURLFIlter(urls, base);
        expect(result).toEqual(['https://www.naver.com/main']);
    });
    test('http filter test', async () => {
        const urls = ['https://www.naver.com/main', 'www.naver.com/'];
        const result = httpFilter(urls);
        expect(result).toEqual(['https://www.naver.com/main']);
    });
    // test('blacklist filter test', async () => {
    //     const urls = ['https://www.naver.com/main', 'https://www.naver.com/', 'someurl.com/'];
    //     const blacklistPath = 'blacklist.txt';
    //     const result = await blacklistFilter(urls, blacklistPath);
    //     expect(result).toEqual(['someurl.com/']);
    // });
    test('validate link is web page test', async () => {
        const url = 'https://www.naver.com/main';
        const result = await Validator.validateIncludeExtension(url);
        expect(result).toBe(false);
    });
    test('validate link is not web page test', async () => {
        const url = 'https://www.naver.com/main.PDF';
        const result = await Validator.validateIncludeExtension(url);
        expect(result).toBe('.pdf');
    });
    test('validate link is not web page test', async () => {
        const url = 'https://www.naver.com/main.PNG';
        const result = await Validator.validateIncludeExtension(url);
        expect(result).toBe('.png');
    });
});
