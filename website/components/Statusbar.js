class Statusbar {
    constructor(element) {
        this.element = element
    }

    
    onTimelineEvent(event, timeline, data) {
        const self = this
        if ( event === "mousemove") {
            let axisLabel = ""
            if ( data.timeaxis ) {
                axisLabel = `${data.timeaxis.startAsTimepoint().toString()} to ${data.timeaxis.endAsTimepoint().toString()}`
                if ( data.timeaxis.name ) {
                    axisLabel = `<br/>${data.timeaxis.name} from ${axisLabel}`
                } else {
                    axisLabel = "<br/>"+axisLabel
                }
            }
            let currentTimepoint = ""
            if ( data.timepoint ) {
                currentTimepoint = `<br/>${data.timepoint.toString()}`
            }
            let eventbandName = ""
            if ( data.eventband ) {
                eventbandName = `${data.eventband.timeband.name}`
            }
            this.element.innerHTML = `${eventbandName}${axisLabel}${currentTimepoint}`
        }
    }
}