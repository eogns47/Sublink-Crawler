const IOView = require('../IOView');
const path = require('path');
const fs = require('fs');

describe('📜 File Read Test 📜', () => {
    test('readTargets() test - file not found', async () => {
        // 파일이 존재하지 않는 경우
        await expect(IOView.readTargets('nonExist.txt')).rejects.toThrow('File does not exists: nonExist.txt');
    });

    test('classifyExtension() test', async () => {
        /*    TXT: '.txt',
                JPG: '.jpg',
                GIF: '.gif',
                PDF: '.pdf',
                PNG: '.png',
                HWP: '.hwp',
                EXE: '.exe',
                XLS: '.xls',
                XLSX: '.xlsx',
                CSV: '.csv',
                XLSM: '.xlsm',*/
        const dummy = [
            'dummy',
            'dummy.pdf',
            'dummy.PNG',
            'dummy.html',
            'dummy.js',
            'dummy.css',
            'dummy.txt',
            'dummy.PDF',
        ];
        const result = await IOView.classifyExtension(dummy);
        expect(result).toEqual({
            '.txt': 1,
            '.jpg': 0,
            '.gif': 0,
            '.pdf': 2,
            '.png': 1,
            '.hwp': 0,
            '.exe': 0,
            '.xls': 0,
            '.xlsx': 0,
            '.csv': 0,
            '.xlsm': 0,
        });
    });
});
