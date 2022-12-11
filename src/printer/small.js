import figlet from 'figlet';
import chalk from 'chalk';

export default function (text) {
    console.log(chalk.cyan(figlet.textSync(text, {
        font: "Doom",
        horizontalLayout: "fitted",
        verticalLayout: "fitted"
    })));
}