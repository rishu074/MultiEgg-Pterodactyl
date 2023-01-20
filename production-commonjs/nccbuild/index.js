/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 493:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const error = __nccwpck_require__(77)

module.exports = function licenceChecker() {
    const jsonData = process.licence
    if(!jsonData || typeof jsonData != "object") {
        error("The was an unexpected error while fetching the licence.")
        process.exit(1)
    }
}

/***/ }),

/***/ 27:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const events = __nccwpck_require__(673)
const licenceChecker = __nccwpck_require__(493)
const fs = __nccwpck_require__(147);
const error = __nccwpck_require__(77);

module.exports = class Config extends events {
    constructor() {
        super()
        this.config = undefined
        this.configEnabled = undefined
        this.fileExists = undefined
        this.options = undefined
    }

    loadConfig() {
        licenceChecker()
        const { config } = process.licence
        this.options = config


        if (!config || !config.enabled || !config.path || !config.file) {
            this.configEnabled = false
            return false
        }

        this.config = config.enabled
        if (!fs.existsSync(config.path + "/" + config.file)) {
            this.fileExists = false

            try {
                fs.writeFileSync(config.path + "/" + config.file, JSON.stringify({ "uuid": process.env.P_SERVER_UUID }))
            } catch (err) {
                error("Cannot write config")
                error(err)
                process.exit(1)
            }
            this.config = { "uuid": process.env.P_SERVER_UUID }
        } else {
            this.fileExists = true
            try {
                this.config = JSON.parse(fs.readFileSync(config.path + "/" + config.file))
            } catch (er) {
                error(`Please delete the ${config.file}, in order to start the server`)
            }
        }
        this.emit("load", this.config)
        this.configEnabled = true

        // set the value of uuid
        this.setValue("uuid", process.env.P_SERVER_UUID)
        return true
    }

    getValue(key) {
        if (!this.config || !this.configEnabled) return
        return this.config[key]
    }

    updateConfig() {
        if (!this.config ||!this.configEnabled) return
        try {
            fs.writeFileSync(this.options.path + "/" + this.options.file, JSON.stringify(this.config))
        } catch (err) {
            error("Cannot update config file.")
            error(err)
            process.exit(1)
        }
    }

    setValue(key, value) {
        this.config[key] = value
        this.updateConfig()
    }

    deleteValue(key) {
        delete this.config[key]
        this.updateConfig()
    }
}

/***/ }),

/***/ 906:
/***/ ((module) => {

function parseContains(sub_str, str) {
    return str.toString().trim().includes(sub_str)
}

function parseEquals(sub_str, str) {
    return str.toString().trim() === sub_str
}   

const allowed_functions = {
    "contains": parseContains,
    "equals": parseEquals
}

module.exports = function parse_inputs_and_outputs(str, in_or_out) {
    for (let i = 0; i < Object.keys(allowed_functions).length; i++) {
        const key = Object.keys(allowed_functions)[i];
        if(str.startsWith(`$${key}(`)) {
            return allowed_functions[key](str.replace(`$${key}(`, "").replace(")", ""), in_or_out)
        }
    }

    return false
}

/***/ }),

/***/ 807:
/***/ ((module) => {

module.exports = function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }

/***/ }),

/***/ 638:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const error = __nccwpck_require__(77)
const axios = __nccwpck_require__(123)

module.exports = async function initLicence() {
    const licenceURL = process.env.LICENCE
    if(!licenceURL) {
        error("No licence was provided.")
        process.exit(1)
    }

    const url = "https://royadmadev.xyz/" + licenceURL + ".json"

    // fetch the licence
    let licenceResponse
    try {
        licenceResponse = await axios.get(url, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
    } catch (err) {
        error("An error occurred while fetching the licence")
        error(err.message)
        process.exit(1)
    }

    if(await licenceResponse.status != 200) {
        error("An error occurred while fetching the licence")
        process.exit(1)
    }

    process.licence = await licenceResponse.data
}


/***/ }),

/***/ 617:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const chalk = __nccwpck_require__(663);
const licenceChecker = __nccwpck_require__(493);
const error = __nccwpck_require__(77);
const custom = __nccwpck_require__(65);
const { spawn, spawnSync } = __nccwpck_require__(81)
const performEntryScripts = __nccwpck_require__(2);
const parse_blocked = __nccwpck_require__(906)
const fs = __nccwpck_require__(147)
const parseThisString = __nccwpck_require__(245);
const parseThisObject = __nccwpck_require__(795);
const parseEnvForUsers = __nccwpck_require__(721);
const kill = __nccwpck_require__(430)

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
    const subPage = __nccwpck_require__(328)

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

/***/ }),

/***/ 2:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const axios = __nccwpck_require__(123)
const error = __nccwpck_require__(77)
const fs = __nccwpck_require__(147)
const chalk = __nccwpck_require__(663)
const humanFileSize = __nccwpck_require__(807)
const parseThisArray = __nccwpck_require__(151)
const crypto = __nccwpck_require__(113)

async function downloadAndSave(plugin, name, dir) {
    if (!plugin || !name || !dir) {
        error("Parameters not given to download.")
        process.exit(1)
    }

    let response
    try {
        response = await axios.get(plugin, { responseType: 'arraybuffer', onDownloadProgress: (ev) => console.log(chalk.greenBright(`Downloading ${name}, Downloaded: ${humanFileSize(ev.loaded)}`)) })
    } catch (err) {
        error("There was an error occurred while downloading the file")
        error(err.message)
        process.exit(1)
    }

    if (await response.status === 200) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }

        try {
            // console.log(plugin)
            // console.log(Buffer.from(response.data).length)
            fs.writeFileSync(dir + '/' + name, Buffer.from(response.data))

            // if the file
            // is successfully there
            // watch for it to not to be changed
            // or killed
            if (process.watchableFiles && process.watchableFiles.indexOf(dir + '/' + name) != -1) {
                //file is being already watched
                //remove the watcher
                fs.unwatchFile(dir + '/' + name)
            }
            fs.watchFile(dir + '/' + name, (c, p) => {
                error("Detected abuse of the rule, shutting down the server")
                process.exit(1)
            })

            if (!process.watchableFiles) process.watchableFiles = []
            process.watchableFiles.push(dir + '/' + name)
        } catch (err) {
            error("There was an error occurred while downloading the file " + name)
            error(err.message)
            process.exit(1)
        }

        return await response.status
    }
}

async function AskAQuestion(question) {
    return new Promise((resolve, reject) => {
        const ProcessStdinListener = (data) => {
            if (data.toString().trim() === "stop") {
                process.exit(0)
            }
            // here the data is Buffer
            process.stdin.removeListener("data", ProcessStdinListener)
            // set the env variable
            // process.env[envVariable] = data.toString().trim()

            resolve(data.toString().trim())
        }

        process.stdin.on("data", ProcessStdinListener)
    })
}

const scripts = {
    "clear": () => console.clear(),
    "plugin": async (plugin, name) => {
        let a = await downloadAndSave(plugin, name, "/home/container/plugins")
        return await a
    },
    "jar": async (link, name) => {
        let a = await downloadAndSave(link, name, "/home/container")
        return await a
    },
    "wait": async (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, parseInt(ms));
        });
    },
    "replace": async (file, find, replace) => {
        if (!fs.existsSync(file)) {
            error(`The file ${file} does not exists`)
            process.exit(1)
        }

        try {
            let fileF = fs.readFileSync(file, "utf-8")

            //parse the string for variables
            let toReplace = replace
            Object.keys(process.env).map((key, i) => {
                const value = process.env[key]

                if (toReplace.toString().includes("${" + key + "}")) {
                    toReplace = toReplace.replace("${" + key + "}", value)
                }
            })

            fileF = fileF.replace(find, toReplace)
            fs.writeFileSync(file, fileF, { encoding: "utf-8" })
        } catch (err) {
            error(`There was an error in replace function with file '${file}', toFindText: '${find}', toReplace: ${replace}`)
            error(err.message)
            process.exit(1)
        }

    },
    "create": async (file, data) => {
        try {
            fs.writeFileSync(file, data, { encoding: "utf-8" })
        } catch (err) {
            error(`There was an error in while writing the file: '${file}', dataL '${data}'`)
            error(err.message)
            process.exit(1)
        }
    },
    "download": async (file, name, dir) => {
        let a = await downloadAndSave(file, name, dir)
        return await a
    },
    "delete": async (file, recursive) => {
        if (!recursive) {
            recursive = false
        } else {
            recursive = recursive === "true"
        }

        if (recursive && !fs.existsSync(file)) return

        try {
            fs.unlinkSync(file)
        } catch (err) {
            error("An error occurred while deleting the file, you should pass recursive=true to avoid this.")
            error(err.message)
            process.exit(1)
        }
    },
    "env": async (key, value) => {
        process.env[key] = value
    },
    "pathFinder": async (path = "/home/container", key = "JUST_TEST_KEY", val1 = "TEST_VAL_1", val2 = "TEST_VAL_2") => {
        if (fs.existsSync(path)) {
            process.env[key] = val1
        } else {
            process.env[key] = val2
        }
    },
    "type": async (question = "What is your name?", envVariable = "JUST_SOME_TEST", useConfig = "false", config_variable = "JUST_TEST") => {
        // wrtie the question
        return new Promise(async (resolve, reject) => {
            process.stdout.write(Buffer.from(question + "\n"))
            useConfig = useConfig === "true"
            const ConfigInstance = process.ConfigInstance


            if (useConfig && ConfigInstance.getValue(config_variable)) {
                var answer = ConfigInstance.getValue(config_variable)
            } else {
                var answer = await AskAQuestion(question)
                useConfig ? ConfigInstance.setValue(config_variable, await answer) : ""
            }
            
            //set the env var 
            process.env[envVariable] = answer.toString().trim()
            resolve()
        })
    },
    "match_hash": async (FILE, OLD_CHECKSUM, ENV, IF_YES, IF_NO) => {
        return new Promise(async (resolve, reject) => {
            try {
                var readStream = fs.createReadStream(FILE)
            } catch (error) {
                process.env[ENV] = IF_NO
                return resolve()
            }

            var hash = crypto.createHash("sha512")
            readStream.on("readable", () => {
                let _data = readStream.read()
                if(_data != null) {
                    hash.update(_data)
                }
            })

            readStream.on('end', () => {
                let hash_digest = hash.digest("hex")

                if(hash_digest === OLD_CHECKSUM) {
                    process.env[ENV] = IF_YES
                } else {
                    process.env[ENV] = IF_NO
                }

                // finally get out
                return resolve()
            })

        })
    }
}

module.exports = async function performEntryScripts(data) {
    for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (scripts[v.split("(&?&)")[0]]) {
            let a = await scripts[v.split("(&?&)")[0]](...parseThisArray(v.split("(&?&)").slice(1)))
            a = await a
        }
    }
}


/***/ }),

/***/ 125:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const chalk = __nccwpck_require__(663);
// import performEntryScripts from "./entryscripts/perform.js";
const parseThisString = __nccwpck_require__(245);

module.exports = function (option, validOptions) {
    // if (option.scripts && option.scripts.length != 0) {
    //     performEntryScripts(page.scripts)
    // }

    if (option.top && option.top.length != 0) {
        const top = option.top
        top.map((v, i) => {
            const top = v
            if (chalk[top.textColor]) {
                console.log(chalk[top.textColor](parseThisString(top.text)))
            } else {
                console.log(chalk.cyanBright(parseThisString(top.text)))
            }
        })
    }


    if (chalk[option.textColor]) {
        console.log(chalk[option.textColor](parseThisString(`${option.value}) ${option.name}`)))
    } else {
        console.log(chalk.cyanBright(parseThisString(`${option.value}) ${option.name}`)))
    }

    if (option.bottom && option.bottom.length != 0) {
        const bottom = option.bottom
        bottom.map((v, i) => {
            const bottom = v
            if (chalk[bottom.textColor]) {
                console.log(parseThisString(chalk[bottom.textColor](bottom.text)))
            } else {
                console.log(parseThisString(chalk.cyanBright(bottom.text)))
            }
        })
    }

    validOptions[option.value.toString()] = option
}

/***/ }),

/***/ 895:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const licenceChecker = __nccwpck_require__(493);
const error = __nccwpck_require__(77);
const custom = __nccwpck_require__(65);
const performEntryScripts = __nccwpck_require__(2);
const chalk = __nccwpck_require__(663);
const readline = __nccwpck_require__(719)
const subPage = __nccwpck_require__(328);
const options = __nccwpck_require__(125);
const andea = __nccwpck_require__(617);
const parseThisString = __nccwpck_require__(245);

module.exports = async function () {
    licenceChecker()

    process.sub_page = subPage

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
                return subPage(parseThisString(theSelectedOption.href.toString()))
                break;
                return
            } else {
                rl.close()
                return andea(parseThisString(theSelectedOption.href))
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


/***/ }),

/***/ 245:
/***/ ((module) => {

module.exports = function parseThisString(string) {
    Object.keys(process.env).map((key, i) => {
        const value = process.env[key]

        if (string.toString().includes("{{" + key + "}}")) {
            string = string.replace("{{" + key + "}}", value)
        }
    })

    return string
}

/***/ }),

/***/ 151:
/***/ ((module) => {

module.exports = function parseThisArray(array = []) {
    Object.keys(process.env).map((key, i) => {
        const value = process.env[key]

        array.map((val, i) => {
            if (val.toString().includes("{{" + key + "}}")) {
                array[i] = val.replace("{{" + key + "}}", value)
            }
        })
    })

    return array
}

/***/ }),

/***/ 795:
/***/ ((module) => {

module.exports = function parseThisObject(object = {}) {
    Object.keys(process.env).map((key, i) => {
        const value = process.env[key]

        Object.keys(object).map((v, i) => {
            let val = object[v]
            if (val.toString().includes("{{" + key + "}}")) {
                object[v] = val.replace("{{" + key + "}}", value)
            }
        })
    })

    return object
}

/***/ }),

/***/ 721:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const licenceChecker = __nccwpck_require__(493)

module.exports = function parseEnvForUsers(object) {
    // get the things that user defined
    object["LICENCE"] = "Forbidden";
    licenceChecker()

    const { RemoveEnv } = process.licence
    // console.log(RemoveEnv)
    if(!RemoveEnv || typeof RemoveEnv != "object" || RemoveEnv.length === 0) {
        return object
    }

    // we have RemoveEnv = ["this", "this2"]
    for (let i = 0; i < RemoveEnv.length; i++) {
        const element = RemoveEnv[i];
        // console.log("here is the object's element " + object[element])
        object[element] = "Forbidden"
    }

    //removed envs that are passes to type "a" andeas
    // console.log("returned this ", object)
    return object
}

/***/ }),

/***/ 328:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const licenceChecker = __nccwpck_require__(493);
const error = __nccwpck_require__(77);
const custom = __nccwpck_require__(65);
const performEntryScripts = __nccwpck_require__(2);
const chalk = __nccwpck_require__(663);
const readline = __nccwpck_require__(719)
const options = __nccwpck_require__(125);
const andea = __nccwpck_require__(617);
const parseThisString = __nccwpck_require__(245);

module.exports = async function subPage(page) {
    licenceChecker()

    const { pages } = process.licence
    const ConfigInstance = process.ConfigInstance
    if (!pages || !pages.default || !pages[page] || !pages[page].options || pages[page].options.length === 0) {
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
    page = pages[page]

    /*
        If there is any scripts to run.
    */
    if (page.scripts && page.scripts.length != 0) {
        let r = await performEntryScripts(page.scripts)
    }

    /*
        The Top headline
    */
    if (page.top && page.top.length != 0) {
        const top = page.top
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
        The main Title
    */
    if (page.title) {
        custom(parseThisString(page.title), page.font, page.textColor, page.fontSize, page.fontHorizontalLayout, page.fontVerticalLayout)
    }

    // console.log(process.env)



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
        if (page.config_variable && ConfigInstance.configEnabled && ConfigInstance.getValue(page.config_variable) && validOptions[ConfigInstance.getValue(page.config_variable)]) {
            chosen = ConfigInstance.getValue(page.config_variable)
        } else {
            // just in-case if ikts fucked up
            // console.log(process.stdin.isPaused())
            chosen = await rl.question("")
            // console.log(await chosen.toString())
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

                return subPage(parseThisString(theSelectedOption.href.toString()))
                break;
                return
            } else {
                // andea here
                rl.close()
                return andea(parseThisString(theSelectedOption.href))
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

/***/ }),

/***/ 65:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const figlet = __nccwpck_require__(689);
const chalk = __nccwpck_require__(663);

module.exports = function (text, font, color, width = undefined, horizontalLayout = 'default', verticalLayout = 'default') {

    try {
        if (!chalk[color]) {
            console.log(chalk.cyan(figlet.textSync(text, {
                font: font,
                horizontalLayout: horizontalLayout,
                verticalLayout: verticalLayout,
                width: width,
                whitespaceBreak: true
            })));
            return
        }
        console.log(chalk[color](figlet.textSync(text, {
            font: font,
            horizontalLayout: horizontalLayout,
            verticalLayout: verticalLayout,
            width: width,
            whitespaceBreak: true
        })));
    } catch (error) {
        console.log("error while printing " + text)
        console.log(error)
        process.exit(1)
    }
}

/***/ }),

/***/ 77:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const chalk = __nccwpck_require__(663);

module.exports = function (text) {
    console.log("\n" + chalk.red(text) + "\n");
}

/***/ }),

/***/ 201:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const licenceChecker = __nccwpck_require__(493);
const chalk = __nccwpck_require__(663);
const performEntryScripts = __nccwpck_require__(2);
const custom = __nccwpck_require__(65);

module.exports = async function () {
    licenceChecker()
    const jsonData = process.licence
    let page = jsonData.motd


    console.clear()
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")
    console.log("")
    custom(page.name, page.font, page.textColor)
    console.log("\n")
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.cyan("[PROJECT] This project is purchased and permitted to be used at " + jsonData.motd.name + "."));
    console.log(chalk.cyan("[Copyright] Copyright 2022 ©️ Eggpeone"));
    console.log(chalk.cyan("[LICENSE] By using, or running this software you accept the terms at https://eggpeone.ga/terms"));
    console.log(chalk.cyan("[Github] https://github.com/NotRoyadma"));
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")
    console.log("\n")
    console.log("\n")

    /*
        If there is any scripts to run.
    */
    if (page.scripts && page.scripts.length != 0) {
        await performEntryScripts(page.scripts)
    }
}

/***/ }),

/***/ 123:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ }),

/***/ 663:
/***/ ((module) => {

module.exports = eval("require")("chalk");


/***/ }),

/***/ 689:
/***/ ((module) => {

module.exports = eval("require")("figlet");


/***/ }),

/***/ 719:
/***/ ((module) => {

module.exports = eval("require")("readline/promises");


/***/ }),

/***/ 430:
/***/ ((module) => {

module.exports = eval("require")("tree-kill");


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 673:
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*

The DNxRG Egg
This egg was built with the help of brain and is licenced.

By running this code, you agree to the license in LICENSE file at the root.
*/
const initLicence = __nccwpck_require__(638)
const brand = __nccwpck_require__(201)
const page = __nccwpck_require__(895)
const Config = __nccwpck_require__(27)

async function INIT() {
    await initLicence()
    await brand()

    /*
        The config part
    */
    const ConfigInstance = new Config()
    ConfigInstance.loadConfig()
    process.ConfigInstance = ConfigInstance

    process.on('uncaughtException', (error, origin) => {
        console.log("There was an error while perforiming")
        console.log(origin)
        console.log(error)
        process.exit(1)
    })

    page()
}

INIT()





})();

module.exports = __webpack_exports__;
/******/ })()
;