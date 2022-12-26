import chalk from "chalk";
import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import custom from "../printer/custom.js";
import { spawn, execSync, spawnSync } from 'child_process'
import performEntryScripts from "./entryscripts/perform.js";
import subPage from "./sub-page.js";
import parse_blocked from '../functions/inAndOutFunc.js'
import readline from "readline";
import fs from 'fs'
import parseThisString from "./parsers/ParseAnyStringWithENV.js";
import parseThisObject from "./parsers/ParseObjectWithStrings.js";
import parseEnvForUsers from "./parsers/parseEnvForUsers.js";

export default async function andeaFuc(andea) {
    licenceChecker()
    const { andeas } = process.licence

    if (!andeas[andea] || !andeas[andea].type || !andeas[andea].exec || !andeas[andea].href && andeas[andea].type != "a") {
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
                console.log(parseThisString(chalk[top.textColor](top.text)))
            } else {
                console.log(parseThisString(chalk.cyanBright(top.text)))
            }
        })
    }

    /*
        If there is any scripts to run.
    */
    if (andea.scripts && andea.scripts.length != 0) {
        await performEntryScripts(andea.scripts)
    }


    if (andea.title && andea.font && andea.textColor) custom(parseThisString(andea.title), andea.font, andea.textColor)

    try {
        //execute the minimal type means execute in Synchronus Way
        // it is great for executing small commands like `cd or mkdir or curl`
        if (andea.type === "d") {
            const toExecuteCommands = andea.exec
            for (let i = 0; i < toExecuteCommands.length; i++) {
                const v = toExecuteCommands[i];

                if (v.message) console.log(parseThisString(v.textColor && chalk[v.textColor] ? chalk[v.textColor](v.message) : chalk.cyanBright(v.message)))

                try {
                    v.command = parseThisString(v.command)
                    const runner = spawnSync(v.command.split(" ")[0], [...v.command.split(" ").slice(1)], {
                        shell: true,
                        env: andea.env && Object.keys(andea.env).length != 0 ? {...parseEnvForUsers(process.env), ...parseThisObject(andea.env)} : {...parseEnvForUsers(process.env)}
                    })
                    // console.log(runner)
                    if (v.output) {
                        console.log(parseThisString(v.outputColor && chalk[v.outputColor] ? chalk[v.outputColor](runner.stdout.toString(), "\n", runner.stderr.toString()) : chalk.redBright(runner.stdout.toString(), "\n", runner.stderr.toString())))
                    }

                } catch (err) {
                    if (v.output) {
                        error(`There was an error while executing this command \`${v.command}\` ==> '${err}'`)
                    }
                }
            }
        } else {
            // type a andea

            var toExecuteCommands = parseThisString(andea.exec.command)
            // console.log(process.env)

            // remove all the file listeners
            if (process.watchableFiles && process.watchableFiles.length != 0) {
                let watchingFIles = process.watchableFiles

                for (let i = 0; i < watchingFIles.length; i++) {
                    const element = watchingFIles[i];

                    fs.unwatchFile(element)
                }
            }

            // // parse startup commands
            // // like parse java -jar server.jar -Xmx {SERVER_MEMORY}M to java -jar server.jar -Xmx 12M
            // Object.keys(process.env).map((key, i) => {
            //     const value = process.env[key]

            //     if (toExecuteCommands.toString().includes("${" + key + "}")) {
            //         toExecuteCommands = toExecuteCommands.replace("${" + key + "}", value)
            //     }
            // })

            process.stdin.resume()
            // console.log(process.stdin.isPaused())
            const runner = spawn(toExecuteCommands.split(" ")[0], [...toExecuteCommands.split(" ").slice(1)], {
                shell: true,
                detached: true,
                cwd: "/home/container",
                env: andea.env && Object.keys(andea.env).length != 0 ? {...parseEnvForUsers(process.env), ...parseThisObject(andea.env)} : {...parseEnvForUsers(process.env)}
            })


            runner.stdout.on("data", (data) => {
                // parse the banned or blocked outputs
                if (andea.blockedOutputs && andea.blockedOutputs.length != 0) {
                    let blockedOutputs = andea.blockedOutputs

                    for (let i = 0; i < blockedOutputs.length; i++) {
                        const bo = blockedOutputs[i];
                        let results = parse_blocked(bo, data.toString().trim())
                        if (results) return
                    }
                }

                console.log(andea.consoleColor && chalk[andea.consoleColor] ? chalk[andea.consoleColor](data.toString().trim()) : data.toString().trim())
            })
            runner.stderr.on("data", (data) => {
                // parse the banned or blocked outputs
                if (andea.blockedOutputs && andea.blockedOutputs.length != 0) {
                    let blockedOutputs = andea.blockedOutputs

                    for (let i = 0; i < blockedOutputs.length; i++) {
                        const bo = blockedOutputs[i];
                        let results = parse_blocked(bo, data.toString().trim())
                        if (results) return
                    }
                }

                console.log(andea.consoleErrorColor && chalk[andea.consoleErrorColor] ? chalk[andea.consoleErrorColor](data.toString().trim()) : data.toString().trim())
            })

            runner.on('error', (err) => {


                error(`There was an error while executing this command \`${toExecuteCommands}\``)
                error(err)
                process.exit(1)
            })

            runner.on('close', (code) => {
                process.exit(code)
            })

            process.stdin.on('data', (data) => {
                // user input
                // parse if the command is for stop
                // console.log(data.toString())
                if (data.toString().trim() === "stop") {
                    return runner.stdin.write(andea.stop ? andea.stop + "\n" : "stop\n")
                }

                // parse the banned or blocked inputs
                if (andea.blockedInputs && andea.blockedInputs.length != 0) {
                    let blockedOutputs = andea.blockedInputs

                    for (let i = 0; i < blockedOutputs.length; i++) {
                        const bo = blockedOutputs[i];
                        let results = parse_blocked(bo, data.toString().trim())
                        if (results) {
                            // console.log(results)
                            // console.log(data.toString())
                            return
                        }
                    }
                }

                runner.stdin.write(data.toString().trim() + "\n")
            })
        }
    } catch (err) {
        error("There was an error while executing the andeas")
        error(err.message)
        process.exit(1)
    }

    /*
        The Bottom headline
    */
    if (andea.bottom && andea.bottom.length != 0) {
        const bottom = andea.bottom
        bottom.map((v, i) => {
            const bottom = v
            if (chalk[bottom.textColor]) {
                console.log(chalk[bottom.textColor](bottom.text))
            } else {
                console.log(chalk.cyanBright(bottom.text))
            }
        })
    }

    // till here the thing is completely done. imean if the type="d" then the thing is done
    if (andea.type === "d") {
        if (!andea.hrefType) {
            error("The `hrefType` was Not Specified.")
            process.exit(1)
        }

        if (parseThisString(andea.hrefType) != "andea") {
            return subPage(parseThisString(andea.href))
        } else {
            return andeaFuc(parseThisString(andea.href))
        }
    } else {
        // eat 5-star, do nothing
    }
}