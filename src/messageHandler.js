const logger = require('../Logger/logger.js');

function errorMessageHandler(errorMessage) {
    console.log(errorMessage);
    logger.error(errorMessage);
}

function warningMessageHandler(warningMessage) {
    console.log(warningMessage);
    logger.warn(warningMessage);
}

function infoMessageHandler(infoMessage) {
    console.log(infoMessage);
    logger.info(infoMessage);
}

function debugMessageHandler(debugMessage) {
    console.log(debugMessage);
    logger.debug(debugMessage);
}

module.exports = {
    errorMessageHandler,
    warningMessageHandler,
    infoMessageHandler,
    debugMessageHandler,
};
