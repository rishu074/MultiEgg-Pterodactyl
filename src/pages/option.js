import chalk from "chalk"

export default async function(option, validOptions) {
    if (option.top && option.top.length != 0) {
        const top = option.top
        top.map((v, i) => {
            const top = v
            if (chalk[top.textColor]) {
                console.log(chalk[top.textColor](top.text))
            } else {
                console.log(chalk.cyanBright(top.text))
            }
        })
    }


    if (chalk[option.textColor]) {
        console.log(chalk[option.textColor](`${option.value}) ${option.name}`))
    } else {
        console.log(chalk.cyanBright(`${option.value}) ${option.name}`))
    }

    if (option.bottom && option.bottom.length != 0) {
        const bottom = option.bottom
        bottom.map((v, i) => {
            const bottom = v
            if (chalk[bottom.textColor]) {
                console.log(chalk[bottom.textColor](bottom.text))
            } else {
                console.log(chalk.cyanBright(bottom.text))
            }
        })
    }

    validOptions[option.value.toString()] = option.href.toString()
}