// An object for picking which axis is the current one
// We add a background for each axes  when we click on the background
// the scroll bar will only scroll for that axes.
class AxisChooser {
    constructor(timeAxisCollection) {
        this.listeners = []
        this.axisPickerElementStyle = null
        this.timeAxisCollection = timeAxisCollection
        this.currentScrollAxisIndex = 0;
        this.axisPickerElement = document.createElement("div")
        this.axisPickerElement.classList.add("timeline-axis-picker")
        this.widths = []
        this.axisWidthProportions = []
        this.axisBlockElements = []
    }

    addListener(item) {
        this.listeners.push(item)
    }

    notify() {
        for( let l of this.listeners) {
            l(this)
        }
    }

    getElement() {
        return this.axisPickerElement
    }

    getAxisIndex() {
        return this.currentScrollAxisIndex
    }

    getWidth() {
        const axisPickerElementStyle = window.getComputedStyle(this.axisPickerElement)
        return parseInt(axisPickerElementStyle.width) 
    }

    getHeight() {
        const axisPickerElementStyle = window.getComputedStyle(this.axisPickerElement)
        return parseInt(axisPickerElementStyle.height)
    }

    build() {
        const axisPickerWidth = this.getWidth()
        if (typeof(axisPickerWidth) === "undefined") {
            console.assert("AxisChooser::build must be called AFTER the element has been added to the DOM as it requires the width to be computed.")
        }
        this.widths = this._calculateHowWideEachAxisBlockShouldBeByTime()
        this.axisWidthProportions = Array(this.widths.length)
        for( let ii=0; ii < this.widths.length; ii++ ) {
            this.axisWidthProportions[ii] = this.widths[ii] / axisPickerWidth
        }
        this._createAxisBlocks()
    }

    _createAxisBlocks() {
        const self = this
        let ii=0
        let left = 0
        this.axisBlockElements = []
        for( let axis of this.timeAxisCollection.timeaxes ) {
            const w = this.widths[ii]
            const axisDiv = document.createElement("div")
            this.axisBlockElements.push(axisDiv)
            axisDiv.style.position = "absolute"
            axisDiv.style.width = w + "px"
            axisDiv.style.padding = 0 + "px"
            axisDiv.style.margin = 0 + "px"
            axisDiv.style.backgroundColor = axis.scrollBackgroundColor
            axisDiv.style.left = left + "px"
            axisDiv.style.top = 0 + "px"
            axisDiv.style.height = this.getHeight() + "px"
            axisDiv.dataset.index = ii
            axisDiv.title = axis.startAsTimepoint().toString() + " to " + axis.endAsTimepoint().toString()

            
            axisDiv.addEventListener("click", function(e) {
                self.onClick(e)
            });
            
            this.axisPickerElement.append(axisDiv)
            left += w
            ii++
        }
        if ( Math.round(left) > this.getWidth() ) {
            alert(`[AxisChooser] WARNING bounds blasted ${left}`)
        }
    }

    setCurrentAxis(index) {
        this.currentScrollAxisIndex = index
        this.clearSelected()
        this.setSelected(this.currentScrollAxisIndex)
        this.notify()
    }

    clearSelected() {
        let el = document.getElementsByClassName("timeline-axis-selected")
        for( let x of el ) {
            x.classList.remove("timeline-axis-selected")
        }
    }
    setSelected(index) {
        this.axisBlockElements[index].classList.add("timeline-axis-selected")
    }

    onResize() {
        // This is called from Timeline::onElementResize every AnimationFrame
        // If you add a console.log it will spew out a lot of info!!
        const axisPickerWidth = this.getWidth()
        const axisCount = this.timeAxisCollection.timeaxes.length
        const widths = Array(axisCount)
        if ( this.axisWidthProportions ) {
            for( let ii=0; ii < widths.length; ii++ ) {
                widths[ii] = this.axisWidthProportions[ii] * axisPickerWidth
            }

            let ii=0;
            let left = 0
            for( let ch of this.axisPickerElement.children ) {
                ch.style.width = widths[ii] + "px"
                ch.style.left = left + "px"
                left += widths[ii]
                ii++
            }
        }
        this.widths = widths
    }

    onClick(e) {
        const axisIndex = e.target.dataset.index
        if ( self.currentScrollAxisIndex == axisIndex ) return
        this.clearSelected()
        this.setSelected(axisIndex)
        this.setCurrentAxis(axisIndex)
        this.notify()
    }

    _calculateHowWideEachAxisBlockShouldBeByTime() {
        const axisPickerWidth = this.getWidth()
        const virtualTotalWidth = this.timeAxisCollection.getVirtualWidth()
        const axisCount = this.timeAxisCollection.timeaxes.length
        let widths = Array(axisCount)
        let ii =0
        for( let axis of this.timeAxisCollection.timeaxes ) {
            const p = axis.getTotalWidthRequired() / virtualTotalWidth;
            widths[ii] = p * axisPickerWidth
            ii++
        }
        let minWidth = 25
        if ( axisPickerWidth > minWidth * axisCount ) {
            for( let a in widths ) {
                if ( widths[a] < minWidth ) {
                    let dw = minWidth - widths[a]
                    widths[a] = minWidth

                    // we then need to spread the extra by removing some from other larger blocks
                    let n = axisCount - 1 // remove 1 as we ignore index a
                    let count = 0
                    let dwp = dw / n // amount to shave off each of the other items
                    while ( dwp ) {
                        let odwp = dwp
                        // we count how many axis have a width with some room to shave
                        count = 0
                        for( let b in widths ) {
                            if ( a != b && widths[b] > minWidth + dwp) {
                                count++
                            }
                        }
                        // if we can spread the amount over all the remaining then count will equal n
                        // otherwise we need to increase the amount per available axis
                        if ( count == n ) {
                            break
                        }
                        if ( count == 0 ) {
                            // we don't have enough from any of them, unlikely?
                            break
                        }
                        n = count
                        dwp = dw / n
                    }
                    for( let b in widths ) {
                        if ( a != b && widths[b] > minWidth + dwp ) {
                            widths[b] -= dwp
                        }
                    }
                }
            }
        } else {
            // equally divide them if we have a small window
            for( let a in widths ) {
                widths[a] = axisPickerWidth / axisCount
            }
        }
        return widths
    }
}