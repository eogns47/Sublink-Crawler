// Enum 클래스 정의
const ExtensionsEnum = {
    TXT: '.txt',
    JPG: '.jpg',
    GIF: '.gif',
    PDF: '.pdf',
    PNG: '.png',
    HWP: '.hwp',
    EXE: '.exe',
    XLS: '.xls',
    XLSX: '.xlsx',
    CSV: '.csv',
    XLSM: '.xlsm',
    CHM: '.chm',
    LMK: '.lmk',
};

// 확장자 배열 생성
const extensions = Object.values(ExtensionsEnum);

// 확장자 배열을 확장자 맵으로 변환
const extensionMap = extensions.reduce((map, ext) => {
    map[ext] = 0;
    return map;
}, {});

module.exports = {
    extensions,
    extensionMap,
};
