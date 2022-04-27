class ScrollBar {
    constructor(container) {
        this.listeners = []
        this.container = container
        this.viewport = null
        
        this.scrollBar = null
        this.scrollBarButton = null
        
        this.scrollBarHidden = null
        this.scrollBarButtonLeftTransition = null
        this.scrollBarButtonRightTransition = null

        this.scrollBarButtonDrag = false
        this.scrollBarButtonDragStart = 0

        this.largeStep = 5
        this.smallStep = 1

        this.value = 0

        this._init()
        this.addEventHandlers()
    }

    addListener(item) {
        this.listeners.push(item)
    }

    notify(change) {
        for( let l of this.listeners) {
            l(this, change)
        }
    }

    setLargeStep(value) {
        this.largeStep = value * this.getScrollBarRulerLength()
    }

    setSmallStep(value) {
        this.smallStep = value * this.getScrollBarRulerLength()
    }

    setViewport(viewport) {
        this.viewport = viewport
        
        this.draw()
    }

    _init() {
        this.scrollBar = document.createElement("div")
        this.scrollBar.classList.add("timeline-scrollbar")
        this.container.appendChild(this.scrollBar)

        // this scrollbar is a container for the transitions and hides the vertical part of the blur radius
        this.scrollBarHidden = document.createElement("div")
        this.scrollBarHidden.classList.add("timeline-scrollbar-hidden")
        this.scrollBar.appendChild(this.scrollBarHidden)

        this.scrollBarButton = document.createElement("div")
        this.scrollBarButton.classList.add("timeline-scrollbar-button")
        this.scrollBar.append(this.scrollBarButton)
        
        this.scrollBarButtonLeftTransition = document.createElement("div")
        this.scrollBarButtonLeftTransition.classList.add("timeline-scrollbar-button-left-transition")
        this.scrollBarHidden.append(this.scrollBarButtonLeftTransition)
        
        this.scrollBarButtonRightTransition = document.createElement("div")
        this.scrollBarButtonRightTransition.classList.add("timeline-scrollbar-button-right-transition")
        this.scrollBarHidden.append(this.scrollBarButtonRightTransition)
    }

    getButtonWidth() {
        const scrollBarButtonStyle = window.getComputedStyle(this.scrollBarButton)
        return parseInt(scrollBarButtonStyle.width) + parseInt(scrollBarButtonStyle.paddingLeft) + parseInt(scrollBarButtonStyle.paddingRight)
    }

    getScrollBarWidth() {
        const scrollBarStyle = window.getComputedStyle(this.scrollBar)
        return parseInt(scrollBarStyle.width) + parseInt(scrollBarStyle.paddingLeft) + parseInt(scrollBarStyle.paddingRight)
    }

    getScrollBarMin() {
        return 0 
    }

    getScrollBarMax() {
        return this.getScrollBarWidth() - this.getButtonWidth()
    }

    getScrollBarRulerLength() {
        return this.getScrollBarMax() - this.getScrollBarMin()
    }

    setText() {
        // set the text on the scroll button
        this.scrollBarButton.innerText = this.viewport.timepoint.toString()
        const width = this.getButtonWidth()
        this.scrollBarButtonLeftTransition.style.width = width
        this.scrollBarButtonRightTransition.style.width = width
    }

    setTooltip() {
        this.scrollBarButton.title = this.viewport.timepoint.toString()
    }

    setValue(value) {
        // pixels along scrollbar
        this.value = Math.max(self.getScrollBarMin(),Math.min(self.getScrollBarMax(),value))
        this.notify(value / this.getScrollBarRulerLength())
        this.draw()
    }

    setProportion(value) {
        this.value = value * this.getScrollBarRulerLength()
        this.notify(this.value / this.getScrollBarRulerLength())
        this.draw()
    }

    setPosition() {
        // set the position of the scroll button
        const left = this.value //- this.getButtonWidth()/2 // this draws the button middle where my mouse is
        const cssLeft= left + "px"
        // console.log(`scrollBar::setPosition ${cssLeft} ${this.getScrollBarRulerLength()}`)
        
        this.scrollBarButton.style.left = cssLeft
        this.scrollBarButtonLeftTransition.style.left = cssLeft
        this.scrollBarButtonRightTransition.style.left = cssLeft

    }

    draw() {
        this.setText()
        this.setTooltip()
        this.setPosition()
    }

    startDrag() {
        // When we drag we save the middle position of the button as that is the position we take as the pointer
        this.scrollBarButtonDrag = true
        const style = window.getComputedStyle(this.scrollBarButton)
        this.scrollBarButtonDragStart = parseInt(style.left) + parseInt(style.paddingLeft) + parseInt(style.width)/2
    }

    stopDrag() {
        this.scrollBarButtonDrag = false
    }

    isDrag() {
        return this.scrollBarButtonDrag
    }

    getPixelPosition() {
        // get position of the middle of the button on the scrollbar
        const scrollBarButtonStyle = window.getComputedStyle(this.scrollBarButton)
        return parseInt(scrollBarButtonStyle.left) //+ parseInt(scrollBarButtonStyle.width)/2 + parseInt(scrollBarButtonStyle.paddingLeft)
    }

    getProportion() {
        return this.value / this.getScrollBarRulerLength()
    }

    _getRelativeScrollBarMouseX(clientX) {
        if ( typeof(clientX) == "object" ) {
            clientX = clientX.clientX
        }
        let x = clientX // relative to browser window
        const style = window.getComputedStyle(this.scrollBar)
        const rect = this.scrollBar.getBoundingClientRect()
        x -= (rect.left + parseInt(style.paddingLeft) + this.getButtonWidth()/2)
        // console.log(`_getRelativeScrollBarMouseX ${clientX} ${rect.left} ${style.paddingLeft} ${x}`)
        return x
    }

    addEventHandlers() {
        const self = this

        this.scrollBarButton.addEventListener("mousedown", function(e) {
            // console.log("scrollbutton::mousedown")
            self.startDrag()
        })

        this.scrollBarButton.addEventListener("mouseup", function(e) {
            // console.log("scrollbutton::mouseup")
            // self._onMouseMove(e.clientX)
            // self.stopDrag()
        })

        this.scrollBarButton.addEventListener("mousemove", function(e) {
            //console.log("scrollBarButton::mousemove")
        })

        this.scrollBar.addEventListener("mouseleave", function(e) {
            let x = self._getRelativeScrollBarMouseX(e)
            self._onMouseMove(x)
            self.stopDrag()
        })

        this.scrollBar.addEventListener("mousemove", function(e) {
            // this still receives events for child elements
            // console.log("scrollBar::mousemove")
            if ( self.isDrag() ) {
                let x = self._getRelativeScrollBarMouseX(e)
                self._onMouseMove(x)
            }
        })

        this.scrollBar.addEventListener("click", function(e) {
            self._onMouseClick(e)
        })
    }

    _onMouseClick(e) {
        // console.log("scrollBar::click also fired on mouseup")
        if ( this.isDrag() ) {
            let x = this._getRelativeScrollBarMouseX(e.clientX)
            this._onMouseMove(x)
            this.stopDrag()
        } else {
            // did we click to the left or right of the button and 
            // were we holding down any special buttons
            const style = window.getComputedStyle(this.scrollBarButton)
            const right = parseInt(style.left) + parseInt(style.paddingLeft) + parseInt(style.width) + parseInt(style.paddingRight)

            let stepSize = this.smallStep
            if ( e.shiftKey ) {
                stepSize = this.largeStep
            }
            if ( e.ctrlKey ) {
                stepSize = 1
            }
            // console.log(`X: ${e.clientX} L: ${left} R: ${right}`)
            if ( e.clientX > right ) {
                // click is the right -->    
            } else {
                // click is to the left <--
                stepSize = -stepSize
            }
            const pp = this.getPixelPosition()
            const vv = pp / this.getScrollBarRulerLength()
            const v = this.getPixelPosition() + stepSize
            const value = Math.max(this.getScrollBarMin(),Math.min(this.getScrollBarMax(),v ))
            this.value = value
            const p = value / this.getScrollBarRulerLength()
            // console.log(`scrollbar::step ${this.smallStep} (${pp} ${vv}) ${v} ${value} ${stepSize} ${this.value} ${p}`)
            this.notify(p)
            
            this.draw()
        }
    }
    _onMouseMove(clientX) {
        if (!this.isDrag()) return
        const value = Math.max(this.getScrollBarMin(),Math.min(this.getScrollBarMax(),clientX))
        // console.log(`mousedrag ${value} ${this.getPixelPosition()} ${this.getScrollBarMax()} ${this.getScrollBarMin()}`)
        this.value = value
        this.notify(value / this.getScrollBarRulerLength())
        this.draw()
    }

    setBackgroundColor(backgroundColor) {
        this.scrollBar.style.backgroundColor = backgroundColor
        this.scrollBarButtonLeftTransition.style.backgroundColor = backgroundColor
        this.scrollBarButtonRightTransition.style.backgroundColor = backgroundColor
    }

}