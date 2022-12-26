module.exports = function parseThisString(string) {
    Object.keys(process.env).map((key, i) => {
        const value = process.env[key]

        if (string.toString().includes("{{" + key + "}}")) {
            string = string.replace("{{" + key + "}}", value)
        }
    })

    return string
}