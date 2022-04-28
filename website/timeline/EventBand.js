class EventBand {
    // The are horizontal strips across the timeline that can contain sets of events.
    // Each band has a style with which its events are shown for example either as a pure title
    // or as a image and title, or as a dot hoverable.

    constructor(timeband) {
        // timeband is an object created when creating the TimeBandCollection
        this.element = null
        this.timeband = timeband
        const self = this
        this.timeband.addListener(function(a,b,c) { if ( a === "timeband-visible" ) { self._setVisible(c.visible) } })
        this.parentElement = null
        this.setBandOnEvents()
        this.createElement()
    }

    setBandOnEvents() {
        this.timeband.setBandOnEvents(this)
    }
    setParentElement(el) {
        this.parentElement = el
    }

    isVisible() {
        return this.timeband.visible
    }

    _setVisible(b) {
        // this should only be called by timeband
        if ( b ) {
            this.element.style.height = this.timeband.height + "px"
            this.timeband.element.style.height = this.timeband.height + "px"
        } else {
            this.element.style.height = 0 + "px"
            this.timeband.element.style.height = 0 + "px"
        }
    }

    addEvent(event) {
        this.timeband.addEvent(event)
    }

    getTop() {
        return this.timeband.top
    }

    getHeight() {
        return this.timeband.height
    }

    getTotalHeight() {
        if ( this.element ) {
            const style = window.getComputedStyle(this.element)
            return this.timeband.height + parseInt(style.paddingTop) + parseInt(style.paddingBottom)
        }
        return this.timeband.height
    }
    setHeight(height) {
        this.element.style.height = height + "px"
        this.timeband.setHeight(height)
    }

    setTop(top) {
        this.element.style.top = top + "px"
        this.timeband.setTop(top)
    }

    createElement() {
        this.element = document.createElement("div")
        this.element.classList.add('eventband')
    }

    createEvents() {
        for( let ii=0; ii < 5; ii++ ) {
            const ev = new Event()
            ev.name = `T: ${this.timeband.data.name} E: ${ii}`
            this.events.push(ev)
        }
    }

    updateElement() {
        // this.element.style.height = this.height + "px"
    }

    arrange(viewportRect) {
        // in this second pass we are looking for clashes as we move the events
        // so that can be seen as close to their intended date as possible
        for( let ev of this.timeband.events ) {
            ev.arrange(viewportRect)
        }
    }
    draw(viewportRect) {
        if ( !this.isVisible() ) {
            return;
        }
        if ( !this.parentElement.contains(this.element) ) {
            this.parentElement.appendChild(this.element)
            this.timeband.draw()
        }
        
        for( let ev of this.timeband.events ) {
            const eventElement = ev.draw(viewportRect)
            if ( eventElement && !this.element.contains(eventElement) ) {
                this.element.appendChild(eventElement)
            }
        }

        this.arrange(viewportRect)
    }
}