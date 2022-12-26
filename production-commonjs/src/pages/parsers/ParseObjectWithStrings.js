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