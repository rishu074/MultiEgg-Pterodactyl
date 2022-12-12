import axios from 'axios'
import error from '../../printer/error.js'
import fs from 'fs'
import chalk from 'chalk'
import humanFileSize from '../../functions/readable.js'

async function downloadAndSave(plugin, name, dir) {
    if (!plugin || !name) {
        error("Plugin and name are required")
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

        let file = fs.readFileSync(file, "utf-8")
        file = file.replace(find, replace)
        fs.writeFileSync(file, file, { encoding: "utf-8" })
    },
    "create": async (file, data) => {
        fs.writeFileSync(file, data, { encoding: "utf-8" })
    }
}

export default async function performEntryScripts(data) {
    for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (scripts[v.split("-")[0]]) {
            let a = await scripts[v.split("-")[0]](...v.split("-").slice(1))
            a = await a
        }
    }
}