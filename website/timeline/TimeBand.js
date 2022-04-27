class TimeBand extends Observable {
    // The are horizontal strips across the timeline that can contain sets of events.
    // Each band has a style with which its events are shown for example either as a pure title
    // or as a image and title, or as a dot hoverable.

    constructor(data=null) {
        super()
        this.data = data
        this.parent = null
        this.index= 0
        this.name= "New timeband"   // assumes to be unique
        this.timeAxisCollection = null
        this.axisName = null
        this.description = null
        this.style= "title"
        this.backgroundColor= null
        this.image= null
        this.height = -1
        this.top = -1
        this.element = null
        this.visible = true
        
        // while the events are here as they are loaded with the data
        // they are shown in the EventBandCollection which controls the timeband
        this.events = []

        if ( this.data ) {
            if ( this.data.hasOwnProperty("name") ) {
                this.name = this.data.name
            }
            if ( this.data.hasOwnProperty("backgroundColor") ) {
                this.backgroundColor = this.data.backgroundColor
            }
            if ( this.data.hasOwnProperty("axis") ) {
                this.axisName = this.data.axis
            }
            if ( this.data.hasOwnProperty("description") ) {
                this.description = this.data.description
            }
            if ( this.data.hasOwnProperty("events")) {
                this.events = []
                for ( let evData of this.data.events ) {
                    let ev = new Event(evData)
                    this.events.push(ev)
                }
            }
        } 
    
        this.createElement()
    }

    setTimeAxisCollection(timeAxisCollection) {
        this.timeAxisCollection = timeAxisCollection
        this.sendEvent('timeband-change', this)
    }

    getPeriodAsString() {
        if ( this.axisName !== null && this.timeAxisCollection !== null ) {
            const axis = this.timeAxisCollection.find(this.axisName)
            if ( axis != null ) {
                return axis.startAsTimepoint().toString() + " - " + axis.endAsTimepoint().toString()
            }
        }
        return null
    }

    setVisible(b) {
        this.visible = b
        this.sendEvent('timeband-visible', this)
    }

    getEventsThatIntersect(start, end) {
        let eventList = []
        for( let ev of this.events ) {
            if ( ev.intersects(start,end) ) {
                eventList.push(ev)
            }
        }
        return eventList
    }

    setBandOnEvents(eventband) {
        for( let ev of this.events ) {
            ev.eventband = eventband
        }
    }

    addEvent(event) {
        this.events.push(event)
    }

    setTop(value) {
        this.element.style.top = value + "px"
        this.top = value
    }
    setHeight(value) {
        this.element.style.height = value + "px"
        this.height = value
    }
    createElement() {
        this.element = document.createElement("div")
        this.element.classList.add('timeband')
        if ( this.backgroundColor !== null ) {
            this.element.style.backgroundColor = this.backgroundColor
        }
    }

    updateElement() {
        this.element.style.backgroundColor = this.backgroundColor;
        // this.element.style.height = this.height + "px"
    }
    draw() {
        if ( !this.parent.contains(this.element) ) {
            this.parent.appendChild(this.element)
        }
    }
}