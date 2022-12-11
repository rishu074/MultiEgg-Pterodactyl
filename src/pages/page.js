import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import performEntryScripts from "./entryscripts/perform.js";
import chalk from "chalk";
import readline from 'readline/promises'

export default async function () {
    licenceChecker()

    const { pages } = process.licence
    if(!pages || !pages.default || !pages[pages.default] || !pages[pages.default].font || !pages[pages.default].textColor || !pages[pages.default].options || pages[pages.default].options.length === 0) {
        error("No page found to display!")
        process.exit(1)
    }
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const page = pages[pages.default]
    if(page.scripts && page.scripts.length != 0) {
        performEntryScripts(page.scripts)
    }
    custom(page.title, page.font, page.textColor)
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")

    // options
    for(let i = 0; i < page.options.length; i++) {
        const option = page.options[i]
        if(chalk[option.textColor]) {
            console.log(chalk[option.textColor](`${option.value}) ${option.name}`))
        } else {
            console.log(chalk.cyanBright(`${option.value}) ${option.name}`))
        }
    }

    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")

    const chosen = await rl.question("")
    console.log(await chosen)

}