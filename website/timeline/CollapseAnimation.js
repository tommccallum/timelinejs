class CollapseAnimation extends Animation 
{
    constructor(element, startWidth, targetWidth, duration, milliseconds) {
        super(element)
        this.duration = duration
        this.milliseconds = milliseconds
        this.startWidth = startWidth
        this.targetWidth = targetWidth
        this.step = Math.min(-1,(this.targetWidth - this.startWidth ) / this.duration)
        this.currentWidth = this.startWidth
    }

    isCompleted() {
        if ( this.step == 0 ) return true
        return this.currentWidth <= this.targetWidth
    }

    change() {
        this.currentWidth = Math.max(this.targetWidth, this.currentWidth + this.step)
        this.element.style.width = this.currentWidth + "px"

    }

    reset() {
        this.element.style.width = this.startWidth + "px"
        this.currentWidth = this.startWidth
    }
}