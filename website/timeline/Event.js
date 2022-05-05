class Event extends Observable {

    constructor(data = null) {
        super()
        this.verticalMarginBetweenEvents = 5
        this.data = data
        this.eventband = null // set in TimeBand
        this.element = null;
        this.internalDiv = null;

        this.name = "New Event"
        this.historyCredit = null
        this.historyCreditLink = null
        this.image = null
        this.imageCredit = null
        this.imageCreditLink = null
        this.imageBackgroundColor = null

        this.description = null
        this.gallery = null       // multiple images to show in the detail box
        
        this.style = "event-default"
        this.start = new TimePoint("0AD")
        this.end = new TimePoint("0AD")
        this.zIndex = 50
        this.lastViewportRect = null
        this.moreDetailsDialogElement = null
        this.children = []
        this.childrenAreVisible = false

        // these are used to reinstate during selection
        this.renderedWidth = null
        this.virtualWidth = null
        this.expandAnimation = null
        this.collapseAnimation = null
        this.expandAnimationOnMouseEnterCallback = null
        this.expandAnimationOnMouseLeaveCallback = null

        if ( data ) {
            // NOTE(tm) We cannot add children here as they still need to be created and attached to the valid timeband
            // so have to go through timeband::addEvent
            if ( data.hasOwnProperty("name")) {
                this.name = data.name
            }
            if ( data.hasOwnProperty("image")) {
                this.image = data.image
            }
            if ( data.hasOwnProperty("imageCredit")) {
                this.imageCredit = data.imageCredit
            }
            if ( data.hasOwnProperty("gallery")) {
                // a gallery item can have the following properties
                // thumbnail, image, imageCreditLink
                this.gallery = data.gallery
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

    
    setBandOnEvent(eventband) {
        this.eventband = eventband
        if ( this.hasChildren() ) {
            for( let child of this.children ) {
                child.setBandOnEvent(eventband)
            }
        }
    }

    hasCanvasElement() {
        return this.eventband && this.eventband.element !== null
    }

    isObservable() {
        if ( this.style === "event-title" ) {
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

    hasChildren() {
        return !!this.children && this.children.length > 0
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

            this.internalDiv = document.createElement("div")
            this.internalDiv.classList.add("event-internal-container")
            event.appendChild(this.internalDiv)

            // Need to set HTML rather than text due to HTML UTF-8 characters.
            this.internalDiv.innerHTML = this.name 
            this.internalDiv.title = this.internalDiv.innerText 
            if ( this.isPeriod() ) {
                this.internalDiv.title += " (" + this.start.toString() + "-" + this.end.toString()+")"
            } else {
                this.internalDiv.title += " (" + this.start.toString() + ")"
            }
            textDiv = this.internalDiv

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

        if ( this.hasChildren() ) {
            const expandIcon = document.createElement("div")
            expandIcon.innerHTML = "&#x27F4;"
            expandIcon.classList.add("event-icon")
            expandIcon.classList.add("event-children-expand")
            expandIcon.title = "Click to toggle children"
            expandIcon.addEventListener("click", function(e) {
                if ( self.childrenAreVisible ) {
                    self.childrenAreVisible = false
                } else {    
                    self.childrenAreVisible = true
                }
                self.sendEvent("events-arrange", self)
            })
            textDiv.appendChild(expandIcon)
        }

        if ( this.isObservable() ) {
            // add a magnifying glass icon if there is a description
            // UTF-8: &#128270;
            if ( this.description != null || this.gallery != null) {
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
        }
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
            // this is made PER EVENT
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
            console.log(`${this.name}`)
            console.log(this.gallery)
            console.log(this.description)
            if ( this.gallery !== null && this.description !== null ) {
                let leftDiv = document.createElement("div")
                leftDiv.classList.add("event-details-content-left")
                containerDiv.appendChild( leftDiv ) 

                let rightDiv = document.createElement("div")
                rightDiv.classList.add("event-details-content-right")
                rightDiv.classList.add("event-details-description")
                containerDiv.appendChild( rightDiv ) 
                let descriptionDiv = rightDiv
            } else if ( this.gallery != null ) {
                let centerDiv = document.createElement("div")
                centerDiv.classList.add("event-details-content-gallery")
                contentDiv.appendChild( centerDiv ) 

                for( let g of this.gallery ) {
                    console.log(g)
                    let imageSrc = null
                    if ( g.hasOwnProperty("thumbnail") ) {
                        imageSrc = g.thumbnail
                    } else if ( g.hasOwnProperty("image") ) {
                        imageSrc = g.image
                    } else {
                        imageSrc = "images/no_image_128x128.png"
                    }

                    const img = document.createElement("img")
                    img.src = imageSrc
                    if ( g.hasOwnProperty("alt") ) {
                        img.alt = g.alt
                    } 
                    img.classList.add("gallery-thumbnail")
                    if ( g.alt && g.imageCredit ) {
                        img.title = g.alt + "\nCredit: " + g.imageCredit
                    } else if ( g.alt ) {
                        img.title = g.alt
                    } else if ( g.imageCredit ) {
                        img.title = g.imageCredit
                    } else {
                        // no title
                    }
                    const thisG = g
                    img.addEventListener("click", function(e) { self._makeBigImage(e, thisG) })
                    centerDiv.appendChild(img)
                }


            } else {
                let centerDiv = document.createElement("div")
                centerDiv.classList.add("event-details-content-description")
                centerDiv.innerHTML = this.description
                contentDiv.appendChild( centerDiv ) 
            }

            let creditDiv = document.createElement("div")
            creditDiv.classList.add("event-details-description-credits")
            creditDiv.innerHTML = "Source(s):&nbsp;"
            if ( this.historyCreditLink !== null ) {
                let a = document.createElement("a")
                a.classList.add("event-details-description-credit-link")
                a.target = "_blank"
                a.href = this.historyCreditLink
                a.innerHTML = this.historyCredit
                creditDiv.appendChild(a)
            } else {
                creditDiv.innerHTML += this.historyCredit 
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

    _makeBigImage(e, imageDetails) {
        // We pass this through to the timeline which can handle this as its the same
        // for all images.
        // This differs for the event which might differ by which event we are exploring.
        this.sendEvent("show-big-image", imageDetails)
    }

    containsEvent(ev) {
        if ( !this.children ) return false
        for( let e of this.children ) {
            if ( e === ev ) {
                return true
            }
        }
        return false
    }

    doesEventIntersectOnScreen(viewportRect, ev) {
        const thisStyle = window.getComputedStyle(this.element)
        if ( ev.isVisibleOnScreen(viewportRect) ) {
            if ( ev.element == null ) {
                return false
            }    
            // FIX(04/05/2022) When left goes negative the comparison changes from passing to failing for Alpin-Dunkeld

            const style = window.getComputedStyle(ev.element)
            const thisLeft = parseInt(thisStyle.left)
            const thisTotalWidth = parseInt(thisStyle.width) + parseInt(thisStyle.paddingLeft) + parseInt(thisStyle.paddingRight)
            const thisRight = parseInt(thisStyle.left) + thisTotalWidth
            const thisTop = parseInt(thisStyle.top)
            const thisBottom = parseInt(thisStyle.top) + parseInt(thisStyle.height) + parseInt(thisStyle.paddingTop) + parseInt(thisStyle.paddingBottom)
            
            const thatLeft = parseInt(style.left)
            const thatTotalWidth = parseInt(style.width) + parseInt(style.paddingLeft) + parseInt(style.paddingRight)
            const thatRight = parseInt(style.left) + thatTotalWidth
            const thatTop = parseInt(style.top)
            const thatBottom = parseInt(style.top) + parseInt(style.height) + parseInt(style.paddingTop) + parseInt(style.paddingBottom)
            
            if ( thisLeft >= thatRight || thisRight <= thatLeft || thisBottom <= thatTop || thisTop >= thatBottom ) {
                // does not intersect
                // console.log(`THIS: ${this.name} ${thisTotalWidth} THAT: ${ev.name} ${thatTotalWidth} R${thatRight} <= L${thisLeft} ${parseInt(thisStyle.width)} ${parseInt(style.width)} NO INTERSECT`)
            } else {
                // console.log(`THIS:${this.name} ${thisTotalWidth} THAT: ${ev.name} ${thatTotalWidth}  R${thatRight} <= L${thisLeft} ${parseInt(thisStyle.width)} ${parseInt(style.width)} INTERSECT`)
                return true
            }
        }
        return false
    }

    getEventsThatIntersectOnScreen(viewportRect, checkThisEventsChildren = true) {
        let events = []
        for( let ev of this.eventband.timeband.events ) {
            if ( !ev.isObservable() ) continue;
            if ( ev != this ) {
                if ( this.doesEventIntersectOnScreen(viewportRect, ev) ) {
                    events.push(ev)
                }
            }
            // we only want to ignore our own children, we don't want to ignore others already laid out.
            if ( this != ev || checkThisEventsChildren  ) {
                if ( ev.childrenAreVisible ) {
                    for( let child of ev.children ) {
                        if ( child != this ) {
                            // console.log(child)
                            if ( this.doesEventIntersectOnScreen(viewportRect, child) ) {
                                events.push(child)
                            }
                        }
                    }
                }
            }
        }
        // console.log(`${this.name} ${events.length}`)
        return events
    }

    

    selectCurrentEvent() {
        if ( !this.isSelected() ) {
            this.sendEvent('event-deselect-all', null)
            if ( this.element ) {
                this.element.classList.add("event-selected")
                this.disableExpandableAnimation()
            }
        } else {
            this.sendEvent('event-deselect-all', null)
        }
    }

    isSelected() {
        if ( this.element ) {
            return this.element.classList.contains("event-selected")
        } 
        return false
    }

    deselect() {
        if ( this.element ) {
            let startCollapse = false
            if ( this.isSelected() ) {
                startCollapse = true
            }
            this.element.classList.remove("event-selected")
            if ( this.requiresExpandAnimation() ) {
                this.addExpandableAnimation()
                if ( startCollapse ) {
                    this.onMouseLeaveCallback()
                }
            }
        }
    }

    deselectChildren() {
        if ( this.hasChildren() ) {
            for( let child of this.children ) {
                child.deselect()
                child.deselectChildren()
            }
        }
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
        //console.log(viewportRect)
        // if ( this.style === "event-title" && this.name === "History" ) {
        //     console.log(`${this.name} Event::isVisibleOnScreen ${this.start} -> ${this.end} ${viewportRect.timepointLeft.toString()} ${viewportRect.timepointRight.toString()}`)
        // }
        if ( viewportRect.timepointLeft.isAfter(this.end) ) {
            return false
        }
        if ( viewportRect.timepointRight.isBefore(this.start) ) {
            return false
        }
        return true 
    }

    setVisible(b) {
        // should we try to correct this?  normally its happening with children
        if ( !this.element ) return
        if ( b ) {
            this.element.style.visibility = "visible"
            this.element.style.display = ""
        } else {
            this.element.style.visibility = "hidden"
            this.element.style.display = "none"
            if ( this.element && this.hasCanvasElement() && this.eventband.element.contains(this.element) ) {
                this.eventband.element.removeChild(this.element)
            }
        }
    }

    setPosition(viewportRect) {
        const virtualPixels = viewportRect.timeAxisCollection.calcRelativeTimepointInVirtualPixels(this.start.relativeValue)
        const x = virtualPixels - viewportRect.left
        
        // NOTE(05/05/2022) We had an issue where an event would fail the intersection seemingly at random
        // it turned out this was because x was floating point and the conversion to int was a truncation.
        // Rounding here gives a deterministic value for the left value which seems to stop the random behaviour.
        this.element.style.left = Math.round(x) + "px"

        // console.log(`${this.name} Event position: ${virtualPixels} ${viewportRect.left} ${x} ${Math.round(x)}`)
    }

    setWidth(viewportRect) {
        // if ( this.start.isEqual(this.end) ) return // this is an event point

        // this gets the width in terms of time but we need to max this with the length of the name

        const start = viewportRect.timeAxisCollection.getVirtualX(this.start.relativeValue)
        const end = viewportRect.timeAxisCollection.getVirtualX(this.end.relativeValue)
        
        // assume its shown we don't test for that
        let virtualWidth = end - start
        this.element.style.width = null // we want to refresh this
        this.element.offsetWidth // force recalculate
        
        const style = window.getComputedStyle(this.element)
        let renderedWidth = 0;
        if ( style.width === "auto" ) {
            renderedWidth = this.element.offsetWidth
        } else {
            renderedWidth = parseInt(style.width)
        }

        this.renderedWidth = renderedWidth
        this.virtualWidth = virtualWidth

        if ( renderedWidth < virtualWidth || this.childrenAreVisible || this.isSelected() ) {
            let w = Math.max(virtualWidth, renderedWidth)
            // console.log(`${this.name} ${start} ${end} ${virtualWidth} ${renderedWidth} ${w}`)
            
            // NOTE(04/05/2022) We have remove the padding from the width, otherwise the pointer date won't align.
            if ( !isNaN(w)) {
                const padding = parseInt(style.paddingLeft) + parseInt(style.paddingRight)
                if ( virtualWidth > renderedWidth + padding ) {
                    this.element.style.width = w - padding + "px"
                } else {
                    this.element.style.width = w + "px"
                }
            } 
            this.internalDiv.style.visibility = 'visible'
            this.disableExpandableAnimation()
        } else {
            // console.log(`${this.name} r:${renderedWidth} v: ${virtualWidth} setting animation`)
            // here we are going to use an expanding version
            this.internalDiv.style.visibility = 'hidden'
            this.element.style.width = virtualWidth + "px"
            this.addExpandableAnimation()
        }
    }

    requiresExpandAnimation() {
        if ( this.virtualWidth != null && this.renderedWidth != null ) {
            if ( this.renderedWidth >= this.virtualWidth ) {
                if ( this.childrenAreVisible || this.isSelected() ) {
                    return false
                }
                return true
            }
        }
        return false
    }
    
    disableExpandableAnimation() {
        if ( this.expandAnimationOnMouseEnterCallback ) {
            this.element.removeEventListener("mouseenter", this.expandAnimationOnMouseEnterCallback)
        }
        if ( this.expandAnimationOnMouseLeaveCallback ) {
            this.element.removeEventListener("mouseleave", this.expandAnimationOnMouseLeaveCallback)
        }
        this.expandAnimation = null
    }

    addExpandableAnimation() {
        const startWidth = this.virtualWidth
        const targetWidth = this.renderedWidth

        const self = this
        if ( this.expandAnimation != null ) {
            if ( this.expandAnimation.targetWidth === targetWidth && this.expandAnimation.startWidth === startWidth ) {
                // nothing to do as its the same animation
                return
            } else {
                // reset the callbacks and the animation
                this.disableExpandableAnimation()
            }
        }
        
        
        this.expandAnimation = new ExpandAnimation(this.element, startWidth, targetWidth, 10, 10)
        this.collapseAnimation = new CollapseAnimation(this.element, targetWidth, startWidth, 10, 10)
        this.collapseAnimation.onCompletion(function() {
            self.internalDiv.style.visibility = 'hidden'
        })

        this.expandAnimationOnMouseEnterCallback = function(e) {
            self.onMouseEnterCallback()
        }

        this.expandAnimationOnMouseLeaveCallback = function(e) {
            self.onMouseLeaveCallback()
        }

        this.element.addEventListener("mouseenter", this.expandAnimationOnMouseEnterCallback)
        this.element.addEventListener("mouseleave", this.expandAnimationOnMouseLeaveCallback)
    }

    onMouseEnterCallback() {
        this.collapseAnimation.stop()
        this.expandAnimation.reset()
        if ( this.expandAnimation.isStopped() ) {
            this.expandAnimation.start()
        }
        const style = window.getComputedStyle(this.element)
        this.element.style.zIndex = parseInt(style.zIndex) + 1
        this.internalDiv.style.visibility = 'visible'
    }

    onMouseLeaveCallback() {
        this.expandAnimation.stop()
        this.collapseAnimation.reset()
        if ( this.collapseAnimation.isStopped() ) {
            this.collapseAnimation.start()
        }
        const style = window.getComputedStyle(this.element)
        this.element.style.zIndex = parseInt(style.zIndex) - 1
    }
    
    
    getPaddedHeight() {
        const style = window.getComputedStyle(this.element)
        return parseInt(style.height) + parseInt(style.paddingTop) + parseInt(style.paddingBottom)
    }

    getTop() {
        const style = window.getComputedStyle(this.element)
        return parseInt(style.top)
    }
    
    getLeft() {
        const style = window.getComputedStyle(this.element)
        return parseInt(style.left)
    }

    getRight() {
        return this.getLeft() + this.getPaddedWidth()
    }

    getPaddedWidth() {
        const style = window.getComputedStyle(this.element)
        return parseInt(style.width) + parseInt(style.paddingLeft) + parseInt(style.paddingRight)
    }

    isChild(ev) {
        if ( !this.hasChildren() ) return false
        for( let e of this.children ) {
            if ( e === ev ) {
                return true
            }
        }
        return false
    }

    arrange(viewportRect, minimumTopValue = 0) {
        // This is called from timeband.arrange for each event in the timeband.

        if ( !this.isVisibleOnScreen(viewportRect) ) return;
        if ( !this.isObservable() ) return; // no need to arrange this as it should be in the background

        // how many events cover us
        // strategy 1 we have vertical space, we can move the covering events down
        // const events = this.eventband.timeband.getEventsThatIntersect(this.start, this.end)
        const checkThisEventsChildren  = false
        const events = this.getEventsThatIntersectOnScreen(viewportRect, checkThisEventsChildren )
        if ( events.length == 0 ) {
            // NOTE(05/05/2022) We need to accomodate for the fact that this might be a child and we always
            // want to show children UNDER the parent event for readability.
            let top = Math.max(this.getTop(), minimumTopValue)
            this.element.style.top = top + "px"
        } else {
            let availableHeight = this.eventband.getHeight() - this.verticalMarginBetweenEvents
            let top = Math.max(0, minimumTopValue)
            while ( top < availableHeight ) {
                this.element.style.top = top + "px"
                const overlappingEvents = this.getEventsThatIntersectOnScreen(viewportRect, checkThisEventsChildren )
                if ( overlappingEvents.length == 0) {
                    break
                } else {
                    for( let e of overlappingEvents ) {
                        top = Math.max(top, e.getTop() + e.getPaddedHeight() + this.verticalMarginBetweenEvents)
                    }
                }
            }
            this.element.style.top = top + "px"
        }
        
        if ( this.hasChildren() ) {
            if ( this.childrenAreVisible ) {
                for( let child of this.children ) {
                    child.arrange(viewportRect, this.getTop() + this.getPaddedHeight() + this.verticalMarginBetweenEvents)
                }
            }
        }
    }

    resetEventArrangement() {
        if ( this.element ) {
            this.element.style.top = "0px"
            if ( this.hasChildren() ) {
                for( let ev of this.children ) {
                    ev.resetEventArrangement()
                }
            }
        }
    }

    draw(viewportRect) {
        this.lastViewportRect = viewportRect
        if ( !this.hasCanvasElement() ) {
            alert("BUG! event has not been added to eventband")
        }
        // console.log(viewportRect)
        if ( !this.element ) {
            this.createElement()
        }
        if ( !this.eventband.element.contains(this.element ) ) {
            this.eventband.element.appendChild(this.element)
        }
        if ( this.isVisibleOnScreen(viewportRect) ) {
            // if ( this.name === "Lower Paleolithic") console.log("Lower Paleolithic: ON")
            // console.log(`Add event ${this.name}`)
            this.setVisible(true) // must be before setWidth
            this.setPosition(viewportRect)
            this.setWidth(viewportRect)
            
            
            // Here we are controlling the position of the event text within a long event period.
            // If the event is long enough we can end with empty partial event bars on left side of
            // screen.  This is annoying when reading as it makes the user scroll back and forth.
            // This piece of code makes sure the text is visible (if possible) given the space.
            // When the left of the event is visible then content is placed there.
            // As the user scrolls right, the text moves right as well.
            // When the text hits the end of the event it will stop.
            if ( this.internalDiv && this.isObservable() && this.isPeriod() ) {
                // Move the internal text to be near end of period
                const iw = parseInt(this.internalDiv.offsetWidth)
                const eventDivStyle = window.getComputedStyle(this.element)
                const eventLeft = parseInt(eventDivStyle.left) + parseInt(eventDivStyle.paddingLeft)
                const eventWidth = parseInt(eventDivStyle.width)
                const eventRight = eventLeft + eventWidth
                const remainingSpace = eventWidth + Math.min(0,eventLeft)
                // console.log(`${this.name} ${left}`)
                if ( eventLeft < 0 ) {
                    const rightPadding = parseInt(eventDivStyle.paddingRight)
                    // should be around 288
                    const rightmost = eventWidth -  iw
                    const delta = remainingSpace - iw
                    // console.log(`${iw} ${ew} ${right} ${parseInt(eventDivStyle.left)}`)
                    // console.log(`Required:${iw} Space: ${remainingSpace} RPad:${rightPadding} RM:${rightmost} L:${eventLeft} W:${eventWidth} R:${eventRight} dW:${delta}`)
                    if ( remainingSpace > iw ) {
                        this.internalDiv.style.left = Math.abs(eventLeft) + "px"
                    } else {
                        this.internalDiv.style.left = rightmost + "px"
                    }
                } else {
                    this.internalDiv.style.left = null
                }
            }

            if ( this.hasChildren() ) {
                if ( this.childrenAreVisible ) {
                    for( let child of this.children ) {
                        child.draw(viewportRect)
                    }
                } else {
                    for( let child of this.children ) {
                        child.setVisible(false)
                    }
                }
            }
        } else {
            // if ( this.name === "Lower Paleolithic") console.log("Lower Paleolithic: OFF")
            this.setVisible(false)
            if ( this.hasChildren() && this.childrenAreVisible ) {
                for( let child of this.children ) {
                    child.setVisible(false)
                }
            }
        }
    }
}
