import figlet from 'figlet';
import chalk from 'chalk';

export default function (text, font, color, width = undefined, horizontalLayout = 'default', verticalLayout = 'default') {

    try {
        if (!chalk[color]) {
            console.log(chalk.cyan(figlet.textSync(text, {
                font: font,
                horizontalLayout: horizontalLayout,
                verticalLayout: verticalLayout,
                width: width,
                whitespaceBreak: true
            })));
            return
        }
        console.log(chalk[color](figlet.textSync(text, {
            font: font,
            horizontalLayout: horizontalLayout,
            verticalLayout: verticalLayout,
            width: width,
            whitespaceBreak: true
        })));
    } catch (error) {
        console.log("error while printing " + text)
        console.log(error)
        process.exit(1)
    }
}