const chalk = require("chalk");
const licenceChecker = require("../checkers/licence.js");
const error = require("../printer/error.js");
const custom = require("../printer/custom.js");
const { spawn, spawnSync } = require('child_process')
const performEntryScripts = require("./entryscripts/perform.js");
const parse_blocked = require('../functions/inAndOutFunc.js')
const fs = require('fs')
const parseThisString = require("./parsers/ParseAnyStringWithENV.js");
const parseThisObject = require("./parsers/ParseObjectWithStrings.js");
const parseEnvForUsers = require("./parsers/parseEnvForUsers.js");
const kill = require("tree-kill")

async function killAndea(pid, signal) {
    return new Promise((resolve, reject) => {
        kill(pid, signal, (error) => {
            if (error) {
                console.error("There was an error while killing the process")
                console.error(error)
                process.exit(1)
            } else {
                resolve(true)
            }
        })
    })
}

module.exports = async function andeaFuc(andea) {
    licenceChecker()
    const { andeas } = process.licence
    const subPage = require("./sub-page.js")

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
                        env: andea.env && Object.keys(andea.env).length != 0 ? { ...parseEnvForUsers(process.env), ...parseThisObject(andea.env) } : { ...parseEnvForUsers(process.env) }
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
                env: andea.env && Object.keys(andea.env).length != 0 ? { ...parseEnvForUsers(process.env), ...parseThisObject(andea.env) } : { ...parseEnvForUsers(process.env) }
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

            let signals = [
                "SIGABRT",
                "SIGALRM",
                "SIGBUS",
                "SIGCHLD",
                "SIGCONT",
                "SIGFPE",
                "SIGHUP",
                "SIGILL",
                "SIGINT",
                "SIGKILL",
                "SIGPIPE",
                "SIGPOLL",
                "SIGPROF",
                "SIGQUIT",
                "SIGSEGV",
                "SIGSTOP",
                "SIGTSTP",
                "SIGSYS",
                "SIGTERM",
                "SIGTRAP",
                "SIGTTIN",
                "SIGTTOU",
                "SIGURG",
                "SIGUSR1",
                "SIGUSR2",
                "SIGVTALRM",
                "SIGXCPU",
                "SIGXFSZ",
            ]
            process.stdin.on('data', async (data) => {
                // user input
                // parse if the command is for stop
                // console.log(data.toString())
                if (data.toString().trim() === "stop") {
                    if (andea.stop && signals.indexOf(andea.stop.toString()) != -1) {
                        return await killAndea(runner.pid, andea.stop)
                    }

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