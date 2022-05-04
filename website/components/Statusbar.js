class Statusbar {
    constructor(element) {
        this.element = element
    }

    
    onTimelineEvent(event, timeline, data) {
        const self = this
        if ( event === "mousemove") {
            // console.log("Statusbar::mousemove")
            let axisLabel = `${data.timeaxis.startAsTimepoint().toString()} to ${data.timeaxis.endAsTimepoint().toString()}`
            if ( data.timeaxis.name ) {
                axisLabel = `${data.timeaxis.name} from ${axisLabel}`
            }
            this.element.innerHTML = `${data.eventband.timeband.name}<br/>${axisLabel}<br/>${data.timepoint.toString()}`
        }
    }
}