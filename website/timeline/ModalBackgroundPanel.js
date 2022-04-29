// show a big semi-transparent background for event details and big image
class ModalBackgroundPanel extends Observable {
    constructor(timeline) {
        super()
        this.timeline = timeline
        this.element = null

        this.createElement()
    }

    createElement() {
        if ( this.element == null) {
            this.element = document.createElement("div")
            this.element.classList.add("modal-dialog")
            this.timeline.element.appendChild(this.element)
        }
    }

    show() {
        this.timeline.element.appendChild(this.element)
    }

    hide() {
        this.timeline.element.removeChild(this.element)
    }
}