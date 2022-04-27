class Viewport {
    // This is the timeperiod that we want to show
    // This is a virtual amount

    constructor(element, timeAxisCollection) {
        this.timeCoordinates = timeAxisCollection
        this.element = element
        this.startPx = 0
        this.widthInPixels = 0
        this.updateViewportWidth() 
        this.zoom = 1
        this.element.addEventListener("resize", function(e) { this.onResize(e) } )

        // This is the timepoint that our viewport centers around we give equal space
        // either side of this point.
        this.timepoint = new TimePoint()
        // console.log(this.timepoint)

        this.visibleRect = null
    }

    updateViewportWidth() {
        const style = window.getComputedStyle(this.element)
        this.widthInPixels = this.element.clientWidth - parseInt(style.paddingLeft) - parseInt(style.paddingRight) // includes padding, excludes border and margin
    }

    setTimePoint(pt) {
        if ( typeof(pt) === "undefined" ) return;
        if ( pt === null ) return;

        if ( typeof(pt) === "string" ) {
            this.timepoint = new TimePoint(pt)
        } else {
            this.timepoint = pt
        }
    }

    
    onResize(e) {
        console.log(e)
    }

    startInPixels() {
        return this.startPx
    }

    endInPixels() {
        return this.startInPixels() + this.widthInPixels
    }

    set(value, restrictToSingleAxis = null) {
        const newTimepoint = new TimePoint(value)
        // console.log(`Viewport::set ${this.timepoint.relativeValue} ${value} ${newTimepoint.relativeValue}`)
        if ( this.timeCoordinates.isTimepointInBounds(newTimepoint, restrictToSingleAxis ) ) {
            // console.log("Viewport::set in bounds")
            this.setTimePoint(newTimepoint)
            return true
        }
        if ( this.timeCoordinates.earlierThanAxis(newTimepoint, restrictToSingleAxis ) ) {
            // console.log("Viewport::set at start")
            this.setTimePoint(this.timeCoordinates.beginning(restrictToSingleAxis))
            return true
        }
        if ( this.timeCoordinates.laterThanAxis(newTimepoint, restrictToSingleAxis ) ) {
            // console.log("Viewport::set at end")
            this.setTimePoint(this.timeCoordinates.theEnd(restrictToSingleAxis))
            return true
        }
        return false
    }

    step(value, restrictToSingleAxis = null) {
        // I want to see what the bounds are here from the time axis
        const newTimepoint = this.timepoint.copy().add(value)
        // console.log(`Viewport::step ${this.timepoint.relativeValue} ${value} ${newTimepoint.relativeValue}`)
        if ( this.timeCoordinates.isTimepointInBounds(newTimepoint, restrictToSingleAxis ) ) {
            // console.log("Viewport::step in bounds")
            this.timepoint.add(value)
            return true
        }
        if ( this.timeCoordinates.earlierThanAxis(newTimepoint, restrictToSingleAxis ) ) {
            // console.log("Viewport::step at start")
            this.setTimePoint(this.timeCoordinates.beginning(restrictToSingleAxis))
            return true
        }
        if ( this.timeCoordinates.laterThanAxis(newTimepoint, restrictToSingleAxis ) ) {
            // console.log("Viewport::step at end")
            this.setTimePoint(this.timeCoordinates.theEnd(restrictToSingleAxis))
            return true
        }
        return false
    }

    gotoStart() {
        this.startInPixels = 0
    }

    getVisiblePeriod() {
        return { "start": this.startInPixels, "end": this.startInPixels + this.widthInPixels }
    }
}