// Show an image in a large panel in front of everything
// should also show credits and if available a link to the 
// original.
class BigImagePanel extends Observable 
{
    constructor(timeline) {
        super()
        this.timeline = timeline
        this.event = null
        this.element = null
        this.imageElement = null
        this.creditElement = null
        this.visible = false
        
        this.createElement()
    }

    createElement() {
        const self = this
        this.element = document.createElement("div")
        this.element.classList.add("bigimagepanel-container")
        this.element.addEventListener("click", function(e) { self._onClick(e) })

        const imageContainer = document.createElement("div")
        imageContainer.classList.add("bigimagepanel-image-container")
        this.element.appendChild(imageContainer)

        this.imageElement = document.createElement("img")
        this.imageElement.classList.add("bigimagepanel-image")
        imageContainer.appendChild(this.imageElement)
        
        this.creditElement = document.createElement("div")
        this.creditElement.classList.add("bigimagepanel-credit")
        this.element.appendChild(this.creditElement)
    }

    _onClick(e) {
        this.hide()
    }

    onResize() {
        if ( !this.visible ) return
        const parent = this.timeline.canvasElement
        if ( !parent ) return
        const timelineStyle = window.getComputedStyle(parent)
        const belowCanvasHeight = this.timeline.scrollBar.getScrollBarHeight() + this.timeline.axisChooser.getHeight()
        const detailsHeight = (parseInt(timelineStyle.height) - belowCanvasHeight - 25)
        this.element.style.height = detailsHeight + "px"
        this.element.style.width = (parseInt(timelineStyle.width) * 0.75) + "px"
        this.element.style.top = (parseInt(timelineStyle.height) * 0.1) + "px"
        this.element.style.left = (parseInt(timelineStyle.width) * 0.25/2) + "px"
        
        const creditsStyle = window.getComputedStyle(this.creditElement)
        const creditsFullHeight = parseInt(creditsStyle.height) + parseInt(creditsStyle.paddingTop) + parseInt(creditsStyle.paddingBottom) + parseInt(creditsStyle.marginTop) + parseInt(creditsStyle.marginBottom)
        this.imageElement.style.height = detailsHeight - 50 - creditsFullHeight + "px"
    }

    // called this as not sure if we want to also be able to set an image directory or not
    setUsingEvent(event) {
        this.event = event
    }

    make() {
        this.imageElement.src = this.event.image
        if ( this.event.imageCredit ) {
            this.creditElement.innerHTML = ""
            if ( this.event.imageCreditLink ) {
                let a = document.createElement("a")
                a.href = this.event.imageCreditLink
                a.target = "_blank"
                a.innerHTML = this.event.imageCredit
                this.creditElement.appendChild(a)
            } else {
                this.creditElement.innerHTML = this.event.imageCredit
            }
        } else {
            this.creditElement.innerHTML = "No credit given image."
        }
    }

    show() {
        this.make()
        this.timeline.element.appendChild(this.element)
        this.visible = true
    }

    hide() {
        this.timeline.element.removeChild(this.element)
        this.visible = false
    }

}
