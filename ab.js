function parseThisArray(array = []) {
    Object.keys(process.env).map((key, i) => {
        const value = process.env[key]

        // console.log(`Looping through key ${key} of value ${value}`)

        array.map((val, i) => {
            // console.log("Array looping through " + val)
            if (val.toString().includes("{{" + key + "}}")) {
                console.log("replaced " + val + " with " + val.replace("{{" + key + "}}", value))
                array[i] = val.replace("{{" + key + "}}", value)
            }
        })
    })

    return array
}

export default function parseThisObject(object = {}) {
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

process.env.LOLA = "GHODA"
process.env.TEST = "LOL"
console.log(parseThisArray(["{{LOLA}}", "{{TEST}}"]))
console.log(parseThisObject({
    "lol": "{{LOLA}}",
    t: "{{TEST}}"
}))