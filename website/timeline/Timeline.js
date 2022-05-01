class Timeline extends Observable {
    // Main class for building a timeline.  Multiple timelines can exist on a single page.

    constructor(element) {
        super()

        if ( typeof(element) === "string" ) {
            this.element = document.getElementById(element);
        } else {
            this.element = element
        }
        
        this.showTitle = false
        this.titleHeight = 0
        this.title = "New Timeline"
        this.initialTimePoint = "0AD"

        this.titleStyle = "timeline-title"
        this.timelineStyle = "timeline"
        this.workspaceStyle = "workspace"
        this.timeaxisStyle = "timeaxis"
        this.canvasStyle = "canvas"

        this.zoom = 0

        this.currentViewport = null // new Viewport(this.element)
        this.timeAxisCollection = null // new TimeAxisCollection()
        //this.timeAxisCollection.add( new TimeAxis(-500,500) )
        this.titleElement = null
        this.workspaceElement = null
        this.timeaxisElement = null
        this.canvasElement = null
        this.eventCanvasElement = null
        this.modalDialog = new ModalBackgroundPanel(this)         // background to absorb clicks
        this.eventDetailsElement = null
        this.bigImagePanel = null

        this.timeBandCollection = null //TimeBandCollection.createRandom()
        this.eventBandCollection = null // new EventBandCollection(this, this.timeBandCollection)
        this.axisChooser = null
        this.currentScrollAxisIndex = null;
        this.windowWidth = null
        this.windowHeight = null
        this.savedStartTimepoint = 0
        this.currentScrollBarButtonFraction = null

        // required to detect changes to our main element
        this.lastKnownWidth = 0
        this.lastKnownHeight = 0

        // listeners to the state of the timeline
        this.firstDrawComplete = false
        this.ready = false
    }

    makeFullScreen() {
        openFullscreen(this.workspaceElement)
        this.onElementResize()
    }

    getAxisPeriodDuration() {
        return this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].end - this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].start
    }

    getRelativeValue() {
        const years = this.getAxisPeriodDuration()
        const start = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].start
        const relativeValue = start + (this.currentScrollBarButtonFraction * years)
        return relativeValue
    }

    getRelativeTimepoint() {
        const value = this.getRelativeValue()
        return new TimePoint(value)
    }

    axisChooser_onClick(axisChooser) {
        this.currentScrollAxisIndex = axisChooser.getAxisIndex()
        const largeStep = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].majorEvery / this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].duration()
        const smallStep = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].minorEvery / this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].duration()
        this.scrollBar.setLargeStep(largeStep)
        this.scrollBar.setSmallStep(smallStep)
        
        // when a new axis is chosen we move to the date that is the same for that axis
        const tp = this.getRelativeTimepoint()
        this.currentViewport.setTimePoint(tp)
        this.scrollBar.setText()
        this.draw()
        // console.log(`selected new axis ${this.currentScrollAxisIndex} ${this.currentScrollBarButtonFraction} ${tp.relativeValue}`)
    }

    scrollbar_change(scrollBar, value ) {
        // value here is the position on the scrollbar as a proportion of the whole
        const oldp = this.currentScrollBarButtonFraction
        this.currentScrollBarButtonFraction = value
        const old = this.currentViewport.timepoint.relativeValue
        const tp = this.getRelativeTimepoint()
        this.currentViewport.setTimePoint(tp)
        this.draw()
        // console.log(`updated scroll ${value} ${this.currentScrollAxisIndex} ${oldp} => ${this.currentScrollBarButtonFraction} ${old} => ${tp.relativeValue}`)
    }

    timeBandCollection_onEvent(eventName, obj, data ) {
        // console.log(`timeline::timeBandCollection_onEvent ${eventName}`)
        if ( eventName == "show-event-details" ) {
            // data in this case is the more details panel which should be above
            // everything else in the timeline
            // console.log(data)
            this.modalDialog.show()
            
            // we don't add our details box to modalDialog as we don't want it to take on the modal dialogs opacity
            this.element.appendChild(data)

            const timelineStyle = window.getComputedStyle(this.canvasElement)
            const belowCanvasHeight = this.scrollBar.getScrollBarHeight() + this.axisChooser.getHeight()
            const detailsHeight = (parseInt(timelineStyle.height) - belowCanvasHeight - 25)
            data.style.height = detailsHeight + "px"
            data.style.width = (parseInt(timelineStyle.width) * 0.75) + "px"
            data.style.top = (parseInt(timelineStyle.height) * 0.1) + "px"
            data.style.left = (parseInt(timelineStyle.width) * 0.25/2) + "px"
            
            const credits = data.getElementsByClassName("event-details-description-credits")
            const creditsStyle = window.getComputedStyle(credits[0])
            const creditsFullHeight = parseInt(creditsStyle.height) + parseInt(creditsStyle.paddingTop) + parseInt(creditsStyle.paddingBottom) + parseInt(creditsStyle.marginTop) + parseInt(creditsStyle.marginBottom)
            const description = data.getElementsByClassName("event-details-content-description")
            if ( description != null && description.length > 0 ) {
                description[0].style.height = detailsHeight - 50 - creditsFullHeight + "px"
            }
            this.eventDetailsElement = data

        } else if ( eventName === "hide-event-details" ) {
            this.modalDialog.hide()
            this.element.removeChild(data)
            this.eventDetailsElement = null
        } else if ( eventName == "show-big-image" ) {
            this.modalDialog.show()
            if ( this.bigImagePanel === null ) {
                this.bigImagePanel = new BigImagePanel(this)
                this.bigImagePanel.addListener(function(a,b,c) { self.bigImagePanel_onEvent(a,b,c) })
                this.bigImagePanel.setUsingEvent(data)
                this.bigImagePanel.show()
            } else {
                this.bigImagePanel.show()
            }
        }
    }
    
    resizeMainElements() {
        const currentWindowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        if ( currentWindowWidth == parseInt(this.windowWidth) ) {
            return
        }
        // console.log(`redrawing axis bar ${currentWindowWidth} ${this.windowWidth}`)
        this.windowWidth = currentWindowWidth
        this.onElementResize()
    }

    resizeEventDetailsPanel() {
        // TODO(tm) tidy this up into a separate component with resize
        if ( this.eventDetailsElement === null ) return
        const timelineStyle = window.getComputedStyle(this.canvasElement)
        const belowCanvasHeight = this.scrollBar.getScrollBarHeight() + this.axisChooser.getHeight()
        const detailsHeight = (parseInt(timelineStyle.height) - belowCanvasHeight - 25)
        this.eventDetailsElement.style.height = detailsHeight + "px"
        this.eventDetailsElement.style.width = (parseInt(timelineStyle.width) * 0.75) + "px"
        this.eventDetailsElement.style.top = (parseInt(timelineStyle.height) * 0.1) + "px"
        this.eventDetailsElement.style.left = (parseInt(timelineStyle.width) * 0.25/2) + "px"
        
        const credits = this.eventDetailsElement.getElementsByClassName("event-details-description-credits")
        const creditsStyle = window.getComputedStyle(credits[0])
        const creditsFullHeight = parseInt(creditsStyle.height) + parseInt(creditsStyle.paddingTop) + parseInt(creditsStyle.paddingBottom) + parseInt(creditsStyle.marginTop) + parseInt(creditsStyle.marginBottom)
        const description = this.eventDetailsElement.getElementsByClassName("event-details-content-description")
        if ( description != null && description.length > 0 ) {
            description[0].style.height = detailsHeight - 50 - creditsFullHeight + "px"
        }
    }

    onElementResize() {
        // This is called every AnimationFrame in the browser
        // console.log("onElementResize")
        this.currentViewport.updateViewportWidth()
        this.axisChooser.onResize()
        this.draw()
        this.resizeEventDetailsPanel()
        if ( this.bigImagePanel) this.bigImagePanel.onResize()
        // TODO(tm) need to resize the event bands
        
    }

    setTitleVisible(b) {
        // When hiding the title we cannot use display: none as it will break our grid
        // We set the height to 0 instead
        this.showTitle = b
        
        if ( this.titleElement ) {
            if ( this.showTitle ) {
                // this.titleElement.style.display = this.previousTitleDisplayValue
                this.titleElement.style.height = titleHeight + "px"
                this.titleElement.style.visibility = "visible"
            } else {
                // this.titleElement.style.display = "none"
                this.titleElement.style.height = 0 + "px"
                this.titleElement.style.visibility = "hidden"
            }
        }
    }

    setTimeBandCollection(timeBandCollection) {
        this.timeBandCollection = timeBandCollection
        this.eventBandCollection = new EventBandCollection(this, this.timeBandCollection)
        if ( this.canvasElement ) {
            this.timeBandCollection.setElement(this.canvasElement)
        }
        if ( this.eventCanvasElement ) {
            this.eventBandCollection.setElement(this.eventCanvasElement)
        }

        const self = this
        this.timeBandCollection.addListener(function(a,b,c) { self.timeBandCollection_onEvent(a,b,c); })
        for( let t of this.timeBandCollection.timebands ) {
            this.sendEvent("add-timeband", t)
        }
    }

    setTimeAxisCollection(timeAxisCollection) {
        const self = this
        this.timeAxisCollection = timeAxisCollection

    }

    addMainElements() {
        const self = this;

        
        this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        this.element.innerHTML = ""

        // console.log("Timeline::addMainElements")
        this.element.classList.add(this.timelineStyle)
        this.element.tabIndex = 0

        this.titleElement = document.createElement("div")
        this.titleElement.innerText = this.title
        this.titleElement.classList.add(this.titleStyle)
        this.element.append(this.titleElement)

        const style = window.getComputedStyle(this.titleElement)
        this.titleHeight = parseInt(style.height)
        // this.previousTitleDisplayValue = style.display
        this.setTitleVisible(this.showTitle)


        this.workspaceElement = document.createElement("div")
        this.workspaceElement.classList.add(this.workspaceStyle)
        this.element.append(this.workspaceElement)

        this.timeaxisElement = document.createElement("div")
        this.timeaxisElement.classList.add(this.timeaxisStyle)
        this.workspaceElement.append(this.timeaxisElement)

        this.canvasElement = document.createElement("div")
        this.canvasElement.classList.add(this.canvasStyle)
        this.workspaceElement.append(this.canvasElement)

        this.eventCanvasElement = document.createElement("div")
        this.eventCanvasElement.classList.add("event-canvas")
        this.workspaceElement.append(this.eventCanvasElement)
        
        this.timeBandCollection.setElement(this.canvasElement)
        this.eventBandCollection.setElement(this.eventCanvasElement)
    }

    initialPosition() {
        const self = this

        if ( this.canvasElement ) {
            this.timeBandCollection.setElement(this.canvasElement)
        }
        if ( this.eventCanvasElement ) {
            this.eventBandCollection.setElement(this.eventCanvasElement)
        }

        this.axisChooser = new AxisChooser(this.timeAxisCollection)
        this.axisChooser.addListener(function(caller) { self.axisChooser_onClick(caller) })
        this.element.appendChild(this.axisChooser.getElement())
        this.axisChooser.build() // this need to be AFTER the first axis has been added

        this.scrollBar = new ScrollBar(this.element)
        this.scrollBar.addListener(function(caller, value) { self.scrollbar_change(caller, value) })
        this.axisChooser.addListener(function(caller) { self.scrollBar.setBackgroundColor(self.timeAxisCollection.timeaxes[caller.getAxisIndex()].scrollBackgroundColor) })

        this.currentViewport = new Viewport(this.workspaceElement, this.timeAxisCollection)
        this.currentViewport.setTimePoint(this.initialTimePoint)
        this.scrollBar.setViewport(this.currentViewport)
        const axisIndex = this.timeAxisCollection.getAxisIndex(this.currentViewport.timepoint)
        this.axisChooser.setCurrentAxis(axisIndex)
        
        this.scrollBar.setProportion(0.5)
    }

    
    addEventHandlers() {
        const self = this

        // hook this into window so that the user does not have to click on anything 
        // this may cause issues with say a text box but not sure. This should only
        // catch keys which have not already been handled.
        window.addEventListener("keydown", function(e) {
            self.changeByAxisTicks(e.key, e.ctrlKey, e.shiftKey)
            // TODO(tom) use up and down for zoom
        })

        
        window.addEventListener("resize", function(e) {
            let width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            let height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            if( width == self.windowWidth && height == self.windowHeight) {
                return
            }
            // console.log(`redrawing ${width} ${self.windowWidth} ${height} ${self.windowHeight}`)
            self.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            
            self.resizeMainElements()
            self.draw()
        })

        this.eventCanvasElement.addEventListener("mousedown", function(e) {
            if ( self.eventBandCollection.isDragging()) return
            self.scrollBar.startDrag()
        })
        this.eventCanvasElement.addEventListener("mousemove", function(e) {
            if ( self.eventBandCollection.isDragging()) {
                // console.log("eventCanvasElement::mousemove eventBandCollection::isDragging")
                self.eventBandCollection._onMouseMove(e)
                return
            }
            if ( self.scrollBar.isDrag() ) {
                // console.log("eventCanvasElement::mousemove scrollbar::isDragging")
                self.scrollBar._onMouseMove(e.clientX)
            }
        })
        this.eventCanvasElement.addEventListener("click", function(e) {
            if ( self.eventBandCollection.isDragging()) {
                self.eventBandCollection.stopDragging()
                return
            }
            self.scrollBar._onMouseClick(e)
        })

        this.eventCanvasElement.addEventListener("mouseleave", function(e) {
            if ( self.eventBandCollection.isDragging()) {
                self.eventBandCollection.stopDragging()
                return
            }
            self.scrollBar.stopDrag()
        })

        
    }

    saveElementDimensions() {
        const style = window.getComputedStyle(this.element)
        const w = parseInt(style.width)
        const h = parseInt(style.height)
        this.lastKnownHeight = h 
        this.lastKnownWidth = w
    }

    _onNextAnimationFrame(timestamp) {
        const self = this
        const style = window.getComputedStyle(this.element)
        const w = parseInt(style.width)
        const h = parseInt(style.height)
        //if ( w != this.lastKnownWidth && h != this.lastKnownHeight ) {
            this.onElementResize()
            this.lastKnownHeight = h 
            this.lastKnownWidth = w
        //}
        window.requestAnimationFrame(function(t) { self._onNextAnimationFrame(t) })
    }

    changeByAxisTicks(key, ctrlKey=false, shiftKey=false) {
        if ( key == 'c' ) {
            // center the current axis
            this.scrollBar.setProportion(0.5)
            return
        }
        if ( key == 's' ) {
            // center the current axis
            this.scrollBar.setProportion(0)
            return
        }
        if ( key == 'e' ) {
            // center the current axis
            this.scrollBar.setProportion(1)
            return
        }
        if ( key == 'g' ) {
            // center the current axis
            let date = prompt("Please enter date, if AD/BC is not given date is assumed to be AD.")
            if ( date != null ) {
                try {
                    const tp = new TimePoint(date)
                    const axisIndex = this.timeAxisCollection.getAxisIndex(tp)
                    if ( axisIndex ) {
                        this.currentScrollAxisIndex = axisIndex
                        this.currentViewport.set(date, this.currentScrollAxisIndex)
                        let proportionOfTimePeriod = this.getProportionOfTimePeriod()
                        this.scrollBar.setProportion(proportionOfTimePeriod)    
                    } else {
                        alert("Date was outwith range of any axis.")
                    }
                } catch(ex) { 
                    alert("Invalid date format. Examples are 1000BC or 1200AD.")
                 }
            }
            return
        }
        if ( key != 'ArrowRight' && key != 'ArrowLeft' ) {
            return
        }
        let howMuch = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].minorEvery
        if ( shiftKey ) {
            howMuch = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].majorEvery
        }
        if ( ctrlKey ) {
            howMuch = 1
        }
        let proportionOfTimePeriod = 0
        if ( key == 'ArrowRight' ) {
            // click is the right -->
        } else if ( key == 'ArrowLeft' ) {
            // click is to the left <--
            howMuch = -howMuch
        }
        if ( this.currentViewport.step(howMuch) ) {
            proportionOfTimePeriod = this.getProportionOfTimePeriod()
            this.scrollBar.setProportion(proportionOfTimePeriod)
        }
        // console.log(`changeByAxisTicks ${this.currentViewport.timepoint.toString()} ${this.currentScrollAxisIndex} ${howMuch} ${proportionOfTimePeriod}`)
    }

    getProportionOfTimePeriod() {
        const tp = this.currentViewport.timepoint
        const startYear = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].start
        const duration = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].duration()
        const value = (tp.relativeValue - startYear) / duration
        // console.log(`getProportionOfTimePeriod ${tp.relativeValue} ${value}`)
        return value
    }

    // setPosition(yearAsStringOrNumber) {
    //     const tp = new TimePoint(yearAsStringOrNumber)
    //     this.currentScrollAxisIndex = this.timeAxisCollection.getAxisIndex(tp)
    //     const startYear = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].start
    //     const duration = this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].end - this.timeAxisCollection.timeaxes[this.currentScrollAxisIndex].start
    //     this.currentScrollBarButtonFraction = (tp.relativeValue - startYear) / duration
    //     console.log(`Setting currentScrollBarButtonFraction to ${this.currentScrollBarButtonFraction} (${tp.relativeValue}/${duration})`)
    //     const relativeTimepoint = startYear + (this.currentScrollBarButtonFraction * duration)
    //     const newTp = new TimePoint(relativeTimepoint)
    //     this.currentViewport.setTimePoint(newTp)
    // }

    

    clear() {
        this.element.innerHTML = ""
    }

    

    // step(value) {
    //     if ( this.currentViewport.step(value, this.currentScrollAxisIndex) ) {
    //         console.log(`step::redraw ${value}`)
    //         this.lockScrollBarButtonFraction()
    //         this.draw()
    //     }
    // }

    updateAttachedElements() {
        if ( !this.currentViewport ) return;
        const timelineSelection = document.querySelectorAll('[data-timeline="'+this.elementId+'"]')
        for (let el of timelineSelection) {
            if ( el.dataset.field == "period" ) {
                // el.dataset.period = this.viewport.start() + " - " + this.viewport.end()
                const tp = this.currentViewport.timepoint
                const start = tp.toString()
                el.value = start
            } else if ( el.dataset.field == "pixels" ) {
                const start = this.currentViewport.startInPixels()
                const end = this.currentViewport.endInPixels()
                el.value =  `${start} - ${end}`
            }
        }
    }

    onFirstDraw() {
        if ( this.ready ) return
        const self = this
        this.timeBandCollection.setTimeAxisCollection(this.timeAxisCollection)
        this.addMainElements()
        this.addEventHandlers()
        this.saveElementDimensions();
        window.requestAnimationFrame(function(t) { self._onNextAnimationFrame(t) })
        this.ready = true
        this.initialPosition()
    }
    
    draw() {
        if ( !this.ready ) {
            this.onFirstDraw()
        }

        // console.log(`Timeline::draw`)
    
        
        this.updateAttachedElements()
        
        //this.element.innerHTML = ""
        
        this.titleElement.innerText = this.title

        
        // draw the vertical lines marking time
        const viewportRect = this.timeAxisCollection.draw(this.timeaxisElement, this.currentViewport)

        // set the canvas elements so we do not cover the dates
        this.canvasElement.style.height = viewportRect.height + "px"
        this.eventCanvasElement.style.height = viewportRect.height + "px"

        
        // draw the events on the bands. this is in front of the axis
        this.eventBandCollection.draw(viewportRect)
        
        // TODO(tom) show a little pincer in the axis selector for the area we are viewing e.g. []
        
    }

    getViewportRect() {
        const viewportRect = this.timeAxisCollection.draw(this.timeaxisElement, this.currentViewport)
        return viewportRect
    }

}

