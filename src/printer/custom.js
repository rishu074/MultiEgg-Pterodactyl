import figlet from 'figlet';
import chalk from 'chalk';

export default function (text, font, color) {
    if(!chalk[color]) {
        console.log(chalk.cyan(figlet.textSync(text, {
            font: font,
            horizontalLayout: "fitted",
            verticalLayout: "fitted"
        })));
        return
    }
    console.log(chalk[color](figlet.textSync(text, {
        font: font,
        horizontalLayout: "fitted",
        verticalLayout: "fitted"
    })));
}