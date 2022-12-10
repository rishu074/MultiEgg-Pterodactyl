const readline = require('readline/promises').createInterface({
    input: process.stdin,
    output: process.stdout
});
const { spawn } = require('child_process');


(async () => {
    console.log(process.cwd())
    console.log(process.env)

    const cdmNode = spawn('node', ['/egg/timer.js']);


    cdmNode.stdout.pipe(process.stdout)
    cdmNode.stderr.pipe(process.stdout)
    process.stdin.pipe(cdmNode.stdin)

    cdmNode.on('close', () => {
        console.log("Closing")
        process.exit(0)
    })
})()