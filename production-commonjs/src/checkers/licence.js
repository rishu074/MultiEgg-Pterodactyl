const error = require('../printer/error.js')

module.exports = function licenceChecker() {
    const jsonData = process.licence
    if(!jsonData || typeof jsonData != "object") {
        error("The was an unexpected error while fetching the licence.")
        process.exit(1)
    }
}