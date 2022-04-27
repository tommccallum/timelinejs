// TimeBands are behind the axis and therefore do not receive user events
// therefore to adjust height we add the splitter handles to the eventbands and
// listen to any changes.
class TimeBandCollection {
    constructor() {
        this.timebands = []
        this.element =null
    }

    setElement(el) {
        this.element = el
        this._setElementForBands()
    }
    
    _setElementForBands() {
        for( let ii=0; ii < this.timebands.length; ii++ ) {
            this.timebands[ii].parent = this.element
        }
    }

    add(timeband) {
        if ( timeband.hasOwnProperty("index") === false ) {
            timeband.index = 0
        }
        // the higher the index the nearer to the top it is, its like z index
        // indices could be negative in which case the nearer to the bottom it would be
        for( let ii=0; ii < this.timebands.length; ii++ ) {
            if ( this.timebands[ii].index < timeband.index ) {
                this.timebands = this.timebands.splice(ii, 0, timeband)
                return
            }
        }
        this.timebands.push(timeband)
    }

    setTimeAxisCollection(timeAxisCollection) {
        for( let ii=0; ii < this.timebands.length; ii++ ) {
            this.timebands[ii].setTimeAxisCollection(timeAxisCollection)
        }
    }


    // Drawing is controlled from the event band
    // draw(canvasElement) {
    //     console.log("TimeBandCollection::draw")
    //     // draw the bands that group events together
    //     const self = this
    //     const canvasStyle  = window.getComputedStyle(canvasElement)
    //     let availableHeight = parseInt(canvasStyle.height)

    //     let lowerBandCount = this.bandCount
    //     let top = 0;
    //     for( let timebandArr of this.timebands) {
    //         for ( let timeband of timebandArr) {
    //             const h = timeband.draw(canvasElement, top, availableHeight / lowerBandCount)
    //             availableHeight -= h
    //             top += h
    //             lowerBandCount --
    //         }
    //     }
    // }

    static createRandom(n) {
        const tbc = new TimeBandCollection()
        const tb = new TimeBand()
        tb.name = "Timeband 1"
        tb.backgroundColor = "orange"
        tb.updateElement()
        for( let ii=0; ii < 10; ii++ ) {
            const ev = new Event()
            ev.name = "New Event " + ii
            tb.addEvent(ev)
        }
        for( let ii=0; ii < 10; ii++ ) {
            const ev = new Event()
            ev.name = "Overlapped " + ii
            ev.setWhen("5AD")
            tb.addEvent(ev)
        }
        tbc.add(tb)
        if ( n == 1 ) {
            return tbc
        }
        const tb2 = new TimeBand()
        tb2.name = "Timeband 2"
        tb2.backgroundColor = "red"
        tb2.updateElement()
        const ev2 = new Event()
        ev2.name = "Period test from 0AD to 50AD"
        ev2.end = new TimePoint("50AD")
        tb2.addEvent(ev2)
        tbc.add(tb2)
        if ( n == 2 ) {
            return tbc
        }
        
        const tb3 = new TimeBand()
        tb3.name = "Timeband 3"
        tb3.backgroundColor = "green"
        tb3.updateElement()
        tbc.add(tb3)
        if ( n == 3 ) {
            return tbc
        }
        

        const tb4 = new TimeBand()
        tb4.name = "Timeband 4"
        tb4.backgroundColor = "purple"
        tb4.updateElement()
        tbc.add(tb4)
        return tbc
    }
}

