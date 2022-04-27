class Observable {
    constructor() {
        this.listeners = []
    }

    addListener(callback) {
        this.listeners.push(callback)
    }

    sendEvent(eventName, data) {
        for( let l of this.listeners ) {
            l(eventName, this, data)
        }
    }
}