import express from "express";

var app = express()

app.use(express.static('./public'));

app.use((req, res) => {
    return res.sendStatus(404)
})

app.listen(1337, (port) => {
    console.log(`Started application listenig on port 1337`)
})