class PeriodInRealityUnits {
    constructor() {
        this.start = 0
        this.end = 0
    }
}

class PeriodInTimelineUnits {
    constructor() {
        this.start = 0
        this.end = 0
    }

    inBounds() {
        return ( this.start != null && this.end != null ) 
    }
}
