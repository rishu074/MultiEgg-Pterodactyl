const chalk = require('chalk');

module.exports = function (text) {
    console.log("\n" + chalk.red(text) + "\n");
}