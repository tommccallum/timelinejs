class EventBandCollection {
    constructor(timeline, timeBandCollection) {
        this.timeline = timeline
        this.timeBandCollection = timeBandCollection
        this.eventbands = []
        this.canvasElement = null
        this.lastViewportRect = null
        this.minimumBandHeight = 25
        const self = this
        for( let timeband of this.timeBandCollection.timebands) {
            const ev = new EventBand(timeband)
            timeband.addListener(function(a,b,c) { if ( a === "timeband-visible" ) { const index = self.getEventbandIndex(c); self.draw(null, index); }} )
            this.eventbands.push(ev)
        }
        this.splitters = null
        
        this.draggingSplitterIndex = null
    }

    containsEvent(ev) {
        for( let evband of this.eventbands) {
            if ( evband.containsEvent(ev) ) {
                return evband
            }
        }
        return null
    }

    getEventbandIndex(timeband) {
        let index = 0
        for( let ev of this.eventbands) {
            if ( ev.timeband == timeband ) {
                return index
            }
            index ++
        }
        return -1
    }

    getLastVisibleBand() {
        let lastVisible = -1
        let index = 0
        for( let ev of this.eventbands) {
            if ( ev.isVisible() ) {
                lastVisible = index
            }
            index ++
        }
        return lastVisible
    }

    isDragging() {
        return this.draggingSplitterIndex != null
    }

    stopDragging() {
        // console.log("EventBandCollection::stopDragging")
        this.draggingSplitterIndex = null
    }

    setElement(el) {
        this.canvasElement = el
        for( let ev of this.eventbands) {
            ev.setParentElement(this.canvasElement)
        }
        this.createSplitters()
    }

    createSplitters() {
        if ( this.splitters === null ) {
            const splitters = []
            const self = this
            for( let ii=0; ii < this.eventbands.length-1; ii++ ) {
                const splitter = new Splitter(this.canvasElement)
                splitter.setIndex(ii)
                splitter.addEventListener("mousedown", function(e) {
                    self._onMouseDown(e)
                })
                this.canvasElement.addEventListener("mousemove", function(e) {
                    self._onMouseMove(e)
                })
                splitters.push(splitter)
            }
            if ( splitters.length > 0 ) {
                this.splitters = splitters
            }
        }
    }

    

    getVisibleBandCount() {
        let visibleBands = 0
        for ( let ev of this.eventbands ) {
            if ( ev.isVisible() ) {
                visibleBands++
            }
        }
        return visibleBands
    }

    onResize(viewportRect) {
        this.draw(viewportRect)
    }

    draw(viewportRect, modifiedEventbandIndex) {
        // console.log(`EventBandCollection::draw modified:${modifiedEventbandIndex}`)
        // console.log(viewportRect)

        if ( typeof(viewportRect) === "undefined" || viewportRect === null ) {
            viewportRect = this.lastViewportRect
        } else {
            this.lastViewportRect = viewportRect
        }
        if ( viewportRect === null ) return

        
        // console.log("EventBandCollection::draw")
        // draw the bands that group events together
        const self = this
        
        let totalSplitterHeight = 0
        let splitterHeight = 0
        if ( this.splitters !== null ) splitterHeight = this.splitters[0].getHeight()
        
        const canvasStyle  = window.getComputedStyle(this.canvasElement)
        let availableHeight = parseInt(canvasStyle.height)
        const visibleBandCount = this.getVisibleBandCount()
        totalSplitterHeight = Math.max(0,(visibleBandCount-1)) * splitterHeight
        const equalHeight = (availableHeight - totalSplitterHeight) / visibleBandCount


        // if the availableHeight < expectedBandHeight then 
        // 

        // console.log(`EventBandCollection ${totalSplitterHeight} ${availableHeight} ${equalHeight}`)

        if ( this.splitters !== null ) {
            // clear the splitters so we don't have wrong pointers to visible bands
            for( let s of this.splitters ) {
                s.above = null
                s.below = null
            }
        }

        let lowerBandCount = visibleBandCount
        let splitterIndex = 0
        let top = 0
        let eventIndex = 0
        let carry = 0

        for( let ev of this.eventbands ) {
            // console.log(`eventband ${eventIndex} ${splitterIndex}`)
            if ( ev.isVisible() ) {
                if ( this.splitters != null 
                    && this.splitters[splitterIndex].above !== null 
                    && this.splitters[splitterIndex].below == null ) {
                    this.splitters[splitterIndex].below = ev
                    splitterIndex++
                }
            }

            
            if ( typeof(modifiedEventbandIndex) !== "undefined" && modifiedEventbandIndex !== null && eventIndex === modifiedEventbandIndex ) {
                // If the user removes a timeline then the next timeband should fill the space leaving the rest of the 
                // timebands alone. If they remove the last one then the first visible one above will fill the space.
                const bandAboveIndex = this._getBandAbove(modifiedEventbandIndex) 
                const bandBelowIndex = this._getBandBelow(modifiedEventbandIndex)
                let bandAbove = null
                let bandBelow = null
                let isLowestVisibleBand = this.getLastVisibleBand() == eventIndex
                if ( bandAboveIndex >= 0 ) {
                    bandAbove = this.eventbands[bandAboveIndex]
                }
                if ( bandBelowIndex >= 0 ) {
                    bandBelow = this.eventbands[bandBelowIndex]
                }
                
                // console.log(`mutated m:${modifiedEventbandIndex} ei:${eventIndex} v:${ev.isVisible()} ${isLowestVisibleBand} ${splitterIndex}`)
                if ( ev.isVisible() ) {

                    // we have been made visible
                    if ( bandBelow === null ) {
                        if ( bandAbove === null ) {
                            // this is the only one 
                            // console.log("bandBelow == null, bandAbove == null")
                            ev.setHeight( availableHeight)
                            availableHeight -= ev.getHeight()
                            top += ev.getHeight()
                        } else {
                            // console.log("bandBelow == null, bandAbove != null")
                            const splitter = this.splitters[splitterIndex-1]
                            const newHeight = bandAbove.getHeight() - ev.getHeight()
                            bandAbove.setHeight(newHeight)
                            
                            // top is overestimated here if we were previously invisible so adjust
                            top -= ev.getHeight() + splitterHeight
                            
                            this.splitters[splitterIndex-1].setTop(top)
                            top += splitter.getHeight()
                            availableHeight -= splitter.getHeight()

                            ev.setTop(top)
                            top += ev.getHeight()
                            availableHeight -= ev.getHeight()
                        }
                    } else {
                        // console.log("bandBelow != null, bandAbove == null")
                        ev.setTop(top)
                        
                        if( bandBelow.getHeight() < ev.getHeight() ) {
                            // take height from bandAbove 
                            if ( bandAbove === null )  {
                                // then this is the top one 
                                ev.setTop(top)
                                availableHeight -= ev.getHeight()
                                top += ev.getHeight()
                                carry += ev.getHeight() + splitterHeight
                            } else if ( bandAbove.getHeight() > ev.getHeight() ) {
                                bandAbove.setHeight(bandAbove.getHeight() - ev.getHeight())
                                ev.setTop(top - ev.getHeight() )
                                availableHeight -= ev.getHeight()
                                // we don't need to adjust top as that has already been accounted for
                                // we do need to adjust the previous splitter though which was placed in the original position
                                this.splitters[splitterIndex-1].setTop(top - ev.getHeight() - splitterHeight)
                            }
                        } else {
                            bandBelow.setHeight(bandBelow.getHeight() - ev.getHeight() - splitterHeight)
                            availableHeight -= ev.getHeight()
                            top += ev.getHeight()
                        }

                        this.splitters[splitterIndex].setTop(top)
                        this.splitters[splitterIndex].above = ev
                        availableHeight -= splitterHeight
                        top += splitterHeight
                        bandBelow.setTop(top)
                    }
                } else {
                    // We have been made invisible so we give our height to the next one.
                    // If we are the last one then we expand the one above us instead.
                    if ( bandBelow == null ) {
                        if ( bandAbove == null ) {
                            // nothing is visible
                        } else {
                            // console.log("hiding bottom band")
                            const newHeight = bandAbove.getHeight() + ev.getHeight() + splitterHeight
                            bandAbove.setHeight(newHeight)
                        }
                        // don't touch splitter so it will disappear
                    } else {
                        const newHeight = bandBelow.getHeight() + ev.getHeight() + splitterHeight
                        bandBelow.setHeight(newHeight)
                        bandBelow.setTop(top)
                        // we should not need to change the splitter as this will be modified when we 
                        // handle the next event band.
                    }
                }
                
            } else {
                // if we are not the mutated band then 
                if ( ev.isVisible() ) {
                    // console.log(`Nonmutated visible ${eventIndex} ${splitterIndex} ${ev.isVisible()} ${modifiedEventbandIndex ? this.eventbands[modifiedEventbandIndex].isVisible() : "NA"}`)
                    
                    if ( carry > 0 ) {
                        if ( carry + this.minimumBandHeight < ev.getHeight() ) {
                            // console.log(`Adjusting height with carry ${carry} ${eventIndex} ${ev.getHeight()}`)
                            ev.setHeight(ev.getHeight() - carry)
                            carry = 0
                        }
                    }
                
                    // assign an initial top and height, these if statements should only be true on the first pass
                    if ( ev.getTop() == - 1 ) {
                        ev.setTop(top)
                    }
                    if ( ev.getHeight() == -1 ) {
                        ev.setHeight(equalHeight)
                    }
                    if ( top != ev.getTop() ) {
                        ev.setTop(top)
                    }
                    const bandBelow = this._getBandBelow(eventIndex)
                    if ( bandBelow === null ) {
                        // console.log(`fill up gap with last visible band ${eventIndex}`)
                        ev.setHeight(availableHeight)
                    }

                    ev.draw(viewportRect)
                    let h = ev.getHeight()
                    availableHeight -= h
                    lowerBandCount--
                    top += h

                    if ( this.splitters != null && this.splitters.length > splitterIndex ) {
                        if ( this.getLastVisibleBand() == eventIndex ) {
                            // NOTE(tm) Hide the rest of the splitters by not incrementing the splitterIndex 
                            // and letting the loop at the end hide the rest of them
                        } else {
                            this.splitters[splitterIndex].setTop(top)
                            this.splitters[splitterIndex].above = ev
                            const splitterHeight = this.splitters[splitterIndex].getHeight()
                            availableHeight -= splitterHeight
                            top += splitterHeight
                        }
                    }

                    // console.log(`EventBandCollection::loop ${availableHeight} ${lowerBandCount} ${top}`)
                } else {
                    // this is not the mutated band, but it is invisible.
                    // should be nothing to do here
                }
            }
            eventIndex++;
        }

        if ( this.splitters != null ) {
            for( let s of this.splitters ) {
                s.setAppropriateVisibility()
            }
        }
    }

   

    _onMouseDown(e) {
        const index = e.target.dataset.index
        this.draggingSplitterIndex = index
    }

    _getBandAbove(eventbandIndex) {
        for( let ii=eventbandIndex-1; ii >= 0; ii-- ) {
            if ( this.eventbands[ii].isVisible() ) {
                return ii
            }
        }
        return -1
    }

    _getBandBelow(eventbandIndex) {
        for( let ii=eventbandIndex+1; ii < this.eventbands.length; ii++ ) {
            if ( this.eventbands[ii].isVisible() ) {
                return ii
            }
        }
        return -1
    }

    _onMouseMove(e) {

        if ( this.draggingSplitterIndex == null ) {
            return
        }
        if ( !!e.touches && e.touches.length > 0 ) {
            e = e.touches[0]
        }
        if ( typeof(e.clientX) === "undefined" ) {
            return
        }

        // Do not use e.target here as we may not always be over the relevant element so 
        // we process it as if its the top div.
        const splitterIndex = parseInt(this.draggingSplitterIndex)
        const splitter = this.splitters[splitterIndex]
        const topBand = splitter.above
        const bottomBand = splitter.below
        
        const rect = this.canvasElement.getBoundingClientRect()
        // console.log(`Dragging  ${this.draggingSplitterIndex} ${this.eventbands.length} ${rect.top} ${rect.left}`)
        // console.log(e.target)
        const y = parseInt(e.clientY) - parseInt(rect.top)
        
        
        const topTop = topBand.getTop()
        const bottomTop = bottomBand.getTop()
        const bottomBottom = bottomBand.getTop() + bottomBand.getHeight()
        const oldTopHeight = topBand.getHeight()
        const totalHeight = topBand.getHeight() + bottomBand.getHeight()

        // console.log(`OLD VALUES: ${y} ${topTop} ${bottomTop} ${oldTopHeight} ${totalHeight}`)

        const newTopHeight = y  - topTop
        const change = newTopHeight - oldTopHeight
        const newBottomTop = bottomTop + change

        if ( change < 0 ) {
            // check we are not passed 0 or above the splitter above
            if ( y <= topTop ) {
                return
            }
        } else if ( change > 0 ) {
            // check we are not going on the splitter below
            if ( y >= bottomBottom ) {
                return
            }
        }

        const newBottomHeight = totalHeight - newTopHeight

        // we should always be able to make a small timeband bigger but not smaller
        if ( oldTopHeight >= this.minimumBandHeight && newTopHeight < this.minimumBandHeight ) {
            // fails minimum height test
            console.log("Fails minimum height on top visible band")
            return 
        }
        if ( bottomBand.getHeight() >= this.minimumBandHeight && newBottomHeight < this.minimumBandHeight ) {
            // fails minimum height test
            console.log("Fails minimum height on bottom visible band")
            return 
        }

        const newSplitterTop = splitter.getTop() + change

        // top for the top box does not change
        topBand.setHeight(newTopHeight)
        splitter.setTop(newSplitterTop)
        bottomBand.setTop(newBottomTop)
        bottomBand.setHeight(newBottomHeight)

        topBand.arrange(this.timeline.getViewportRect())
        bottomBand.arrange(this.timeline.getViewportRect())

        // console.log(`y: ${y} change: ${change} topTop: ${topTop} totalHeight: ${totalHeight} newTopHeight: ${newTopHeight} newBottomHeight: ${newBottomHeight}`)
    }
    _onMouseUp(e) {
        this.draggingSplitterIndex = null
    }
}


