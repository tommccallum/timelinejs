class Event {
    constructor(data = null) {
        this.name = "New Event"
        this.description = "some description"
        this.image = null
        this.imageCredit = null
        this.imageCreditLink = null
        this.imageBackgroundColor = null
        this.style = "event"
        this.start = new TimePoint("0AD")
        this.end = new TimePoint("0AD")
        this.zIndex = 50

        if ( data ) {
            if ( data.hasOwnProperty("name")) {
                this.name = data.name
            }
            if ( data.hasOwnProperty("image")) {
                this.image = data.image
            }
            if ( data.hasOwnProperty("imageCredit")) {
                this.imageCredit = data.imageCredit
            }
            if ( data.hasOwnProperty("imageCreditLink")) {
                this.imageCreditLink = data.imageCreditLink
            }
            if ( data.hasOwnProperty("imageBackgroundColor")) {
                this.imageBackgroundColor = data.imageBackgroundColor
            }
            if ( data.hasOwnProperty("style")) {
                if ( data.style === "" || data.style === null || data.style === "default" ) {
                    this.style = "event"
                } else {
                    this.style = "event-" + data.style
                }
            }
            if ( data.hasOwnProperty("start") || data.hasOwnProperty("end")) {
                if ( data.hasOwnProperty("start")) {
                    this.start = new TimePoint(data.start)
                } else {
                    this.start = null
                }
                if ( data.hasOwnProperty("end")) {
                    this.end = new TimePoint(data.end)
                } else {
                    this.end = null
                }

                // if start or end is not given then its a point event and both should be the same
                if ( this.start === null && this.end !== null ) {
                    this.start = this.end.copy()
                }
                if ( this.start !== null && this.end === null ) {
                    this.end = this.start.copy()
                }
                if ( this.start === null && this.end === null ) {
                    alert(`Error in event ${this.name}, both start and end are null`)
                }
            }
        }
        this.element = null

        console.assert(this.start !== null)
        console.assert(this.end !== null)
        console.assert(typeof(this.start) !== "undefined")
        console.assert(typeof(this.end) !== "undefined")
        
    }

    isPeriod() {
        if ( this.start !== null && this.end === null ) {
            return false
        }
        if ( this.start.isEqual(this.end) ) {
            return false
        }
        return true
    }

    setWhen(start,end) {
        if ( typeof(start) === "string" || typeof(start) === "number") {
            start = new TimePoint(start)
        }
        if ( typeof(end) === "string" ||  typeof(end) === "number") {
            end = new TimePoint(end)
        }
        this.start = start.copy()
        if (typeof(end) === "undefined" ) {
            this.end = this.start.copy()
        }
    }

    intersects(start, end ) {
        return !(start.isAfter(this.end) || end.isBefore(this.start))
    }

    createElement() {
        const self = this
        let event = null
        let image = null
        if ( this.image == null ) {
            event = document.createElement("div")
            event.classList.add(this.style)
            event.innerText = this.name
        } else {
            event = document.createElement("div")
            event.classList.add(this.style)
            event.classList.add("event-image64-and-label-container")
            let imageDiv = document.createElement("div")
            imageDiv.classList.add("event-image64-and-label-image")
            if ( this.imageBackgroundColor !== null ) {
                imageDiv.style.backgroundColor = this.imageBackgroundColor
            }
            let img = document.createElement("img")
            img.src = this.image
            img.title = this.imageCredit
            imageDiv.appendChild(img)
            event.appendChild(imageDiv)
            let textDiv = document.createElement("div")
            textDiv.innerText = this.name
            if ( this.isPeriod() ) {
                textDiv.title = this.name + " at " + this.start.toString() + " to " + this.end.toString()
            } else {
                textDiv.title = this.name + " at " + this.start.toString()
            }
            textDiv.classList.add("event-image64-and-label-label")
            event.appendChild(textDiv)
        }
        event.addEventListener("mousedown", function(e) { self._onMouseDown(e) })
        event.addEventListener("mousemove", function(e) { self._onMouseMove(e) })
        event.addEventListener("click", function(e) { self._onClick(e) })
        this.element = event

        if ( this.image ) {
            const img = document.createElement("img")
            this.element.appendChild(img)
        }
    }

    getEventsThatIntersectOnScreen() {
        let events = []
        const thisStyle = window.getComputedStyle(this.element)
        for( let ev of this.eventband.timeband.events ) {
            const style = window.getComputedStyle(ev.element)
            const thisLeft = parseInt(thisStyle.left)
            const thisRight = parseInt(thisStyle.left) + parseInt(thisStyle.width) + parseInt(thisStyle.paddingLeft) + parseInt(thisStyle.paddingRight)
            const thisTop = parseInt(thisStyle.top)
            const thisBottom = parseInt(thisStyle.top) + parseInt(thisStyle.height) + parseInt(thisStyle.paddingTop) + parseInt(thisStyle.paddingBottom)
            
            const thatLeft = parseInt(style.left)
            const thatRight = parseInt(style.left) + parseInt(style.width) + parseInt(style.paddingLeft) + parseInt(style.paddingRight)
            const thatTop = parseInt(style.top)
            const thatBottom = parseInt(style.top) + parseInt(style.height) + parseInt(style.paddingTop) + parseInt(style.paddingBottom)
            
            if ( thatRight < thisLeft || thatLeft > thisRight || thisBottom < thatTop || thisTop > thatBottom ) {
                // does not intersect
            } else {
                events.push(ev)
            }
        }
        return events
    }

    _onClick(e) {
        // console.log("Event::click")
        const events = this.getEventsThatIntersectOnScreen() 
        for ( let ev of events ) {
            if ( ev != this ) {
                ev.element.style.zIndex = this.zIndex
            } else {
                ev.element.style.zIndex = 999
            }
        }
        e.stopPropagation()
    }

    _onMouseDown(e) {
        // console.log("Event::mousedown")
        e.stopPropagation()
    }

    _onMouseMove(e) {
        // NOTE(tm) If we stop the events here then the time band splitters cannot do their thing so we need to be careful of that.
        // console.log("Event::mousemove")
        //e.stopPropagation()
    }

    isVisibleOnScreen(viewportRect) {
        // console.log(viewportRect)
        // console.log(`Event::isVisibleOnScreen ${this.end} ${this.name}`)
        if ( viewportRect.timepointLeft.isAfter(this.end) ) {
            return false
        }
        if ( viewportRect.timepointRight.isBefore(this.start) ) {
            return false
        }
        return true 
    }

    setVisible(b) {
        if ( b ) {
            this.element.style.visibility = "visible"
            this.element.style.display = ""
        } else {
            this.element.style.visibility = "hidden"
            this.element.style.display = "none"
        }
    }

    setPosition(viewportRect) {
        const virtualPixels = viewportRect.timeAxisCollection.calcRelativeTimepointInVirtualPixels(this.start.relativeValue)
        const x = virtualPixels - viewportRect.left
        // console.log(`Event position: ${virtualPixels} ${viewportRect.left} ${x}`)
        this.element.style.left = x + "px"
    }

    setWidth(viewportRect) {
        if ( this.start.isEqual(this.end) ) return // this is an event point
        const start = viewportRect.timeAxisCollection.getVirtualX(this.start.relativeValue)
        const end = viewportRect.timeAxisCollection.getVirtualX(this.end.relativeValue)
        // assume its shown we don't test for that
        let w = end - start
        const style = window.getComputedStyle(this.element)
        w -= parseInt(style.paddingRight) + parseInt(style.paddingLeft) + parseInt(style.marginLeft) + parseInt(style.marginRight)
        this.element.style.width = w + "px"
    }

    arrange(viewportRect) {
        if ( !this.isVisibleOnScreen(viewportRect) ) return;
        if ( this.style === "title" ) return; // no need to arrange this as it should be in the background

        // how many events cover us
        // strategy 1 we have vertical space, we can move the covering events down
        const events = this.eventband.timeband.getEventsThatIntersect(this.start, this.end)
        // console.log(`event::arrange ${this.name} ${events.length}`)
        if ( events.length == 1 ) {
            return
        }

        if ( events.length > 1 ) {
            // once we run out of space we don't want to move them to the right
            // what do we do?
            const margin = 5
            let top = margin
            let availableHeight = this.eventband.getHeight() - margin
            for( let ii=0; ii < events.length; ii++ ) {
                events[ii].setVisible(true) // need to make visible to get height
                const style = window.getComputedStyle(events[ii].element)
                const h = parseInt(style.height) + parseInt(style.paddingTop) + parseInt(style.paddingBottom)
                if ( availableHeight > h + margin) {
                    events[ii].element.style.top = top + "px"
                    availableHeight -= h + margin
                    top += h + margin
                    events[ii].setVisible(true)
                } else {
                    // not enough room so we hide
                    availableHeight = 0
                    events[ii].setVisible(false)
                }
            }
        }
        
    }

    draw(viewportRect) {
        // console.log(viewportRect)
        if ( !this.element ) {
            this.createElement()
        }
        if ( this.isVisibleOnScreen(viewportRect) ) {
            console.log(`Add event ${this.name}`)
            this.setPosition(viewportRect)
            this.setWidth(viewportRect)
            this.setVisible(true)
            return this.element
        } else {
            this.setVisible(false)
            return null
        }
    }
}
