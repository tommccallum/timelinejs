class Animation {
    constructor(element) {
        this.element = element
        this.timer = null
        this.duration = 0                       // the number of steps to take for the animation
        this.milliseconds = 0                   // how long to wait between each animation
        this.state = 0
        this.onStopCallback = null
        this.onCompletionCallback = null
        this.cached = {}
    }

    isPlaying() {
        return this.state === 1
    }

    isStopped() {
        return this.state === 0
    }

    setDuration(duration) {
        this.duration = duration
    }

    start() {
        if ( this.state === 0 ) {
            const self = this
            this.state = 1
            this.timer = setInterval(function() { self.next() }, this.milliseconds)
        }
    }

    stop() {
        if ( this.timer ) {
            clearInterval(this.timer)   
        }
        this.timer = null
        this.state = 0
        this.resetFromCache()
        if ( this.onStopCallback && typeof(this.onStopCallback) === "function" ) {
            this.onStopCallback()
        }
    }

    cache(cssProperty) {
        this.cached[cssProperty] = this.element.style[cssProperty]
    }

    set(cssProperty, value ) {
        this.cache(cssProperty)
        this.element.style[cssProperty] = value
    }

    resetFromCache() {
        for( let p in this.cached ) {
            this.element.style[p] = this.cached[p]
        }
    }

    next() {
        if ( this.state ) {
            if ( this.isCompleted() ) {
                this.stop()
                if ( this.onCompletionCallback  && typeof(this.onCompletionCallback) === "function" ) {
                    this.onCompletionCallback()
                }
            } else {
                this.change()
            }
        }
    }

    onStop(callback) {
        // Allows user to specify a callback when the animation is stopped, not necessarily completed
        this.onStopCallback = callback
    }

    onCompletion(callback) {
        // Allows user to specify a callback when the animation time is up
        this.onCompletionCallback = callback
    }

    isCompleted() {
        // override with your own tests
        return true
    }

    change() {
        // override with your changes
    }

    reset() {
        // override to return to an expected state
    }
}