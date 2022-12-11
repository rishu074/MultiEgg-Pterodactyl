import axios from 'axios'
import error from '../../printer/error.js'
import fs from 'fs'

async function downloadAndSave(plugin, name, dir) {
    if (!plugin || !name) {
        error("Plugin and name are required")
        process.exit(1)
    }

    let response
    try {
        response = await axios.get(plugin, { responseType: 'blob' })
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
            fs.writeFileSync(dir + '/' + name, response.data)

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
            error("There was an error occurred while downloading the plguin")
            error(err.message)
            process.exit(1)
        }
    }
}

const scripts = {
    "clear": () => console.clear(),
    "plugin": async (plugin, name) => {
        await downloadAndSave(plugin, name, "/home/container/plugins")
    },
    "jar": async (link, name) => {
        await downloadAndSave(link, name, "/home/container")
    }
}

export default async function performEntryScripts(data) {
    await data.map(async (v, i) => {
        if (scripts[v.split("-")[0]]) {
            await scripts[v.split("-")[0]](...v.split("-").slice(1))
        }
    })
}