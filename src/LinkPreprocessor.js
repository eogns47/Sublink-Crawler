const url = require('url');

// Get combine with base url if not
function formatURL(href, base) {
    try {
        return url.format(new URL(href), { fragment: false });
    } catch (e) {
        return url.format(new URL(href, base), { fragment: false });
    }
}

module.exports = {
    formatURL,
};
