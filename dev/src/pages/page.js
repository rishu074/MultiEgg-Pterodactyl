import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import performEntryScripts from "./entryscripts/perform.js";
import chalk from "chalk";
import readline from 'readline/promises'
import subPage from "./sub-page.js";
import options from "./option.js";
import andea from "./andea.js";
import parseThisString from "./parsers/ParseAnyStringWithENV.js";

export default async function () {
    licenceChecker()

    const { pages } = process.licence
    const ConfigInstance = process.ConfigInstance
    if (!pages || !pages.default || !pages[pages.default] || !pages[pages.default].options || pages[pages.default].options.length === 0) {
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
                console.log(chalk[top.textColor](parseThisString(top.text)))
            } else {
                console.log(chalk.cyanBright(parseThisString(top.text)))
            }
        })
    }

    /*
        The main Title
    */
   if(page.title) {
       custom(parseThisString(page.title), page.font, page.textColor, page.fontSize, page.fontHorizontalLayout, page.fontVerticalLayout)
   }


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
                console.log(parseThisString(chalk[bottom.textColor](bottom.text)))
            } else {
                console.log(parseThisString(chalk.cyanBright(bottom.text)))
            }
        })
    }

    while (true) {
        let chosen

        // handle config
        if (page.config_variable && ConfigInstance.configEnabled && ConfigInstance.getValue(page.config_variable) && validOptions[ConfigInstance.getValue(page.config_variable)]) {
            chosen = ConfigInstance.getValue(page.config_variable)
        } else {
            chosen = await rl.question("")
            page.config_variable && ConfigInstance.configEnabled ? ConfigInstance.setValue(page.config_variable, await chosen) : ""
        }

        // const chosen = await rl.question("")
        if (validOptions[await chosen.toString()]) {
            const theSelectedOption = validOptions[await chosen.toString()]
            if (!theSelectedOption.href) {
                error("The was no `href` key configured on this option")
                process.exit(1)
            }
            // check if there are scripts to run onclick
            if (theSelectedOption.scripts && theSelectedOption.scripts.length != 0) {
                await performEntryScripts(theSelectedOption.scripts)
            }

            if (parseThisString(theSelectedOption.type || "page") != "andea") {
                rl.close()
                subPage(parseThisString(theSelectedOption.href.toString()))
                break;
                return
            } else {
                andea(parseThisString(theSelectedOption.href))
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