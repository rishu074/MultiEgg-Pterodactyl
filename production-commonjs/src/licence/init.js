const error = require("../printer/error.js")
const axios = require("axios")

module.exports = async function initLicence() {
    const licenceURL = process.env.LICENCE
    if(!licenceURL) {
        error("No licence was provided.")
        process.exit(1)
    }

    const url = "https://admin.dnxrg.com/file/licenses/" + licenceURL + ".json"

    // fetch the licence
    let licenceResponse
    try {
        licenceResponse = await axios.get(url, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
    } catch (err) {
        error("An error occurred while fetching the licence")
        error(err.message)
        process.exit(1)
    }

    if(await licenceResponse.status != 200) {
        error("An error occurred while fetching the licence")
        process.exit(1)
    }

    process.licence = await licenceResponse.data
}
