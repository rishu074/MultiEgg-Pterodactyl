import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import performEntryScripts from "./entryscripts/perform.js";
import chalk from "chalk";
import readline from 'readline/promises'
import subPage from "./sub-page.js";
import options from "./option.js";

export default async function () {
    licenceChecker()

    const { pages } = process.licence
    if (!pages || !pages.default || !pages[pages.default] || !pages[pages.default].font || !pages[pages.default].textColor || !pages[pages.default].options || pages[pages.default].options.length === 0) {
        error("No page found to display or the page was not correctly configured!")
        process.exit(1)
    }
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    /*
        Define the page and the top and bottom texts
    */
    const page = pages[pages.default]

    /*
        If there is any scripts to run.
    */
    if (page.scripts && page.scripts.length != 0) {
        await performEntryScripts(page.scripts)
    }

    /*
        The Top headline
    */
    if (page.top && page.top.length != 0) {
        const top = page.top
        top.map((v, i) => {
            const top = v
            if (chalk[top.textColor]) {
                console.log(chalk[top.textColor](top.text))
            } else {
                console.log(chalk.cyanBright(top.text))
            }
        })
    }

    /*
        The main Title
    */
    custom(page.title, page.font, page.textColor)



    let validOptions = {

    }

    // options
    for (let i = 0; i < page.options.length; i++) {
        const option = page.options[i]
        options(option, validOptions)
    }

    /*
        The Bottom headline
    */
    if (page.bottom && page.bottom.length != 0) {
        const bottom = page.bottom
        bottom.map((v, i) => {
            const bottom = v
            if (chalk[bottom.textColor]) {
                console.log(chalk[bottom.textColor](bottom.text))
            } else {
                console.log(chalk.cyanBright(bottom.text))
            }
        })
    }

    while (true) {
        const chosen = await rl.question("")
        if (validOptions[await chosen.toString()]) {
            const theSelectedOption = validOptions[await chosen.toString()]
            if (theSelectedOption.type != "andea") {
                rl.close()

                // check if there are scripts to run onclick
                if (theSelectedOption.scripts && theSelectedOption.scripts.length!= 0) {
                    await performEntryScripts(theSelectedOption.scripts)
                }
                subPage(theSelectedOption.href.toString())
                break;
                return
            } else {
                // andea here
                console.log("Hey andea")
                rl.close()
                break;
            }
        } else {
            if (chosen.toString() === "stop") {
                process.exit(0)
            }
            error("Invalid value entered.")
        }
    }
}