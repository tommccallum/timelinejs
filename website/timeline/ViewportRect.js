class ViewportRect {
    constructor() {
        this.center  = 0            // virtual pixel
        this.left    = 0            // virtual pixel
        this.right   = 100          // virtual pixel
        this.centerTimepoint = null
        this.timepointLeft  = null
        this.timepointRight = null
        this.height = 0
        this.timeAxisCollection = null
    }
}