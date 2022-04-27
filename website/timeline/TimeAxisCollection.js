class TimeAxisCollection {
    // how to represent large distances in time
    // how to represent BC vs AD
    // we don't really want equally spaced we want proportional to numbers of events
    // so the more events the more space between them, maybe we can have multiple axis
    // next to each other.

    constructor() {
        // console.log("Creating new TimeAxisCollection")
        this.timeaxes = []
    }

    add(timeaxis) {
        if ( typeof(timeaxis) === "undefined" || timeaxis == null ) {
            alet("BUG: no timeaxis given")
            return
        }
        // add a new timeaxis to our collection, insert in the order of the start time
        // Return true if the new axis did not overlap with any other axes, false otherwise
        if ( this.timeaxes.length == 0 ) {
            this.timeaxes.push(timeaxis)
            return true
        } else {
            for( let index in  this.timeaxes) {
                if ( timeaxis.end <= this.timeaxes[index].start ) {
                    this.timeaxes.splice(index, 0, timeaxis)
                    return true
                } else if ( timeaxis.end <= this.timeaxes[index].end ) {
                    // here the end is after the start but before the end of it then we already have an axis
                    // for this timebound
                    return false
                }
            }
            this.timeaxes.push(timeaxis)
            return true
        }
    }

    earlierThanAxis(tp, restrictToSingleAxis=null) {
        if ( restrictToSingleAxis != null ) {
            if ( tp.relativeValue < this.timeaxes[restrictToSingleAxis].start ) {
                return true
            }    
            return false
        }
        if ( tp.relativeValue < this.timeaxes[0].start ) {
            return true
        }
        return false
    }

    laterThanAxis(tp, restrictToSingleAxis=null) {
        if ( restrictToSingleAxis != null ) {
            if ( tp.relativeValue > this.timeaxes[restrictToSingleAxis].end ) {
                return true
            }    
            return false
        }
        if ( tp.relativeValue > this.timeaxes[this.timeaxes.length-1].end ) {
            return true
        }
        return false
    }

    beginning(restrictToSingleAxis=null) {
        if ( restrictToSingleAxis != null  ) {
            return this.timeaxes[restrictToSingleAxis].startAsTimepoint()
        }
        return this.timeaxes[0].startAsTimepoint()
    }

    theEnd(restrictToSingleAxis=null) {
        if ( restrictToSingleAxis != null ) {
            return this.timeaxes[restrictToSingleAxis].endAsTimepoint()
        }
        return this.timeaxes[this.timeaxes.length-1].endAsTimepoint()
    }

    find(name) {
        for (let ta of this.timeaxes) {
            if ( ta.name !== null ) {
                if ( ta.name.toLowerCase() == name.toLowerCase() ) {
                    return ta
                }
            }
        }
        return null
    }

    getAxis(tp) {
        for (let ta of this.timeaxes) {
            if ( ta.isInBounds(tp.relativeValue) ) {
                return ta
            }
        }
        return null
    }

    getAxisIndex(tp) {
        let ii=0
        for (let ta of this.timeaxes) {
            if ( ta.isInBounds(tp.relativeValue) ) {
                return ii
            }
            ii++
        }
        return null
    }

    getMinorStepSize(tp) {
        return this.getAxis(tp).minorEvery
    }

    getMajorStepSize(tp) {
        return this.getAxis(tp).majorEvery
    }

    isTimepointInBounds(tp, restrictToSingleAxis = null) {
        if ( restrictToSingleAxis != null ) {
            return this.timeaxes[restrictToSingleAxis].isInBounds(tp.relativeValue)
        }
        for (let ta of this.timeaxes) {
            if ( ta.isInBounds(tp.relativeValue) ) {
                // console.log(`Found ${tp} in ${ta.name()}`)
                return true
            }
        }
        // console.log(`Not found ${tp} in axes`)
        return false
    }

    getTimelineSizeInYears() {
        const last = this.timeaxes[this.timeaxes.length - 1].end
        const first = this.timeaxes[0].start
        return last - first + 1
    }

    // We want to be able to have transitions between multiple time axis e.g.
    // Prehistory is on one axis, nearer history is on another axis
    getBounds(period) {
        const xStart = calcRelativeTimepointInVirtualPixels(period.start)
        const xEnd = calcRelativeTimepointInVirtualPixels(period.end)
        const p = PeriodInTimelineUnits()
        p.start = xStart
        p.end = xEnd
        return p
    }

    calcRelativeTimepointInVirtualPixels(relativeValue) {
        let minBoundX  = 0
        for( let ta of this.timeaxes) {
            if ( ta.isInBounds(relativeValue) ) {
                return minBoundX + ta.calcRelativeTimepointInVirtualPixels(relativeValue)
            } else {
                minBoundX += ta.getTotalWidthRequired()
            }
        }
        return null
    }

    

    calcTimepointFromVirtualPixel(pixels) {
        let minBoundX  = 0
        for( let ta of this.timeaxes) {
            if ( pixels >= minBoundX && pixels <= minBoundX + ta.getTotalWidthRequired() ) {
                // console.log(`TimeAxisCollection ${pixels} ${minBoundX}`)
                return ta.calcTimepointForRelativeVirtualPixel(pixels - minBoundX)
            } else {
                minBoundX += ta.getTotalWidthRequired()
            }
        }
        if ( pixels > this.getVirtualWidth() ) {
            return this.theEnd().relativeValue
        }
        return this.beginning().relativeValue
    }

    // TODO(tom) this should really use TimePoints rather than viewport
    getVirtualX(viewport, restrictToSingleAxis=null) {
        if ( restrictToSingleAxis!= null ) {
            if ( typeof(viewport) == "number" ) {
                return this.timeaxes[restrictToSingleAxis].calcRelativeTimepointInVirtualPixels(viewport)
            } else {
                return this.timeaxes[restrictToSingleAxis].calcRelativeTimepointInVirtualPixels(viewport.timepoint.relativeValue)
            }
        }
        if ( typeof(viewport) == "number" ) {
            return this.calcRelativeTimepointInVirtualPixels(viewport)
        } else {
            return this.calcRelativeTimepointInVirtualPixels(viewport.timepoint.relativeValue)
        }
    }

    getVirtualWidth(restrictToSingleAxis=null) {
        if ( restrictToSingleAxis!= null ) {
            return this.timeaxes[restrictToSingleAxis].getTotalWidthRequired()
        }
        let width  = 0
        for( let ta of this.timeaxes) {
            width += ta.getTotalWidthRequired()
        }
        return width
    }

    draw(canvas, viewport) {
        
        const canvasStyle = window.getComputedStyle(canvas)
        const width = parseInt(canvasStyle.width)
        // the first point is centered on the viewport timepoint
        // we then move to left and right of that point by the width of the viewport
        const virtualX = this.calcRelativeTimepointInVirtualPixels(viewport.timepoint.relativeValue)
        const centrePointOfCanvas = width / 2
        // so virtualX is 375, so we want to display [375-500/2, 375+500/2]
        // console.log(`virtualX: ${viewport.timepoint.relativeValue} => ${virtualX} ${viewport.widthInPixels} ${width}`)
        const virtualLeft = virtualX - (width/2)
        const virtualRight = virtualX + (width/2)
        // console.log(`[viewport virtual pixels] left bound: ${virtualLeft} right bound: ${virtualRight}`)
        let pushRight = 0
        if ( virtualLeft < 0 ) {
            pushRight = -virtualLeft
        }
        const leftmostTimepoint = this.calcTimepointFromVirtualPixel(virtualLeft)
        const rightmostTimepoint = this.calcTimepointFromVirtualPixel(virtualRight)
        // console.log(`display timeline for bounds (years): ${leftmostTimepoint} ${rightmostTimepoint}`)

        
        canvas.innerHTML = ""

        
        let left = pushRight                    // where to start the new axis
        let majorVerticalLineHeight = "100px"
        for( let ta of this.timeaxes) {
            if ( ta.containsTimepoint(leftmostTimepoint, rightmostTimepoint) ) {
                left = ta.draw(canvas, viewport, left, virtualLeft, virtualRight, leftmostTimepoint, rightmostTimepoint)
                majorVerticalLineHeight = ta.majorVerticalLineHeight()
            }
        }

        // this establishing our new viewport for all the other items
        const viewportRect = new ViewportRect()
        viewportRect.timeAxisCollection = this
        viewportRect.center = virtualX
        viewportRect.left = virtualLeft
        viewportRect.right = virtualRight
        viewportRect.centerTimepoint = viewport.timepoint
        viewportRect.timepointLeft = new TimePoint(leftmostTimepoint)
        viewportRect.timepointRight = new TimePoint(rightmostTimepoint)
        viewportRect.height = majorVerticalLineHeight

        return viewportRect
    }

    log() {
        for( let ta of this.timeaxes ) {
            ta.log()
        }
    }
}
