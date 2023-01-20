const crypto = require("crypto")
const fs = require("fs")

const FILE = "./.gitignore"
const OLD_CHECKSUM = "e2816bd68a83fc070901648fa137a8029050350140166171c9feb002ef1a9e7ac0f53e522c4d7a69257e42ea8d8d8500f030f8837db459e8e47646d0853d8471"

async function hell() {
    const stream = fs.createReadStream(FILE)
    var hash = crypto.createHash("sha512")
    stream.on('readable', () => {
        console.log("Readable")
        const data = stream.read()
        if(data != null) {
            hash.update(data)

        }
    })

    stream.on("end", () => {
        console.log(hash.digest('hex') === OLD_CHECKSUM)
    })
}

hell()