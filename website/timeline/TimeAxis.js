class TimeAxis {
    constructor(start=-500, end=500, axisData=null) {
        this.axis = axisData
        this.element = null
        this.verticals = []
        this.name = null // allows timebands to refer to the relevant axis if they are bound to one

        // these bounds are in relative units so BC is < 0 AD > 0
        this.start = start
        this.end = end
        
        // major ticks e.g. 1000,1100,1200,1300,1400 etc
        this.majorEvery = 100
        this.majorWidth = 3
        this.majorStyle = "major-vertical-axis"

        // minor ticks e.g. 1010,1020,1030...
        this.minorEvery = 10
        this.minorWidth = 1
        this.minorStyle = "minor-vertical-axis"
        // space between each minor "tick"
        this.minorGap = 100
        this.showEnd = false

        this.scrollBackgroundColor = "pink"

        this.showLabelsOnMajorAxis = true
        this.showAxisBoundary = true
        this.majorVerticalLineHeightValue = "100%"

        if ( axisData != null ) {
            if ( axisData.hasOwnProperty("showEnd")) {
                this.showEnd = axisData.showEnd
            }
            if ( axisData.hasOwnProperty("name") ) {
                this.name = axisData.name
            }
            if ( axisData.hasOwnProperty("start") ) {
                this.start = axisData.start
            }
            if ( axisData.hasOwnProperty("end") ) {
                this.end = axisData.end
            }
            if ( axisData.hasOwnProperty("majorEvery") ) {
                this.majorEvery = axisData.majorEvery
            }
            if ( axisData.hasOwnProperty("minorEvery") ) {
                this.minorEvery = axisData.minorEvery
            }
            if ( axisData.hasOwnProperty("scrollBackgroundColor") ) {
                this.scrollBackgroundColor = axisData.scrollBackgroundColor
            }
            if ( axisData.hasOwnProperty("gap") ) {
                this.minorGap = axisData.gap
            }
            if ( axisData.hasOwnProperty("showEnd")) {
                this.showEnd = axisData.showEnd
            }
        }


        this.totalWidth = null
        this.totalWidth = this.getTotalWidthRequired()
    }

    majorVerticalLineHeight() {
        return this.majorVerticalLineHeightValue
    }

    duration() {
        let d = this.end - this.start
        // if ( !this.showEnd ) {
        //     d += 1
        // }
        return d
    }
    startAsTimepoint() {
        const tp = new TimePoint(this.start)
        return tp
    }

    endAsTimepoint() {
        const tp = new TimePoint(this.end)
        return tp
    }

    isInBounds(relativeValue) {
        // is the passed value in real world units in the current bounds
        return ( this.start <= relativeValue && this.end >= relativeValue )
    }

    containsTimepoint(a, b) {
        if ( a > this.end || b < this.start ) {
            return false
        }
        return true
    }

    calcRelativeTimepointInVirtualPixels(relativeTimepoint) {
        // Returns the value of the year in virtual pixels
        const nominator = (relativeTimepoint - this.start)
        const denominator = this.duration()
        // console.log(`${nominator} ${denominator} ${nominator/denominator} ${this.getTotalWidthRequired()}`)
        return ( nominator / denominator )  * this.getTotalWidthRequired()
    }

    calcTimepointForRelativeVirtualPixel(pixels) {
        const totalWidth = this.getTotalWidthRequired()
        const year = this.start + ( pixels / totalWidth * this.duration() )
        // console.log(`${this.start} + ${pixels} / ${totalWidth} * ${this.end - this.start} ${year} ${pixels / totalWidth}`)
        return year
    }

    _getTotalWidthRequired() {
        // This gives us the total virtual space that this would take up
        // if we had an infinite canvas.
        const majorVerticalCount = (this.duration() / this.majorEvery) + 1
        let minorVerticalCount = (this.duration() / this.minorEvery) + 1
        if ( this.majorEvery % this.minorEvery == 0 ) {
            minorVerticalCount -= majorVerticalCount
        }
        const width = (majorVerticalCount * this.majorWidth) + (minorVerticalCount * this.minorWidth) +  (minorVerticalCount * this.minorGap)
        // console.log(`Axis width: ${width}`)
        return width
    }

    getTotalWidthRequired() {
        if ( typeof(this.totalWidth) === "undefined" || this.totalWidth === null ) {
            this.totalWidth = this._getTotalWidthRequired()
        } 
        return this.totalWidth
    }

    draw(canvas, viewport, canvasLeft, virtualLeft, virtualRight, leftmostTimepoint, rightmostTimepoint) {
        // canvasLeft is in the coordinates of the div that we see and is the start from the previous axis if any
        // virtual* is in the virtual coordinates of an infinite canvas of our timeline
        // *Timepoint are the associated ends of the timeline visible

        // The canvasLeft > 0 stops us from showing the first axis which we know is there, we are only interested
        // in showing when the axis changes after the initial entry point.
        let axisDivider = null
        if (this.showAxisBoundary && canvasLeft > 0 && canvasLeft < viewport.widthInPixels) {
            // I had a wierd bug where if this was added and left was passed the width of the timeaxis div then
            // the width would shrink from 1884 to 1872. Not sure why. But making sure that this is only added when
            // canvasLeft was less than the width seems fine.  
            // I also added overflow:hidden to timeaxis-divider to stop this in the future at edge cases.
            axisDivider = document.createElement("div")
            axisDivider.classList.add("timeaxis-divider")
            axisDivider.style.left = canvasLeft + "px"
            canvas.append(axisDivider)
        }

        let lastVerticalDrawn = -1
        let oldVirtualLeft = virtualLeft
        if ( leftmostTimepoint < this.start ) {
            leftmostTimepoint = this.start
        }
        virtualLeft = this.calcRelativeTimepointInVirtualPixels(leftmostTimepoint)
        //console.log(`TimeAxis::draw ${leftmostTimepoint} -> ${rightmostTimepoint} ${canvasLeft} ${oldVirtualLeft} ${virtualLeft}`)
        let tp = leftmostTimepoint
        while( canvasLeft < viewport.widthInPixels) {
            tp = this.calcTimepointForRelativeVirtualPixel(virtualLeft)
            const nearestYear = Math.floor(tp)
            if ( this.showEnd ) {
                if ( nearestYear > this.end ) {
                    break   
                }
            } else {
                if ( nearestYear >= this.end ) {
                    break   
                }
            }
            const yearVertical = Math.floor(nearestYear / this.minorEvery) * this.minorEvery
            // console.log(`AXIS: ${tp} ${this.end} ${nearestYear} ${yearVertical}`)
            // so that our axis don't fall between transitions e.g. 179.67, 180.50
            // we 
            // console.log(`Pixel ${virtualLeft} => Year ${tp} => |_Year_| ${nearestYear} ${this.minorEvery} ${yearVertical} => left: ${canvasLeft} ${lastVerticalDrawn}`)
            // the second clause here stop us if an additional pixel keeps us in the same year
            // We may want to round to the nearest modulo minorEvery otherwise we miss a lot when we are fitting 
            // a lot of values in to a smaller space.
            if ( lastVerticalDrawn != yearVertical ) {
                lastVerticalDrawn = yearVertical
                if ( yearVertical % this.majorEvery == 0 ) {
                    const majorLine = document.createElement("div")
                    majorLine.classList.add(this.majorStyle)
                    majorLine.style.left = Math.max(1,canvasLeft - (this.majorWidth/2))  + "px"
                    majorLine.style.width = this.majorWidth + "px"
                    majorLine.title = (new TimePoint(yearVertical)).toString()
                    canvas.append(majorLine)
                    if ( axisDivider) {
                        axisDivider.title = (new TimePoint(yearVertical)).toString()
                    }

                    // we want to add a wee label on there
                    if ( this.showLabelsOnMajorAxis ) {
                        const majorLineLabel = document.createElement("div")
                        majorLineLabel.classList.add("major-vertical-label")
                        majorLineLabel.innerText = (new TimePoint(yearVertical)).toString()
                        canvas.append(majorLineLabel) // this has to happen before we know the browser thought our label width would be
                        const style = window.getComputedStyle(majorLineLabel)
                        majorLineLabel.title = (new TimePoint(yearVertical)).toString()
                        majorLineLabel.style.left = (canvasLeft - (parseInt(style.width))/2) + "px"
                        //majorLineLabel.style.left = (canvasLeft + 10) + "px"

                        const canvasStyle = window.getComputedStyle(canvas)
                        majorLine.style.height = ( parseInt(canvasStyle.height) - parseInt(style.height) - parseInt(style.bottom) * 2 ) + "px"
                        this.majorVerticalLineHeightValue = parseInt(majorLine.style.height)
                        if ( axisDivider ) {
                            axisDivider.style.height = ( parseInt(canvasStyle.height) - parseInt(style.height) - parseInt(style.bottom) * 2 ) + "px"
                        }
                    }
                    axisDivider = null // we null again as we only want to add this to the FIRST line it covers
                }
                if ( yearVertical % this.minorEvery == 0 && yearVertical % this.majorEvery != 0) {
                    const minorLine = document.createElement("div")
                    minorLine.classList.add(this.minorStyle)
                    minorLine.style.left = Math.max(1,canvasLeft - this.minorWidth/2)  + "px"
                    minorLine.style.width = this.minorWidth + "px"
                    minorLine.title = (new TimePoint(yearVertical)).toString()
                    canvas.append(minorLine)
                    if ( axisDivider) {
                        axisDivider.title = (new TimePoint(yearVertical)).toString()
                        axisDivider = null // we null again as we only want to add this to the FIRST line it covers
                    }
                }
            }
            virtualLeft += 1
            canvasLeft += 1
        }
        return canvasLeft
    }

    log() {
        const majorVerticalCount = ((this.end - this.start) / this.majorEvery) + 1
        console.log(`AXIS: ${this.start} to ${this.end} Major:${this.majorEvery} Minor:${this.minorEvery} VirtualWidth:${this.getTotalWidthRequired()} MajorVerticals:${majorVerticalCount}`)
    }

    id() {
        return `Axis(${this.start},${this.end})`
    }
}