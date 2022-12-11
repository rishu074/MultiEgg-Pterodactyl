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
        console.log(await licenceResponse.data)
    } catch (error) {
        error("An error occurred while fetching the licence")
        console.log(error.message)
        process.exit(1)
    }
}