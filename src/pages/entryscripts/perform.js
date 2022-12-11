import axios from 'axios'
import error from '../../printer/error.js'
import fs from 'fs'

const scripts = {
    "clear": () => console.clear(),
    "plugin": (plugin, name) => {
        if (!plugin || !name) {
            error("Plugin and name are required")
            process.exit(1)
        }
        axios.get(plugin, { responseType: 'blob' })
            .then((response) => {
                if (!fs.existsSync("/home/container/plugins")) {
                    fs.mkdirSync("/home/container/plugins")
                }
                fs.writeFile('/home/container/plugins/' + name, response.data, (err) => {
                    if (err) {
                        error("There was an error occurred while downloading the plguin")
                        error(err.message)
                        process.exit(1)
                    }

                    // if the file
                    // is successfully there
                    // watch for it to not to be changed
                    // or killed
                    if(process.watchableFiles && process.watchableFiles.indexOf('/home/container/plugins/' + name) != -1) {
                        //file is being already watched
                        //remove the watcher
                        fs.unwatchFile('/home/container/plugins/' + name)
                    }
                    fs.watchFile('/home/container/plugins/' + name, (c, p) => {
                        error("Detected abuse of the rule, shutting down the server")
                        process.exit(1)
                    })

                    if (!process.watchableFiles) process.watchableFiles = []
                    process.watchableFiles.push('/home/container/plugins/' + name)
                });


            })
            .catch((err) => {
                error("There was an error occurred while downloading the plguin")
                error(err.message)
                process.exit(1)
            })
    }
}

export default function performEntryScripts(data) {
    data.map((v, i) => {
        if (scripts[v.split("-")[0]]) {
            scripts[v.split("-")[0]](...v.split("-").slice(1))
        }
    })
}