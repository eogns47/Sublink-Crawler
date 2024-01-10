const logger = require('../Logger/logger.js');

function errorMessageHandler(errorMessage) {
    console.log(errorMessage);
    const cleanErrorMessage = removeEmojis(errorMessage);
    logger.error(cleanErrorMessage);
}

function warningMessageHandler(warningMessage) {
    console.log(warningMessage);
    const cleanWarningMessage = removeEmojis(warningMessage);
    logger.warn(cleanWarningMessage);
}

function infoMessageHandler(infoMessage) {
    console.log(infoMessage);
    const cleanMessage = removeEmojis(infoMessage);
    logger.info(cleanMessage);
}

function debugMessageHandler(debugMessage) {
    console.log(debugMessage);
    const cleanMessage = removeEmojis(debugMessage);
    logger.debug(cleanMessage);
}

function removeEmojis(text) {
    // 이모티콘을 걸러내는 정규 표현식
    // const emojiRegex =
    //     /[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[^\w\s!@#$%^&*(),.?":{}|<>+-=_\\\/]/g;

    // // 이모티콘을 제거한 문자열 반환
    // return text.replace(emojiRegex, '');
    return text;
}

module.exports = {
    errorMessageHandler,
    warningMessageHandler,
    infoMessageHandler,
    debugMessageHandler,
};
