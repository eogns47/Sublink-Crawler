const LinkPreprocessor = require('./LinkPreprocessor.js');
const Extensions = require('./Config/Extensions.js');

async function validateLinkIsWebPage(url) {
    if (url.includes('.PDF') || url.includes('.PNG')) return false;
    else {
        return true;
    }
}

async function validateLinkIncludeBaseURl(url, target) {
    const base = LinkPreprocessor.extractProtocolNextPart(target);
    if (url.includes(base)) return true;
    else {
        return false;
    }
}

async function validateIncludeExtension(url) {
    var extensions = Extensions.extensions;
    for (const ext of extensions) {
        //consider when extension is uppercase
        if (url.includes(ext) || url.includes(ext.toUpperCase())) {
            return ext;
        }
    }
    return false;
}

module.exports = {
    validateLinkIsWebPage,
    validateLinkIncludeBaseURl,
    validateIncludeExtension,
};
