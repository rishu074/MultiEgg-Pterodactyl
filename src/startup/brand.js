import big from "../printer/big.js";
import licenceChecker from "../checkers/licence.js";
import chalk from "chalk";

export default function() {
    licenceChecker()
    const jsonData = process.licence
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log("\n")
    big(jsonData.motd.name)
    console.log("\n")
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.cyan("[Copyright] Copyright 2022 ©️ Royadma"));
    console.log(chalk.cyan("[Github] https://github.com/NotRoyadma"));
    console.log(chalk.cyan("[LICENCE] This project cannot be used or copied without the permission of @NotRoyadma."));
    console.log(chalk.blue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
}