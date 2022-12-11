import chalk from "chalk";
import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import { spawn, exec } from 'child_process'
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
        if (andea.type === "d") {
            const toExecuteCommands = andea.exec
            for (let i = 0; i < toExecuteCommands.length; i++) {
                const v = toExecuteCommands[i];
                
                if(v.message) console.log(chalk.greenBright(v.message))
                const runner = exec(v.command)

                runner.on('close', (code) => {
                    console.log("Program exited")
                })
                runner.stdout.pipe(process.stdout)
                runner.stderr.pipe(process.stderr)
            }
        }
        // const runner = spawn("ls", ['/home'], { detached: true, shell: true })
        // console.log(chalk.greenBright(andea.exec[0].message))
        // console.log(andea)
        // // runner.stdin.setDefaultEncoding('utf-8')

        // if (andea.type === "a") {
        //     runner.stdout.pipe(process.stdout)
        //     runner.stderr.pipe(process.stdout)
        // }

        // runner.on('error', (err) => {
        //     error("There was an error while executing the andeas")
        //     console.log(err)
        //     process.exit(1)
        // })

        // // runner.stdin.cork()
        // // runner.stdin.write("ls /home/container")
        // // process.nextTick(() => runner.stdin.uncork())


        // const restParameters = andea.exec.slice(1)

        // restParameters.map((v, i) => {
        //     console.log(chalk.greenBright(v.message))
        // })
    } catch (err) {
        error("There was an error while executing the andeas")
        error(err.message)
        process.exit(1)
    }
}