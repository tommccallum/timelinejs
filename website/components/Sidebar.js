class Sidebar {
    constructor(element) {
        this.element = element
        this.menuItemsElement = null
    }

    build() {
        const self = this
        this.menuItemsElement = document.createElement("ul")
        this.element.appendChild(this.menuItemsElement)
        this.addMenuItem("☰", "Collapse menu", function (e) { self.toggle(e) })
        this.addMenuItem("&#x2648", "Timelines")
    }

    addMenuItem(icon, label, callback) {
        const li = document.createElement("li")
        this.menuItemsElement.appendChild(li)
        const a = document.createElement("a")
        li.appendChild(a)
        a.classList.add("nav-expand")
        a.classList.add("nav-item")
        a.innerHTML = icon
        a.addEventListener("click", callback)
        const span = document.createElement("span")
        span.innerText = label
        li.appendChild(span)
    }

    addTimelineMenuItem(timeband) {
        const li = document.createElement("li")
        this.menuItemsElement.appendChild(li)
        li.dataset.name = timeband.name
        this.makeTimebandMenuItem(li, timeband)
    }

    makeTimebandMenuItem(element, timeband) {
        // we want a left and right, the right have 1 or two rows
        const container = document.createElement("div")
        container.classList.add("menu-item-timeband-container")
        element.appendChild(container)
        
        const left = document.createElement("div")
        left.classList.add("menu-item-timeband-container-left")
        const right = document.createElement("div")
        right.classList.add("menu-item-timeband-container-right")
        container.appendChild(left)
        container.appendChild(right)

        const a = document.createElement("a")
        left.appendChild(a)
        a.classList.add("nav-expand")
        a.classList.add("nav-item")
        if ( timeband.image !== null ) {
            const img = document.createElement("img")
            img.classList.add("menu-item-timeband-image")
            img.src = timeband.image
            img.alt = timeband.name
            a.appendChild(img)
        } else {
            a.innerHTML = "T"
        }
        a.title = timeband.name
        // a.innerHTML = timeband.image
        // a.addEventListener("click", callback)


        const period = timeband.getPeriodAsString()
        let topDiv=right;
        if ( period ) {
            right.classList.add("menu-item-timeband-with-period-container")
            topDiv = document.createElement("div")
            right.appendChild(topDiv)
            const bottomDiv = document.createElement("div")
            bottomDiv.classList.add("menu-item-timeband-with-period-container-bottom")
            right.appendChild(bottomDiv)
            if ( period ) {
                bottomDiv.innerText = period
                bottomDiv.title = period
            }
        }
        
        const span = document.createElement("span")
        span.innerText = timeband.name
        topDiv.appendChild(span)
        topDiv.title= timeband.name
        if ( timeband.description ) {
            topDiv.title= timeband.name + ": " + timeband.description
        }

        const visibility = document.createElement("span")
        visibility.classList.add("sidebar-menu-item-visible")
        visibility.dataset.for = timeband.name
        visibility.dataset.value = true
        visibility.innerHTML = "&#128065"
        const tb = timeband
        visibility.addEventListener("click", function (e) { 
            let b = visibility.dataset.value === 'true'
            if ( b ) {
                visibility.dataset.value = false
                tb.setVisible(false)
            } else {
                visibility.dataset.value = true
                tb.setVisible(true)
            }
         })
        topDiv.appendChild(visibility)
    }



    updateTimelineMenuItem(element, timeband) {
        element.innerHTML = ""
        this.makeTimebandMenuItem(element, timeband)
    }

    toggle(e) {
        const nav = this.element
        const style = window.getComputedStyle(nav)
        const w = parseInt(style.width)
        const expandItem = document.getElementsByClassName("nav-expand")[0]
        expandItem.classList.remove("nav-expand-animation")
        expandItem.classList.remove("nav-expand-animation-backwards")
        expandItem.offsetHeight
        if (w < 250) {
            expandItem.classList.add("nav-expand-animation")
            nav.style.flex = "0 0 250px";
        } else {
            expandItem.classList.add("nav-expand-animation-backwards")
            nav.style.flex = "0 0 32px";
        }
    }

    onTimelineEvent(event, timeline, data) {
        const self = this
        
        if (event === "add-timeband") {
            const thisTimeband = data
            thisTimeband.addListener(function(a,b,c) { self.onTimelineEvent(a,b,c) })
            this.addTimelineMenuItem(thisTimeband)
        } else if ( event === "timeband-visible") {
            const item = document.querySelector(`.sidebar-menu-item-visible[data-for='${data.name}'`)
            if ( data.visible ) {
                item.innerHTML = "&#128065"
            } else {
                item.innerHTML = "&#128683"
            }
        } else if ( event === "timeband-change") {
            // this is called when something about the timeband has changed and we need to update our label
            const thisTimeband = data
            const element = document.querySelector(`li[data-name='${thisTimeband.name}']`)
            if ( element ) {
                this.updateTimelineMenuItem(element, data)
            }
        }
    }
}