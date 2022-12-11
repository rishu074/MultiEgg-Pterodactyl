import chalk from "chalk";
import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import { spawn } from 'child_process'
// import performEntryScripts from "./entryscripts/perform.js";

export default function (andea) {
    licenceChecker()
    const { andeas } = process.licence

    if (!andeas[andea] || !andeas[andea].type || !andeas[andea].exec) {
        error("No andea found the this name.")
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
    if (andea.title && andea.font && andea.textColor) custom(andea.title, andea.font, andea.textColor)

    try {
        const runner = spawn(andea.exec[0].command)
        console.log(chalk.greenBright(andea.exec[0].message))
        console.log(andea.exec[0].command.split(" ")[0], andea.exec[0].command.split(" ").slice(1))
        console.log(chalk.greenBright(andea.exec[0].message))
        if (andea.type === "a") {
            runner.stdout.pipe(process.stdout)
            runner.stderr.pipe(process.stdout)
        }

        runner.on('error', (err) => {
            error("There was an error while executing the andeas")
            error(err.message)
            process.exit(1)
        })

        const restParameters = andea.exec.slice(1)

        restParameters.map((v, i) => {
            console.log(chalk.greenBright(v.message))
            runner.stdin.write(v.command)
        })
    } catch (err) {
        error("There was an error while executing the andeas")
        error(err.message)
        process.exit(1)
    }
}