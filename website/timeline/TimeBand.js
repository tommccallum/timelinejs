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
        this.visible = false
        
        // while the events are here as they are loaded with the data
        // they are shown in the EventBandCollection which controls the timeband
        this.events = []
        this.hasNewEventsAdded = false

        if ( this.data ) {
            if ( this.data.hasOwnProperty("name") ) {
                this.name = this.data.name
            }
            if ( this.data.hasOwnProperty("image") ) {
                this.image = this.data.image
            }
            if ( this.data.hasOwnProperty("visible") ) {
                this.visible = this.data.visible
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
                    this.addEvent(ev)
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

    onFirstDraw() {
        // force a redraw and update connected components
        this.setVisible(this.visible)
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
            ev.setBandOnEvent(eventband)
        }
        this.hasNewEventsAdded = false
    }

    containsEvent(ev) {
        for( let e of this.events ) {
            if ( e === ev ) {
                return true
            }
            if ( e.containsEvent(ev) ) {
                return true
            }
        }
        return false
    }

    makeEvent(event) {
        const self = this
        if ( event.isObservable() ) {
            event.addListener(function(a,b,c) { 
                if ( a === "event-deselect-all" ) {
                    // on all events we need to remove all selections
                    for( let ev of self.events) {
                        ev.deselect()
                        ev.deselectChildren()
                    }
                }
                self.forward(a,b,c) 
            })
        }
        this.hasNewEventsAdded = true
        return event
    }

    addEvent(event) {
        // MUST use this function to add events otherwise we will miss out on listeners
        const eventObject = this.makeEvent(event)
        this.events.push(eventObject)
        if ( !!eventObject.data.children ) {
            for( let childData of eventObject.data.children ) {
                let child = new Event(childData)
                child = this.makeEvent(child)
                eventObject.children.push(child)
            }
        }
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