const figlet = require('figlet');
const chalk = require('chalk');

module.exports = function (text) {
    console.log(chalk.cyan(figlet.textSync(text, {
        font: "ANSI Shadow",
        horizontalLayout: "fitted",
        verticalLayout: "fitted"
    })));
}