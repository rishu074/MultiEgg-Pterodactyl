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

(
    async () => {
        await initLicence()
        brand()
        page()
    }
)()

