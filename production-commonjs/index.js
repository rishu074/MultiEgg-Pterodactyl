/*

The DNxRG Egg
This egg was built with the help of brain and is licenced.

By running this code, you agree to the license in LICENSE file at the root.
*/
const initLicence = require("./src/licence/init.js")
const brand = require("./src/startup/brand.js")
const page = require("./src/pages/page.js")
const Config = require("./src/config/config.js")

async function INIT() {
    await initLicence()
    await brand()

    /*
        The config part
    */
    const ConfigInstance = new Config()
    ConfigInstance.loadConfig()
    process.ConfigInstance = ConfigInstance

    process.on('uncaughtException', (error, origin) => {
        console.log("There was an error while perforiming")
        console.log(origin)
        console.log(error)
        process.exit(1)
    })

    page()
}

INIT()




