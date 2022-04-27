class Splitter {
    constructor(canvasElement) {
        this.canvasElement=canvasElement
        this.above = null
        this.below = null
        this.height = null
        this.element = null
        this.index = null
        this.createElement()
    }

    setTop(top) {
        this.element.style.top = top + "px"
    }

    getTop() {
        const splitterStyle = window.getComputedStyle(this.element)
        return parseInt(splitterStyle.top)
    }

    setIndex(index) {
        this.index = index
        this.element.dataset.index = index
    }

    getIndex() {
        return parseInt(this.element.dataset.index)
    }
    createElement() {
        this.element = document.createElement("div")
        this.element.classList.add("eventband-splitter")
        return this.element
    }

    addEventListener(eventName, callback) {
        this.element.addEventListener(eventName, callback)
    }

    setAppropriateVisibility() {
        if ( this.above === null || this.below === null ) {
            this.hide()
        } else {
            this.show()
        }
    }

    show() {
        // console.log(`splitter ${this.index} visible`)
        if ( this.canvasElement.contains(this.element) ) {
        } else {
            this.canvasElement.appendChild( this.element)
        }
        this.element.style.display = ''
    }

    hide() {
        // console.log(`splitter ${this.index} hide`)
        this.element.style.display = 'none'
    }

    getHeight() {
        if ( this.height === null ) {
            this.canvasElement.appendChild(this.element)
            const splitterStyle = window.getComputedStyle(this.element)
            this.height = parseInt(splitterStyle.height)
            this.canvasElement.removeChild(this.element)
        }
        return this.height
    }
}