import axios from 'axios'
import error from '../../printer/error.js'
import fs from 'fs'
import chalk from 'chalk'

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
function humanFileSize(bytes, si=false, dp=1) {
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

async function downloadAndSave(plugin, name, dir) {
    if (!plugin || !name) {
        error("Plugin and name are required")
        process.exit(1)
    }

    let response
    try {
        response = await axios.get(plugin, { responseType: 'blob', onDownloadProgress: (ev) => console.log(chalk.greenBright(`Downloading ${name}, Downloaded: ${humanFileSize(ev.bytes)}`)) })
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