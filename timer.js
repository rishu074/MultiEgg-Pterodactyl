process.stdin.on('data', () => {
    process.exit(0)
})

setInterval(() => {
    console.log("HELLO")
}, 1000);