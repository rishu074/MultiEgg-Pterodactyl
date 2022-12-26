const figlet = require('figlet');
const chalk = require('chalk');

module.exports = function (text) {
    console.log(chalk.cyan(figlet.textSync(text, {
        font: "Doom",
        horizontalLayout: "fitted",
        verticalLayout: "fitted"
    })));
}