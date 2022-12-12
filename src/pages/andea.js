import chalk from "chalk";
import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import { spawn, execSync, spawnSync } from 'child_process'
import performEntryScripts from "./entryscripts/perform.js";

export default async function (andea) {
    licenceChecker()
    const { andeas } = process.licence

    if (!andeas[andea] || !andeas[andea].type || !andeas[andea].exec || !andeas[andea].href) {
        error("No andea found the this name or it is incorrectly configured.")
        process.exit(1)
    }

    andea = andeas[andea]

    /*
        The Top headline
    */
    if (andea.top && andea.top.length != 0) {
        const top = andea.top
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
        If there is any scripts to run.
    */
    if (andea.scripts && andea.scripts.length != 0) {
        await performEntryScripts(andea.scripts)
    }


    if (andea.title && andea.font && andea.textColor) custom(andea.title, andea.font, andea.textColor)
    console.log("\n\n")

    try {
        //execute the minimal type means execute in Synchronus Way
        // it is great for executing small commands like `cd or mkdir or curl`
        if (andea.type === "d") {
            const toExecuteCommands = andea.exec
            for (let i = 0; i < toExecuteCommands.length; i++) {
                const v = toExecuteCommands[i];

                if (v.message) console.log(v.textColor && chalk[v.textColor] ? chalk[v.textColor](v.message) : chalk.cyanBright(v.message))

                try {
                    const runner = spawnSync(v.command.split(" ")[0], [...v.command.split(" ").slice(1)], {
                        shell: true
                    })
                    // console.log(runner)
                    if (v.output) {
                        console.log(v.outputColor && chalk[v.outputColor] ? chalk[v.outputColor](runner.stdout.toString(), "\n", runner.stderr.toString()) : chalk.redBright(runner.stdout.toString(), "\n", runner.stderr.toString()))
                    }

                } catch (err) {
                    if (v.output) {
                        error(`There was an error while executing this command \`${v.command}\` ==> '${err}'`)
                    }
                }
            }
        }
    } catch (err) {
        error("There was an error while executing the andeas")
        error(err.message)
        process.exit(1)
    }
}