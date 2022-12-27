const licenceChecker = require('../../checkers/licence.js')

module.exports = function parseEnvForUsers(object) {
    // get the things that user defined
    object["LICENCE"] = "Forbidden";
    licenceChecker()

    const { RemoveEnv } = process.licence
    // console.log(RemoveEnv)
    if(!RemoveEnv || typeof RemoveEnv != "object" || RemoveEnv.length === 0) {
        return object
    }

    // we have RemoveEnv = ["this", "this2"]
    for (let i = 0; i < RemoveEnv.length; i++) {
        const element = RemoveEnv[i];
        // console.log("here is the object's element " + object[element])
        object[element] = "Forbidden"
    }

    //removed envs that are passes to type "a" andeas
    // console.log("returned this ", object)
    return object
}