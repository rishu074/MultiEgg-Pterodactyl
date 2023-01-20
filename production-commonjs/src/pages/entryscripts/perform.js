const axios = require('axios')
const error = require('../../printer/error.js')
const fs = require('fs')
const chalk = require('chalk')
const humanFileSize = require('../../functions/readable.js')
const parseThisArray = require('../parsers/ParseArrayWithStrings.js')
const crypto = require('crypto')

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
