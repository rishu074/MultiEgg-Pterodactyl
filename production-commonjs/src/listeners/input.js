const eventEmiiter = require('events')

module.exports = class ListenToInput extends eventEmiiter  {
    constructor() {
        super()
    }

    amit(d) {
        this.emit('data', d)
    }   
}