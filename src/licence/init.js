import error from "../printer/error.js"
import axios from "axios"

export default async function initLicence() {
    const licenceURL = process.env.LICENCE
    if(!licenceURL) {
        error("No licence was provided.")
        process.exit(1)
    }

    // fetch the licence
    let licenceResponse
    try {
        licenceResponse = await axios.get(licenceURL)
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