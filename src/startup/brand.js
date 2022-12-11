import big from "../printer/big.js";
import licenceChecker from "../checkers/licence.js";
import chalk from "chalk";

export default function () {
    licenceChecker()
    const jsonData = process.licence
    console.clear()
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")
    console.log("")
    big(jsonData.motd.name)
    console.log("\n")
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.cyan("[PROJECT] This project is purchased and permitted to be used at " + jsonData.motd.name + "."));
    console.log(chalk.cyan("[Copyright] Copyright 2022 ©️ Eggpeone"));
    console.log(chalk.cyan("[LICENSE] By using, or running this software you accept the terms at https://eggpeone.ga/terms"));
    console.log(chalk.cyan("[Github] https://github.com/NotRoyadma"));
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")
    console.log("\n")
    console.log("\n")
}