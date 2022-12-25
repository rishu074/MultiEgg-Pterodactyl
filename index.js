/*

The DNxRG Egg
This egg was built with the help of brain and is licenced.

By running this code, you agree to the license in LICENSE file at the root.
*/
import print from "./src/printer/big.js"
import small from "./src/printer/small.js"
import initLicence from "./src/licence/init.js"
import brand from "./src/startup/brand.js"
import page from "./src/pages/page.js"
import Config from "./src/config/config.js"

(
    async () => {
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
)();




