const crypto = require("crypto")
const fs = require("fs")

const FILE = "./hello"
const OLD_CHECKSUM = "20ed231b7cfbdc3670ff0a14c8f67df316c23c5f8b38f07a56666b37c93ff369be4854c7e55103b674b3249b153e1f7d68547faeea2ea22f528037e198f9cb5a"

async function getFileHash(path, hash) {
    return new Promise((resolve, reject) => {
        console.log(`Found file ${path}`)
        console.log("Starting generation of hash --------------------- " + path)

        const stream = fs.createReadStream(path)

        let l1 = stream.on('readable', () => {
            const data = stream.read()
            console.log(path + " reading data and updating hash")
            if(data != null) {
                hash.update(data)
            }
        })

        let l2 = stream.on('end', () => {
            stream.removeAllListeners("readable")
            stream.removeAllListeners("end")
            console.log("Ending generation of hash --------------------- " + path)

            resolve()
        })
    })

}

async function getDirChecksum(path, hash) {
    let stat = fs.readdirSync(path)

    for (let i = 0; i < stat.length; i++) {
        const element = stat[i];
        let s = fs.lstatSync(path + "/" + element)
        console.log(`Looping through ${element}`)

        if(s.isDirectory()) {
            console.log(`Found dir ${element}`)
            await getDirChecksum(path + "/" + element, hash)
        } else {
            await getFileHash(path + "/" + element, hash)
        }
    }

    return hash
}

async function hell() {
    var hash = crypto.createHash("sha512")
    let stat = fs.lstatSync(FILE)
    if(stat.isDirectory()) {
        fullhash = await getDirChecksum(FILE, hash)
        return console.log(fullhash.digest("hex"))
    }

    // const stream = fs.createReadStream(FILE)
    // stream.on('readable', () => {
    //     console.log("Readable")
    //     const data = stream.read()
    //     if(data != null) {
    //         hash.update(data)

    //     }
    // })

    // stream.on("end", () => {
    //     console.log(hash.digest('hex') === OLD_CHECKSUM)
    // })
}

hell()