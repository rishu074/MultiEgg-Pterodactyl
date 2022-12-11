import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import performEntryScripts from "./entryscripts/perform.js";
import chalk from "chalk";
import readline from 'readline/promises'

export default async function () {
    licenceChecker()

    const { pages } = process.licence
    if (!pages || !pages.default || !pages[pages.default] || !pages[pages.default].font || !pages[pages.default].textColor || !pages[pages.default].options || pages[pages.default].options.length === 0) {
        error("No page found to display!")
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
        performEntryScripts(page.scripts)
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
        if (option.top && option.top.length != 0) {
            const top = option.top
            top.map((v, i) => {
                const top = v
                if (chalk[top.textColor]) {
                    console.log(chalk[top.textColor](top.text))
                } else {
                    console.log(chalk.cyanBright(top.text))
                }
            })
        }


        if (chalk[option.textColor]) {
            console.log(chalk[option.textColor](`${option.value}) ${option.name}`))
        } else {
            console.log(chalk.cyanBright(`${option.value}) ${option.name}`))
        }

        if (option.bottom && option.bottom.length != 0) {
            const bottom = option.bottom
            bottom.map((v, i) => {
                const bottom = v
                if (chalk[bottom.textColor]) {
                    console.log(chalk[bottom.textColor](bottom.text))
                } else {
                    console.log(chalk.cyanBright(bottom.text))
                }
            })
        }

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

    const chosen = await rl.question("")
    console.log(await chosen)

}