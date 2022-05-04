class ViewportRect {
    constructor() {
        this.center  = 0            // virtual pixel
        this.left    = 0            // virtual pixel
        this.right   = 100          // virtual pixel
        this.timepointLeft  = null
        this.timepointRight = null
        this.timepointCenter = null
        this.height = 0
        this.top = 0
        this.timeAxisCollection = null
    }
}