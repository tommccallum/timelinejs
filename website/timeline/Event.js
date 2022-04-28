class Event extends Observable {

    constructor(data = null) {
        super()
        this.name = "New Event"
        this.historyCredit = null
        this.historyCreditLink = null
        this.image = null
        this.imageCredit = null
        this.imageCreditLink = null
        this.imageBackgroundColor = null

        this.description = "some description"
        this.gallery = null       // multiple images to show in the detail box
        
        this.style = "event-default"
        this.start = new TimePoint("0AD")
        this.end = new TimePoint("0AD")
        this.zIndex = 50
        this.lastViewportRect = null
        this.moreDetailsDialogElement = null
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
            if ( data.hasOwnProperty("description")) {
                this.description = convertTextToHTML(data.description)
            }
            if ( data.hasOwnProperty("descriptionHTML")) {
                this.description = data.descriptionHTML
            }
            if ( data.hasOwnProperty("historyCredit")) {
                this.historyCredit = data.historyCredit
            }
            if ( data.hasOwnProperty("historyCreditLink")) {
                this.historyCreditLink = data.historyCreditLink
            }
            if ( data.hasOwnProperty("style")) {
                if ( data.style === "" || data.style === null || data.style === "default" ) {
                    this.style = "event-default"
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

    isObservable() {
        if ( this.style === "title" ) {
            return false
        }
        return true
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
        let textDiv = null
        if ( this.image == null ) {
            event = document.createElement("div")
            event.classList.add("event")
            event.classList.add(this.style)
            event.innerText = this.name
            event.title = event.innerText 
            if ( this.isPeriod() ) {
                event.title += " (" + this.start.toString() + "-" + this.end.toString()+")"
            } else {
                event.title += " (" + this.start.toString() + ")"
            }
            textDiv = event
        } else {
            event = document.createElement("div")
            event.classList.add("event")
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
            textDiv = document.createElement("div")
            textDiv.innerText = this.name
            if ( this.isPeriod() ) {
                textDiv.title = this.name + " at " + this.start.toString() + " to " + this.end.toString()
            } else {
                textDiv.title = this.name + " at " + this.start.toString()
            }
            textDiv.classList.add("event-image64-and-label-label")
            event.appendChild(textDiv)
        }

        // add a magnifying glass icon if there is a description
        // UTF-8: &#128270;
        if ( this.description != null ) {
            textDiv.innerHTML += `&nbsp;`
            let moreDiv = document.createElement("div")
            moreDiv.classList.add("event-icon")
            moreDiv.classList.add("event-more-icon")
            moreDiv.innerHTML = "&#128270;"
            moreDiv.addEventListener("click", function(e) { 
                self._onShowMoreLink(e)
            })
            textDiv.appendChild(moreDiv)
        }
        if ( this.historyCredit != null && this.historyCreditLink === null ) {
            let linkDiv = document.createElement("div")
            linkDiv.classList.add("event-icon")
            linkDiv.classList.add("event-thanks-icon")
            linkDiv.innerHTML = "&#128591;"
            linkDiv.title = this.historyCredit
            textDiv.appendChild(linkDiv)
        } else {
            if ( this.historyCredit ) {
                let a = document.createElement("a")
                a.title = this.historyCredit
                a.href = this.historyCreditLink
                a.classList.add("event-external-link")
                a.classList.add("event-icon")
                a.classList.add("event-link-icon")
                a.innerHTML = "&#128279;"
                a.target = "_blank"
                textDiv.appendChild(a)
            } else {
                let a = document.createElement("a")
                a.title = this.historyCreditLink
                a.href = this.historyCreditLink
                a.classList.add("event-external-link")
                a.classList.add("event-icon")
                a.classList.add("event-link-icon")
                a.innerHTML = "&#128279;"
                a.target = "_blank"
                textDiv.appendChild(a)
            }
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

    _onShowMoreLink(e) {
        const self = this
        this.selectCurrentEvent()
        // console.log(`show more for this event: ${this.name}`)

        if ( !this.moreDetailsDialogElement ) {
            this.moreDetailsDialogElement = document.createElement("div")
            this.moreDetailsDialogElement.classList.add("event-details")
            this.moreDetailsDialogElement.style.display = null
            this.moreDetailsDialogElement.style.visibility = "visible"

            let containerDiv = document.createElement("div")
            containerDiv.classList.add("event-details-container")
            this.moreDetailsDialogElement.appendChild(containerDiv)
            
            let contentDiv = document.createElement("div")
            contentDiv.classList.add("event-details-content")
            containerDiv.appendChild( contentDiv ) 
            let descriptionDiv = contentDiv
            if ( this.galleryImages != null ) {
                let leftDiv = document.createElement("div")
                leftDiv.classList.add("event-details-content-left")
                containerDiv.appendChild( leftDiv ) 

                let rightDiv = document.createElement("div")
                rightDiv.classList.add("event-details-content-right")
                rightDiv.classList.add("event-details-description")
                containerDiv.appendChild( rightDiv ) 
                let descriptionDiv = rightDiv
            } else {
                let centerDiv = document.createElement("div")
                centerDiv.classList.add("event-details-content-description")
                centerDiv.innerHTML = this.description
                contentDiv.appendChild( centerDiv ) 
            }

            let creditDiv = document.createElement("div")
            creditDiv.classList.add("event-details-description-credits")
            if ( this.historyCreditLink !== null ) {
                let a = document.createElement("a")
                a.classList.add("event-details-description-credit-link")
                a.target = "_blank"
                a.href = this.historyCreditLink
                a.innerHTML = this.historyCredit
                creditDiv.appendChild(a)
            } else {
                creditDiv.innerHTML = this.historyCredit
            }
            descriptionDiv.appendChild(creditDiv)

            let buttonDiv = document.createElement("div")
            buttonDiv.classList.add("event-details-buttons")
            containerDiv.appendChild( buttonDiv ) 
            
            const closeButton = document.createElement("button")
            closeButton.innerText = "Close"
            closeButton.addEventListener("click", function(e) { self.sendEvent("hide-event-details", self.moreDetailsDialogElement)})
            buttonDiv.appendChild( closeButton )

            this.sendEvent("show-event-details", this.moreDetailsDialogElement)
        } else {
            this.sendEvent("show-event-details", this.moreDetailsDialogElement)
        }
        e.stopPropagation()
    }
    getEventsThatIntersectOnScreen(viewportRect) {
        let events = []
        const thisStyle = window.getComputedStyle(this.element)
        for( let ev of this.eventband.timeband.events ) {
            if ( ev != this ) {
                const style = window.getComputedStyle(ev.element)
                if ( ev.isVisibleOnScreen(viewportRect) ) {
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
            }
        }
        // console.log(`${this.name} ${events.length}`)
        return events
    }

    selectCurrentEvent() {
        const selectedEvents = document.querySelectorAll(".event-selected")
        if ( selectedEvents !== null ) {
            for ( let ev of selectedEvents ) {
                ev.classList.remove("event-selected")
            }
        }
        this.element.classList.add("event-selected")
    }
    _onClick(e) {
        // console.log("Event::click")
        this.selectCurrentEvent()
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

    getPaddedHeight() {
        const style = window.getComputedStyle(this.element)
        return parseInt(style.height) + parseInt(style.paddingTop) + parseInt(style.paddingBottom)
    }

    getTop() {
        const style = window.getComputedStyle(this.element)
        return parseInt(style.top)
    }
    
    arrange(viewportRect) {
        if ( !this.isVisibleOnScreen(viewportRect) ) return;
        if ( this.style === "title" ) return; // no need to arrange this as it should be in the background

        // how many events cover us
        // strategy 1 we have vertical space, we can move the covering events down
        // const events = this.eventband.timeband.getEventsThatIntersect(this.start, this.end)
        const events = this.getEventsThatIntersectOnScreen(viewportRect)
        // console.log(`event::arrange ${this.name} ${events.length}`)
        if ( events.length == 0 ) {
            return
        }

        if ( events.length > 0 ) {
            // once we run out of space we don't want to move them to the right
            // what do we do?
            const margin = 5
            let top = this.getTop() + this.getPaddedHeight() + margin
            let availableHeight = this.eventband.getHeight() - margin
            for( let ii=0; ii < events.length; ii++ ) {
                events[ii].setVisible(true) // need to make visible to get height
                const style = window.getComputedStyle(events[ii].element)
                const h = parseInt(style.height) + parseInt(style.paddingTop) + parseInt(style.paddingBottom)
                if ( availableHeight > h + margin) {
                    // console.log(`adjusting event ${events[ii].name} to ${top}px`)
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
        this.lastViewportRect = viewportRect
        // console.log(viewportRect)
        if ( !this.element ) {
            this.createElement()
        }
        if ( this.isVisibleOnScreen(viewportRect) ) {
            // console.log(`Add event ${this.name}`)
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
