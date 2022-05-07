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
            timeband.addListener(function(a,b,c) { 
                if ( a === "timeband-visible" ) { 
                    // console.log("eventbandcollection::listener"); 
                    const index = self.getEventbandIndex(c);
                    self.draw(null, index)
                }
            })
            this.eventbands.push(ev)
        }
        this.splitters = []
        
        this.draggingSplitterIndex = null
        this.mouseOverLastEventband = null // this is used to cache the last event band we were over when sending mouseover signals
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

    getEventbandFromY(y) {
        // x is the coordinate on the mouse within the canvas element
        for( let band of this.eventbands ) {
            const style = window.getComputedStyle(band.element)
            const top = parseInt(style.top)
            const bottom = parseInt(style.top) + parseInt(style.height)
            if ( y >= top && y <= bottom) { 
                this.mouseOverLastEventband = band
                return band
            }
        }
        // if we are here then either none of the eventbands are visible
        // or we are over a splitter in which case we want to send back our previous one.
        if ( this.getVisibleBandCount() == 0 ) {
            return null
        }
        return this.mouseOverLastEventband
    }

    getSplitterHeight() {
        if ( isValueAvailable(this.splitters) && this.splitters.length > 0 ) return this.splitters[0].getHeight()
        return 0
    }

    getAvailableHeightForEventbands() {
        const canvasStyle  = window.getComputedStyle(this.canvasElement)
        const availableHeight = parseInt(canvasStyle.height)
        const visibleBandCount = this.getVisibleBandCount()
        const splitterHeight = this.getSplitterHeight()
        const totalSplitterHeight = Math.max(0,(visibleBandCount-1)) * splitterHeight
        return availableHeight - totalSplitterHeight
    }

    getEqualEvenbandSize() {
        return this.getAvailableHeightForEventbands() / this.getVisibleBandCount()
    }

    getHeightsOfEventbandsIfWeAddedOrRemovedBandX(eventband, changeType) {
        // changeType = 1 is an add
        // changeType = -1 is a remove
        let eventbandIndex = 0
        if ( isValueAvailable(eventband) ) {
            if ( typeof(eventband) === "number") {
                eventbandIndex = eventband
                eventband = this.eventbands[eventband]
            } else {
                eventbandIndex = this.getEventbandIndex(eventband)
            }
        } else {
            // there has been no change so
            eventband = null
            eventbandIndex = -1
        }

        const visibleBandCount = this.getVisibleBandCount()
        const availableHeight = this.getAvailableHeightForEventbands()
        const equalHeight = this.getEqualEvenbandSize() 

        const newHeights = new Array(this.eventbands.length)
        const proportions = new Array(this.eventbands.length)
        let remainingHeight = availableHeight
        newHeights.fill(0)
        proportions.fill(0)
        
        let index = 0
        if ( visibleBandCount == 0 ) {
            return newHeights
        } else if ( visibleBandCount == 1 ) {
            // make it 100%
            index = 0
            for( let ev of this.eventbands ) {
                if ( ev.isVisible() ) {
                    newHeights[index] = availableHeight
                }
                index++
            }
            return newHeights
        } else {
            let oldTotalHeight = 0
            let totalNewHeight = 0
            let minProportion = 2

            // Get the total height of all the panels WITHOUT the one we are wanting to add or remove.
            index = 0
            for( let ev of this.eventbands ) {
                if ( changeType == 0 || index != eventbandIndex ) {
                    if ( ev.isVisible() ) {
                        if ( ev.getHeight() >= 0 ) {
                            oldTotalHeight += ev.getHeight()
                        }
                    }
                }
                index++
            }
            if ( oldTotalHeight === 0 ) {
                // nothing was visible
                index =0
                for( let ev of this.eventbands ) {
                    if ( ev.isVisible() ) {
                        newHeights[index] = equalHeight
                    }
                    index ++
                }
                return newHeights
            } else {
                // Calculate the proportion of space that each of the remaining takes up.
                // Want to save the minimum proportion found for later
                index = 0
                for( let ev of this.eventbands ) {
                    if ( changeType == 0 || index != eventbandIndex ) {
                        if ( ev.isVisible() ) {
                            if ( ev.getHeight() >= 0 ) {
                                proportions[index] = ev.getHeight() / oldTotalHeight
                                minProportion = Math.min(minProportion, proportions[index])
                            }
                        }
                    }
                    index++
                }
            }

            if ( changeType == 1 ) {
                // NOTE(07/05/2022) Don't use minimum height as otherwise the rounding will get us and its quite small.
                let suggestedHeight = this.minimumBandHeight * 2
                let previousHeight = eventband.getHeight()
                if ( previousHeight <= 0 ) {
                    suggestedHeight = availableHeight / visibleBandCount
                }
                newHeights[eventbandIndex] = Math.max(suggestedHeight, previousHeight)
                remainingHeight -= newHeights[eventbandIndex]

                if ( remainingHeight * minProportion <= this.minimumBandHeight ) {
                    // We need to rescale the new item.
                    // We assume the smallest proportion is of size minimumBandHeight and then 
                    // scale the proportions accordingly.  The new panel will then get the remaining space.
                    totalNewHeight = 0
                    for ( let ii=0; ii < proportions.length; ii++ ) {
                        if ( ii != eventbandIndex ) {
                            newHeights[ii] = Math.floor(proportions[ii] / minProportion * this.minimumBandHeight)
                            totalNewHeight += newHeights[ii]
                        }
                    }
                    let newSuggestedHeight = availableHeight - totalNewHeight
                    if ( newSuggestedHeight <= this.minimumBandHeight ) {
                        // this happens when the smallest item was already the minimumBandHeight
                        // in this case we are just going to set them all to equal size and be done with it.
                        for ( let ii=0; ii < proportions.length; ii++ ) {
                            if ( proportions[ii] > 0 ) {
                                proportions[ii] = 1/visibleBandCount
                                newHeights[ii] = equalHeight
                            }
                        }
                        newHeights[eventbandIndex] = equalHeight
                    } else {
                        // We are going to adjust the new panel to be the remaining space, this should
                        // mean we always have enough space for the existing panels.
                        newHeights[eventbandIndex] = availableHeight - totalNewHeight
                    }
                }
            }

            // assign the newHeights to our array
            index = 0
            for( let ev of this.eventbands ) {
                if ( eventbandIndex != index ) {
                    // only do this if the new height is not set
                    if ( ev.isVisible() && newHeights[index] == 0) {
                        if ( ev.getHeight() >= 0 ) {
                            const potentialNewHeight = remainingHeight * proportions[index]
                            if ( potentialNewHeight < this.minimumBandHeight ) {
                                // we cannot fit another eventband on so don't change anything
                                console.debug(`[BUG] not enough space for eventband ${index} ${potentialNewHeight} < ${this.minimumBandHeight}`)
                                return false
                            }
                            newHeights[index] = Math.floor(potentialNewHeight)
                        } 
                    }
                }
                index++
            }

            // There may be rounding errors so we need to make sure we tidy up and all the canvas is filled
            totalNewHeight = 0
            let lastEventIndex = 0
            for( let ii=0; ii < newHeights.length; ii++ ) {
                totalNewHeight += newHeights[ii]
                if ( newHeights[ii] > 0 ) {
                    lastEventIndex = ii
                }
            }
            // we have purposefully UNDER estimated the height and we should only be off by 1/2 pixels
            // here we make everything align
            if ( totalNewHeight < availableHeight ) {
                newHeights[lastEventIndex] += availableHeight - totalNewHeight
                totalNewHeight += availableHeight - totalNewHeight
            }
            if ( totalNewHeight != availableHeight ) {
                // alert(`new height does not equal available height ${totalNewHeight} != ${availableHeight}`)
                console.debug(`[BUG] new height (${totalNewHeight}) != available height (${availableHeight})`)
                console.debug(newHeights)
                console.debug(proportions)
                return false
            }
            if ( totalNewHeight > availableHeight ) {
                console.debug(`[BUG] ${totalNewHeight} > ${availableHeight}`)
                return false
            }
        }
        return newHeights
    }

    resetSplitters() {
        for( let s of this.splitters ) {
            s.above = null
            s.below = null
        }
    }
    draw(viewportRect, modifiedEventbandIndex) {
        // FIX(07/05/2022) It would be nice to split this into a function that we could run
        // to determine if a new band would fit BEFORE the setVisible sends the associated event.
        // That way the original function would know it had failed.


        // console.log(`EventBandCollection::draw modified:${modifiedEventbandIndex}`)
        // console.log(viewportRect)

        if ( typeof(viewportRect) === "undefined" || viewportRect === null ) {
            viewportRect = this.lastViewportRect
        } else {
            this.lastViewportRect = viewportRect
        }
        if ( viewportRect === null ) return


        const changeType = isValueAvailable(modifiedEventbandIndex) 
                                ? (this.eventbands[modifiedEventbandIndex].isVisible() ? 1 : -1)
                                : 0 
        const newHeights = this.getHeightsOfEventbandsIfWeAddedOrRemovedBandX(modifiedEventbandIndex, changeType)
        if ( newHeights === false ) return false

        this.resetSplitters()
        const splitterHeight = this.getSplitterHeight()
        let index = 0
        let splitterIndex = 0
        let lastVisibleBand = null
        let lastHeight = 0
        let lastTop = 0
        let newTop = 0
        for( let ev of this.eventbands ) {
            if ( ev.isVisible() ) {
                if ( lastVisibleBand ) {
                    this.splitters[splitterIndex].above = lastVisibleBand
                    this.splitters[splitterIndex].below = ev
                    this.splitters[splitterIndex].setTop(lastTop + lastHeight)
                    newTop = lastTop + lastHeight + splitterHeight
                    splitterIndex++
                }
                lastVisibleBand = ev

                ev.setHeight(newHeights[index])
                ev.setTop(newTop)
                ev.draw(viewportRect)

                lastHeight = newHeights[index]
                lastTop = newTop
            }
            index++
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


