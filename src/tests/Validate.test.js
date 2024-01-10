const Validator = require('../Validator.js');
const LinkPreprocessor = require('../LinkPreprocessor.js');
const Extensions = require('../Config/Extensions.js');

describe('📜 Validator Test 📜', () => {
    test('validate url is not include Extensions', async () => {
        const result = await Validator.validateIncludeExtension('https://www.naver.com/main');
        expect(result).toBe(false);
    });
    test('validate url is include Extensions', async () => {
        const result = await Validator.validateIncludeExtension('https://www.naver.com/main.PDF');
        expect(result).toBe('.pdf');
    });
});
