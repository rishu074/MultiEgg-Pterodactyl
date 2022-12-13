import events from 'node:events'
import licenceChecker from '../checkers/licence.js'
import fs from 'fs';
import error from '../printer/error.js';

export default class Config extends events {
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
            this.config = JSON.parse(fs.readFileSync(config.path + "/" + config))
        }
        this.emit("load", this.config)
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