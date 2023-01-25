const licenceChecker = require("../checkers/licence.js");
const chalk = require("chalk");
const performEntryScripts = require("../pages/entryscripts/perform.js");
const custom = require("../printer/custom.js");

module.exports = async function () {
    licenceChecker()
    const jsonData = process.licence
    let page = jsonData.motd


    console.clear()
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")
    console.log("")
    custom(page.name, page.font, page.textColor)
    console.log("\n")
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.cyan("[PROJECT] This project is purchased and permitted to be used at " + jsonData.motd.name + "."));
    console.log(chalk.cyan("[Copyright] Copyright 2023-24 ©️ Eggpeone"));
    console.log(chalk.cyan("[LICENSE] By using, or running this software you accept the terms at https://royadmadev.xyz/terms"));
    console.log(chalk.cyan("[Github] https://github.com/NotRoyadma"));
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")
    console.log("\n")
    console.log("\n")

    /*
        If there is any scripts to run.
    */
    if (page.scripts && page.scripts.length != 0) {
        await performEntryScripts(page.scripts)
    }
}