import eventEmiiter from 'events'

export default class ListenToInput extends eventEmiiter  {
    constructor() {
        super()
    }

    amit(d) {
        this.emit('data', d)
    }   
}