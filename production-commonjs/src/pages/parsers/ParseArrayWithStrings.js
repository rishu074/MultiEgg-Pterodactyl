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