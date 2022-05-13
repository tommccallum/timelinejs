class ColourPicker {
    constructor(element) {
        this.element = element
        this.colourPlaneSize = 360

        // Most colour models are 3 parameter
        // We show the first parameter as a bar.
        // We show this using a 2d square for the other 2 parameters.

        // So we have a square which shows the 2 other parameters
        this.colourPlaneContainer = null
        this.colourPlane = null
        this.colourBarContainer = null     // we keep the bar in an additional div to hide overflow of pincers at side
        this.colourBar = null
        this.alphaBarContainer = null
        this.alphaBar = null

        this.colourLeftPincer = null
        this.colourRightPincer = null

        this.alphaLeftPincer = null
        this.alphaRightPincer = null

        // keep direct links to input boxes to make it easy to set/get values
        this.hex = null
        this.hex_sample = null
        this.hsl_hue = null
        this.hsl_saturation = null
        this.hsl_luminosity = null
        this.hsl_alpha = null
        this.hsl_sample = null

        this.red = null
        this.green = null
        this.blue = null
        this.alpha = null
        this.rgb_sample = null

        this.selectedParameter = 0
        this.selectedColour = 0
        this.lastPlaneMousePosition = null
        this.lastColourBarMousePosition = null
        this.lastAlphaBarMousePosition = null

        this.alphaBarLeftButtonPressed = false
        this.colourBarLeftButtonPressed = false


        // This is a copy of the colour plane canvas ImageData that we keep to speed up the update on mouse move.
        // It is used to restore the plane so we can redraw the white ring as the user moves the mouse around.
        this.imageDataCopy = null

        const self = this;
        window.addEventListener("load", function () {
            console.log("loaded")
            self.draw()
        })
    }

    createHSL() {
        const hslDisplay = document.createElement("div")
        hslDisplay.classList.add("colourpicker-display-section")

        const table = document.createElement("table")
        hslDisplay.appendChild(table)

        let tr = document.createElement("tr")
        let td = document.createElement("td")

        let label = document.createElement("label")
        label.for = "hsl_hue"
        label.innerHTML = "Hue:"
        td.appendChild(label)
        tr.appendChild(td)

        const hue = document.createElement("input")
        hue.name = "hsl_hue"
        hue.type = "text"
        hue.title = "Hue is a value between 0 and 360. It represents the angle on a cylinder which represents the various colours."
        this.hsl_hue = hue

        td = document.createElement("td")
        td.appendChild(hue)
        tr.appendChild(td)
        table.appendChild(tr)

        label = document.createElement("label")
        label.for = "hsl_saturation"
        label.innerHTML = "Saturation:"

        tr = document.createElement("tr")
        td = document.createElement("td")
        td.appendChild(label)
        tr.appendChild(td)
        table.appendChild(tr)


        const saturation = document.createElement("input")
        saturation.name = "hsl_saturation"
        saturation.type = "text"
        saturation.title = "Saturation is the X (horizontal) coordinate on the colour plane and is a real number between 0 and 100."
        this.hsl_saturation = saturation

        td = document.createElement("td")
        td.appendChild(saturation)
        tr.appendChild(td)
        table.appendChild(tr)

        label = document.createElement("label")
        label.for = "hsl_luminosity"
        label.innerHTML = "Luminosity:"

        tr = document.createElement("tr")
        td = document.createElement("td")
        td.appendChild(label)
        tr.appendChild(td)
        table.appendChild(tr)


        const luminosity = document.createElement("input")
        luminosity.name = "hsl_luminosity"
        luminosity.type = "text"
        luminosity.title = "Luminosity is the Y (vertical) coordinate on the colour plane and is a real number between 0 and 100."
        this.hsl_luminosity = luminosity

        td = document.createElement("td")
        td.appendChild(luminosity)
        tr.appendChild(td)
        table.appendChild(tr)


        label = document.createElement("label")
        label.for = "hsl_alpha"
        label.innerHTML = "Alpha:"

        tr = document.createElement("tr")
        td = document.createElement("td")
        td.appendChild(label)
        tr.appendChild(td)
        table.appendChild(tr)


        const alpha = document.createElement("input")
        alpha.name = "hsl_alpha"
        alpha.type = "text"
        this.hsl_alpha = alpha


        td = document.createElement("td")
        td.appendChild(alpha)
        tr.appendChild(td)
        table.appendChild(tr)


        const sample = document.createElement("div")
        sample.classList.add("sample")
        hslDisplay.appendChild(sample)
        this.hsl_sample = sample

        const copy = document.createElement("button")
        copy.classList.add("colourpicker-copy-button")
        copy.title = "Click to copy HSL CSS code e.g. hsl(180, 10%, 20%)"
        copy.innerHTML = this.copyHtmlCode() + "Copy hsla"
        hslDisplay.appendChild(copy)
        const self = this
        copy.addEventListener("click", function () {
            const str = `hsla(${self.hsl_hue.value}, ${self.hsl_saturation.value}%, ${self.hsl_luminosity.value}%, ${self.hsl_alpha.value})`
            self.copyTextToClipboard(str)
        })
        return hslDisplay
    }

    createHex() {
        const hexDisplay = document.createElement("div")
        hexDisplay.classList.add("colourpicker-display-section")

        let label = document.createElement("label")
        label.for = "hex"
        label.innerHTML = "HTML:"
        hexDisplay.appendChild(label)

        this.hex = document.createElement("input")
        this.hex.name = "hex"
        this.hex.type = "text"
        this.hex.title = "This number is a hexadecimal string that can be used in HTML and CSS code. Each 2 characters is a different channel. #RRGGBBAA, where R=red, G=green, B=blue and A=alpha."
        hexDisplay.appendChild(this.hex)

        const sample = document.createElement("div")
        sample.classList.add("sample")
        hexDisplay.appendChild(sample)
        this.hex_sample = sample

        const copy = document.createElement("button")
        copy.classList.add("colourpicker-copy-button")
        copy.innerHTML = this.copyHtmlCode() + "Copy HTML"
        copy.title = "Click to copy HTML hex code e.g. #0123456"
        hexDisplay.appendChild(copy)
        const self = this
        copy.addEventListener("click", function () {
            const str = self.hex.value
            self.copyTextToClipboard(str)
        })
        return hexDisplay
    }

    createRGB() {
        const rgbDisplay = document.createElement("div")
        rgbDisplay.classList.add("colourpicker-display-section")

        const table = document.createElement("table")
        rgbDisplay.appendChild(table)

        let tr = document.createElement("tr")
        let td = document.createElement("td")

        let label = document.createElement("label")
        label.for = "red"
        label.innerHTML = "Red:"
        td.appendChild(label)
        tr.appendChild(td)

        const red = document.createElement("input")
        red.name = "red"
        red.type = "text"
        red.title = "Red is an integer value between 0 and 255."
        this.red = red

        td = document.createElement("td")
        td.appendChild(red)
        tr.appendChild(td)
        table.appendChild(tr)

        label = document.createElement("label")
        label.for = "green"
        label.innerHTML = "Green:"

        tr = document.createElement("tr")
        td = document.createElement("td")
        td.appendChild(label)
        tr.appendChild(td)

        const green = document.createElement("input")
        green.name = "green"
        green.type = "text"
        green.title = "Green is an integer value between 0 and 255."
        this.green = green

        td = document.createElement("td")
        td.appendChild(green)
        tr.appendChild(td)
        table.appendChild(tr)

        label = document.createElement("label")
        label.for = "blue"
        label.innerHTML = "Blue:"

        tr = document.createElement("tr")
        td = document.createElement("td")
        td.appendChild(label)
        tr.appendChild(td)

        const blue = document.createElement("input")
        blue.name = "blue"
        blue.type = "text"
        blue.title = "Blue is an integer value between 0 and 255."
        this.blue = blue

        td = document.createElement("td")
        td.appendChild(blue)
        tr.appendChild(td)
        table.appendChild(tr)

        label = document.createElement("label")
        label.for = "alpha"
        label.innerHTML = "Alpha:"

        tr = document.createElement("tr")
        td = document.createElement("td")
        td.appendChild(label)
        tr.appendChild(td)

        const alpha = document.createElement("input")
        alpha.name = "blue"
        alpha.type = "text"
        alpha.title = "Alpha is an integer value between 0 and 255. 0 means the colour is transparent, 255 means the colour is opaque."
        this.alpha = alpha

        td = document.createElement("td")
        td.appendChild(alpha)
        tr.appendChild(td)
        table.appendChild(tr)

        const sample = document.createElement("div")
        sample.classList.add("sample")
        rgbDisplay.appendChild(sample)
        this.rgb_sample = sample

        const copy = document.createElement("button")
        copy.classList.add("colourpicker-copy-button")
        copy.title = "Click to copy CSS rgb code e.g. rgb(10,20,30)"
        copy.innerHTML = this.copyHtmlCode() + "rgb"
        rgbDisplay.appendChild(copy)
        const self = this
        copy.addEventListener("click", function () {
            const str = `rgb(${self.red.value}, ${self.green.value}, ${self.blue.value})`
            self.copyTextToClipboard(str)
        })

        const copy2 = document.createElement("button")
        copy2.classList.add("colourpicker-copy-button")
        copy2.innerHTML = this.copyHtmlCode() + "rgba"
        copy2.title = "Click to copy CSS rgba code e.g. rgba(10,20,30,40)"
        rgbDisplay.appendChild(copy2)
        copy2.addEventListener("click", function () {
            const str = `rgba(${self.red.value}, ${self.green.value}, ${self.blue.value}, 255)`
            self.copyTextToClipboard(str)
        })

        return rgbDisplay
    }
    

    /**
     * Fill the plane with the colour variations
     * @param {int} primaryParameter 
     */
    fillColourPlane(primaryParameter, alpha = 1) {
        // Reading colours from the canvas is unstable when the alpha is not 255.
        // Not sure why this is but there appears to be rounding issues.  We
        // either get 254 out rather than the expected 255, or we get 0 for 
        // the rgb components when using getImageData.

        const step = 1.0 / this.colourPlaneSize
        const context = this.colourPlane.getContext("2d")
        context.scale(1, 1)
        const imageData = context.createImageData(this.colourPlaneSize + 1, this.colourPlaneSize + 1)

        for (let x = 0; x <= this.colourPlaneSize; x++) {
            for (let y = 0; y <= this.colourPlaneSize; y++) {
                const rgba = this.selectColourFromPlane(primaryParameter, alpha, x, y)
                let redIndex = y * ((this.colourPlaneSize + 1) * 4) + x * 4
                let greenIndex = redIndex + 1
                let blueIndex = redIndex + 2
                let alphaIndex = redIndex + 3

                imageData.data[redIndex] = Math.round(rgba.r * 255)
                imageData.data[greenIndex] = Math.round(rgba.g * 255)
                imageData.data[blueIndex] = Math.round(rgba.b * 255)
                imageData.data[alphaIndex] = Math.round(rgba.a * 255)
            }
        }
        context.putImageData(imageData, 0, 0)
        this.imageDataCopy = new ImageData(imageData.width, imageData.height)
        this.imageDataCopy.data.set(imageData.data)
    }

    selectColourFromPlane(primaryParameter, alpha, x, y) {
        // Rather than trying to read from the canvas directly we just calculate the value we want
        x = this.clamp(x, 0, this.colourPlaneSize)
        y = this.clamp(y, 0, this.colourPlaneSize)
        const step = 1.0 / this.colourPlaneSize
        const rgba = this.HSVtoRGB(primaryParameter, step * x, step * y, alpha)
        return rgba
    }

    /**
     * Find the x and y of the colour
     * @param {int} primaryParameter 
     */
    findColourOnPlane(s, l) {
        const step = 1 / this.colourPlaneSize
        for (let x = 0; x <= this.colourPlaneSize; x++) {
            for (let y = 0; y <= this.colourPlaneSize; y++) {
                const thisS = step * x
                const thisL = step * y
                // if ( y % 10 == 0 ) {
                //     console.log(`${s} ${thisS} ${l} ${thisL}`)
                // }
                // Due to rounding we will normally not get an exact value so we pick the one which is just above the value
                // we want to find.
                if (s <= thisS && l <= thisL) {
                    return [x, y]
                }
            }
        }
        return [this.colourPlaneSize, this.colourPlaneSize]
    }

    findColourOnBar(h) {
        const style = window.getComputedStyle(this.colourBar)
        const height = parseInt(style.height)
        let val = Math.floor((h / 360.0) * height)
        val = this.clamp(val, 0, 359)
        return val
    }

    findAlphaOnBar(h) {
        const style = window.getComputedStyle(this.colourBar)
        const height = parseInt(style.height)
        const val = Math.floor(h * height)
        //console.log(`findAlphaOnBar ${height} ${h} ${val}`)
        return val
    }

    selectColourFromBar(y, alpha) {
        // Rather than trying to read from the canvas directly we just calculate the value we want
        const angle = this.findColourOnBar(y)
        const rgba = this.HSVtoRGB(angle, 1, 1, alpha)
        return rgba
    }

    fillColourBar(alpha = 1) {
        const width = parseInt(this.colourBar.width)
        const height = parseInt(this.colourBar.height)
        const context = this.colourBar.getContext("2d")
        //console.log(`fillColourBar alpha=${alpha} w=${width} h=${height}`)
        // context.globalAlpha = alpha // between 0 and 1
        context.clearRect(0, 0, width, height)
        for (let ii = 0; ii < 360; ii++) {
            const endY = (ii) * 1
            const rgba = this.HSVtoRGB(ii, 1, 1, alpha)
            context.fillStyle = `rgba(${rgba.r * 255},${rgba.g * 255},${rgba.b * 255}, ${rgba.a})`
            // top-left: x, y, w, h
            context.fillRect(0, endY, width, 1)
        }
    }

    fillAlphaBar() {
        const context = this.alphaBar.getContext("2d")
        const width = parseInt(this.alphaBar.width)
        const height = parseInt(this.alphaBar.height)
        for (let ii = 0; ii < height; ii++) {
            const endY = ii * 1
            const rgb = this.HSVtoRGB(0, 0, ii / height) // we want from black (opaque) to white (transparent)
            context.fillStyle = `rgb(${rgb.r * 255},${rgb.g * 255},${rgb.b * 255})`
            // top-left: x, y, w, h
            context.fillRect(0, endY, width, 1)
        }
    }

    drawCircleOnCanvas(x, y) {
        // x and y should be in the canvas coordinates
        const context = this.colourPlane.getContext("2d")
        context.strokeStyle = "#FFFFFF"
        context.lineWidth = 2;
        context.beginPath()
        // center (x,y), radius, start and end angle
        const radius = 5
        context.save()
        context.arc(this.clamp(x, 0, this.colourPlane.width - 1), this.clamp(y, 0, this.colourPlane.height - 1), radius, 0, 2 * Math.PI)
        context.stroke()
        context.restore()
    }



    getMousePosition(e, canvas = null) {
        let rect = null
        let scaleX = 1
        let scaleY = 1
        let x, y
        if (typeof (canvas) === "undefined" || canvas === null) {
            // console.log("getMousePosition canvas: undefined/null")
            if (e.target) {
                rect = e.target.getBoundingClientRect()
            } else {
                rect = { left: 0, top: 0, width: 0, height: 0 }
            }
            x = this.clamp((e.clientX - rect.left), 0, rect.width)
            y = this.clamp((e.clientY - rect.top), 0, rect.height)

        } else {
            // console.log("getMousePosition canvas: valid")
            rect = canvas.getBoundingClientRect()
            scaleX = canvas.width / rect.width
            scaleY = canvas.height / rect.height
            x = this.clamp((e.clientX - rect.left) * scaleX, 0, canvas.width)
            y = this.clamp((e.clientY - rect.top) * scaleY, 0, canvas.height)
        }
        const pos = {
            x: x,
            y: y,
            scaleX: scaleX,
            scaleY: scaleY,
            clientX: e.clientX,
            clientY: e.clientY,
            localX: this.clamp(e.clientX - rect.left, 0, rect.width),
            localY: this.clamp(e.clientY - rect.top, 0, rect.height)
        }
        return pos
    }

    selectAlphaFromBar(pos) {
        const containerStyle = window.getComputedStyle(this.alphaBarContainer)
        const containerHeight = parseInt(containerStyle.height)
        return 1 - (pos.localY / containerHeight)
    }


    reportColour(rgba) {
        // console.log(`reportColour r:${rgba.r} g:${rgba.g} b:${rgba.b} a:${rgba.a}`)
        this.hex.value = this.RGBtoHex(rgba)
        this.hex_sample.style.backgroundColor = this.hex.value

        this.red.value = rgba.r
        this.green.value = rgba.g
        this.blue.value = rgba.b
        this.alpha.value = rgba.a
        this.rgb_sample.style.backgroundColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a/255})`

        const hsl = this.RGBtoHSL(rgba.r, rgba.g, rgba.b, rgba.a)
        // console.log(`reportColour(rgb2hsl) h: ${hsl.h} s:${hsl.s} l:${hsl.l} a:${hsl.a}`)
        this.hsl_hue.value = Math.round(hsl.h * 360)                            // angle in degrees
        this.hsl_saturation.value = Math.round(hsl.s * Math.pow(10, 3)) / 10     // %
        this.hsl_luminosity.value = Math.round(hsl.l * Math.pow(10, 3)) / 10     // %
        this.hsl_alpha.value = Math.round(hsl.a * Math.pow(10, 3)) / Math.pow(10, 3)
        this.hsl_sample.style.backgroundColor = `hsla(${this.hsl_hue.value}, ${this.hsl_saturation.value}%, ${this.hsl_luminosity.value}%, ${this.hsl_alpha.value})`
    }

    setColourBarPincers(y) {
        const triangleStyle = window.getComputedStyle(this.colourLeftPincer)
        const arrowHeight = parseInt(triangleStyle.borderTopWidth)
        const containerStyle = window.getComputedStyle(this.colourBarContainer)
        const topmostPoint = (parseInt(containerStyle.top) - arrowHeight / 2)
        const bottommostPoint = (parseInt(containerStyle.height) - arrowHeight / 2)
        this.colourRightPincer.style.left = "0px"
        this.colourLeftPincer.style.left = parseInt(containerStyle.left) + parseInt(containerStyle.width) - arrowHeight + "px"

        if (typeof (y) === "undefined") {
            this.colourRightPincer.style.top = topmostPoint + "px"
            this.colourLeftPincer.style.top = topmostPoint + "px"
        } else {
            this.colourRightPincer.style.top = Math.min(bottommostPoint, Math.max(topmostPoint, y - arrowHeight / 2)) + "px"
            this.colourLeftPincer.style.top = Math.min(bottommostPoint, Math.max(topmostPoint, y - arrowHeight / 2)) + "px"
        }
    }

    setAlphaBarPincers(y) {
        const triangleStyle = window.getComputedStyle(this.alphaLeftPincer)
        const arrowHeight = parseInt(triangleStyle.borderTopWidth)
        const containerStyle = window.getComputedStyle(this.alphaBarContainer)
        const topmostPoint = (parseInt(containerStyle.top) - arrowHeight / 2)
        const bottommostPoint = (parseInt(containerStyle.height) - arrowHeight / 2)
        this.alphaRightPincer.style.left = "0px"
        this.alphaLeftPincer.style.left = parseInt(containerStyle.left) + parseInt(containerStyle.width) - arrowHeight + "px"

        if (typeof (y) === "undefined") {
            this.alphaRightPincer.style.top = topmostPoint + "px"
            this.alphaLeftPincer.style.top = topmostPoint + "px"
        } else {
            this.alphaRightPincer.style.top = Math.min(bottommostPoint, Math.max(topmostPoint, y - arrowHeight / 2)) + "px"
            this.alphaLeftPincer.style.top = Math.min(bottommostPoint, Math.max(topmostPoint, y - arrowHeight / 2)) + "px"
        }
    }


    update() {
        const alpha = this.selectAlphaFromBar(this.lastAlphaBarMousePosition)
        const rgb = this.selectColourFromBar(this.lastColourBarMousePosition.y, alpha)
        console.log(`update ${rgb.r} ${rgb.g} ${rgb.b}`)
        this.selectedParameter = this.RGBtoHSV(rgb.r, rgb.g, rgb.b, alpha)
        this.fillColourBar(this.selectedParameter.a)
        this.fillColourPlane(this.selectedParameter.h, this.selectedParameter.a)
        this.setColourBarPincers(this.lastColourBarMousePosition.localY)
        this.setAlphaBarPincers(this.lastAlphaBarMousePosition.localY)
        this.drawCircleOnCanvas(this.lastPlaneMousePosition.x, this.lastPlaneMousePosition.y)
        this.selectedColour = this.selectColourFromPlane(this.selectedParameter.h, alpha, this.lastPlaneMousePosition.x, this.lastPlaneMousePosition.y)
        this.reportColour(this.selectedColour)
    }

    updateQuickSelection() {
        // If the user is just moving the cursor around the colour plane canvas then we 
        // don't need to regenerate it, we just push a copy back in to the context and
        // add the new circle.
        this.colourPlane.getContext("2d").putImageData(this.imageDataCopy, 0, 0);
        this.drawCircleOnCanvas(this.lastPlaneMousePosition.x, this.lastPlaneMousePosition.y)
        this.selectedColour = this.selectColourFromPlane(this.selectedParameter.h, this.selectedParameter.a, this.lastPlaneMousePosition.x, this.lastPlaneMousePosition.y)
        this.reportColour(this.selectedColour)
    }

    setHexColour(hex) {
        this.selectedColour = this.HEXtoRGB(hex)
        this.selectedParameter = this.RGBtoHSV(this.selectedColour.r, this.selectedColour.g, this.selectedColour.b)
        // need to find where the S-L pair is on the plane
        // need to find where the H value is on the vertical
        const y = this.findColourOnBar(this.selectedParameter.h)
        const p = this.findColourOnPlane(this.selectedParameter.s, this.selectedParameter.v)
        this.lastPlaneMousePosition.x = p[0]
        this.lastPlaneMousePosition.y = p[1]
        this.lastColourBarMousePosition.localY = y
        this.update()
    }

    setHslColour(h, s, l) {
        if (typeof (h) === "object") {
            l = h.l
            s = h.s
            h = h.h
        }
        const hsv = this.HSLtoHSV(h, s, l)
        this.selectedColour = this.HSVtoRGB(hsv.h, hsv.s, hsv.v)
        this.selectedParameter = hsv
        // need to find where the S-L pair is on the plane
        // need to find where the H value is on the vertical
        const y = this.findColourOnBar(this.selectedParameter.h)
        const p = this.findColourOnPlane(this.selectedParameter.s, this.selectedParameter.v)
        this.lastPlaneMousePosition.x = p[0]
        this.lastPlaneMousePosition.y = p[1]
        this.lastColourBarMousePosition.localY = y
        this.update()
    }

    onHslChange() {
        let h = this.hsl_hue.value
        let s = this.hsl_saturation.value
        let l = this.hsl_luminosity.value
        h = parseInt(h)
        if (isNaN(h)) {
            this.hsl_hue.style.backgroundColor = "#ff0066"
            return
        }
        s = parseInt(s)
        if (isNaN(s)) {
            this.hsl_saturation.style.backgroundColor = "#ff0066"
            return
        }
        l = parseInt(l)
        if (isNaN(l)) {
            this.hsl_luminosity.style.backgroundColor = "#ff0066"
            return
        }
        this.hsl_hue.style.backgroundColor = null
        this.hsl_saturation.style.backgroundColor = null
        this.hsl_luminosity.style.backgroundColor = null
        this.setHslColour(h / 360, s / 100, l / 100)
    }

    draw() {
        this.element.classList.add("colourpicker")

        this.hexDisplay = this.createHex()
        this.hslDisplay = this.createHSL()
        this.rgbDisplay = this.createRGB()

        const topContainer = document.createElement("div")
        topContainer.classList.add("top-container")

        this.colourPlane = document.createElement("canvas")
        this.colourPlane.classList.add("colourpicker-colourplane")
        this.colourPlane.tabIndex = 0

        this.colourBar = document.createElement("canvas")
        this.colourBar.classList.add("colourpicker-colourbar")
        this.colourBar.tabIndex = 0

        this.alphaBar = document.createElement("canvas")
        this.alphaBar.classList.add("colourpicker-alphabar")
        this.alphaBar.tabIndex = 0

        const colourPlaneContainer = document.createElement("div")
        this.colourPlaneContainer = colourPlaneContainer
        colourPlaneContainer.classList.add("colourplane-container")
        colourPlaneContainer.classList.add("colourpicker-colourplane-container")
        colourPlaneContainer.appendChild(this.colourPlane)
        topContainer.appendChild(colourPlaneContainer)

        const luminosityContainer = document.createElement("div")
        this.colourBarContainer = luminosityContainer
        luminosityContainer.classList.add("colourplane-container")
        luminosityContainer.classList.add("colourpicker-colourbar-container")
        luminosityContainer.appendChild(this.colourBar)
        topContainer.appendChild(luminosityContainer)

        const alphaBarContainer = document.createElement("div")
        this.alphaBarContainer = alphaBarContainer
        alphaBarContainer.classList.add("colourplane-container")
        alphaBarContainer.classList.add("colourpicker-alphabar-container")
        alphaBarContainer.appendChild(this.alphaBar)
        topContainer.appendChild(alphaBarContainer)


        this.colourLeftPincer = document.createElement("div")
        this.colourLeftPincer.classList.add("pointer")
        this.colourLeftPincer.classList.add("arrow-left")
        luminosityContainer.append(this.colourLeftPincer)

        this.colourRightPincer = document.createElement("div")
        this.colourRightPincer.classList.add("pointer")
        this.colourRightPincer.classList.add("arrow-right")
        luminosityContainer.append(this.colourRightPincer)


        this.alphaLeftPincer = document.createElement("div")
        this.alphaLeftPincer.classList.add("pointer")
        this.alphaLeftPincer.classList.add("arrow-left")
        alphaBarContainer.append(this.alphaLeftPincer)

        this.alphaRightPincer = document.createElement("div")
        this.alphaRightPincer.classList.add("pointer")
        this.alphaRightPincer.classList.add("arrow-right")
        alphaBarContainer.append(this.alphaRightPincer)

        this.element.appendChild(topContainer)



        const displayContainer = document.createElement("div")
        displayContainer.classList.add("colourpicker-display")
        displayContainer.appendChild(this.hexDisplay)
        displayContainer.appendChild(this.hslDisplay)
        displayContainer.appendChild(this.rgbDisplay)
        this.element.appendChild(displayContainer)

        const buttonbar = document.createElement("div")
        buttonbar.classList.add("buttonbar")
        this.element.appendChild(buttonbar)
        const cancelBtn = document.createElement("button")
        cancelBtn.innerText = "Cancel"
        buttonbar.appendChild(cancelBtn)
        const okBtn = document.createElement("button")
        okBtn.innerText = "OK"
        buttonbar.appendChild(okBtn)

        const self = this
        cancelBtn.addEventListener("click", function (e) {
            self.element.classList.add("hide")
        })
        okBtn.addEventListener("click", function (e) {
            self.element.classList.add("hide")
        })
        this.colourPlane.addEventListener("click", function (e) {
            const pos = self.getMousePosition(e, self.colourPlane)
            self.lastPlaneMousePosition = pos
            self.updateQuickSelection()
        })
        this.colourPlane.addEventListener("mousedown", function (e) {
            // console.log(`mousedown: ${e.button}`)
            self.colourPlaneLeftButtonPressed = true
        })
        this.colourPlane.addEventListener("mousemove", function (e) {
            if (self.colourPlaneLeftButtonPressed) {
                // console.log(`mousemove: ${e.button}`)
                const pos = self.getMousePosition(e, self.colourPlane)
                self.lastPlaneMousePosition = pos
                self.updateQuickSelection()
                e.stopPropagation()
            }
        })
        document.addEventListener("mousemove", function (e) {
            if (self.colourPlaneLeftButtonPressed) {
                // console.log(`document.mousemove: ${e.button} ${self.colourPlaneLeftButtonPressed}`)
                const pos = self.getMousePosition(e, self.colourPlane)
                self.lastPlaneMousePosition = pos
                self.updateQuickSelection()
            }
            if (self.colourBarLeftButtonPressed) {
                const pos = self.getMousePosition(e, self.colourBar)
                self.lastColourBarMousePosition = pos
                self.update()
            }
            if (self.alphaBarLeftButtonPressed) {
                const pos = self.getMousePosition(e, self.alphaBar)
                self.lastAlphaBarMousePosition = pos
                self.update()
            }
        })
        this.colourPlane.addEventListener("mouseup", function (e) {
            // console.log(`mouseup: ${e.button}`)
            self.colourPlaneLeftButtonPressed = false
        })
        document.addEventListener("mouseup", function (e) {
            // console.log(`document.mouseup: ${e.button}`)
            self.colourPlaneLeftButtonPressed = false
            self.colourBarLeftButtonPressed = false
            self.alphaBarLeftButtonPressed = false
        })
        this.colourPlane.addEventListener("mouseenter", function (e) {

        })
        this.colourPlane.addEventListener("mouseleave", function (e) {

        })

        this.colourPlane.addEventListener("focus", function (e) {
            self.colourPlaneContainer.classList.add("hasFocus")
        })
        this.colourPlane.addEventListener("blur", function (e) {
            self.colourPlaneContainer.classList.remove("hasFocus")
        })

        this.colourPlane.addEventListener("keydown", function (e) {
            // console.log(`alphabar::keydown ${e.key}`)
            const style = window.getComputedStyle(self.colourPlane)
            let pos
            if (e.key == 'ArrowUp') {
                pos = self.lastPlaneMousePosition
                pos.y = self.clamp(pos.y - 1, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY - 1, 0, parseInt(style.height))
                self.lastPlaneMousePosition = pos
                self.update()
            }
            if (e.key == 'ArrowDown') {
                pos = self.lastPlaneMousePosition
                pos.y = self.clamp(pos.y + 1, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY + 1, 0, parseInt(style.height))
                self.lastPlaneMousePosition = pos
                self.update()
            }
            if (e.key == 'ArrowLeft') {
                pos = self.lastPlaneMousePosition
                pos.x = self.clamp(pos.x - 1, 0, parseInt(style.width))
                pos.localX = self.clamp(pos.localX - 1, 0, parseInt(style.width))
                self.lastPlaneMousePosition = pos
                self.update()
            }
            if (e.key == 'ArrowRight') {
                pos = self.lastPlaneMousePosition
                pos.x = self.clamp(pos.x + 1, 0, parseInt(style.width))
                pos.localX = self.clamp(pos.localX + 1, 0, parseInt(style.width))
                self.lastPlaneMousePosition = pos
                self.update()
            }

            if ( e.key == 'PageUp' || (e.shiftKey && e.key == 'ArrowUp') ) {
                pos = self.lastPlaneMousePosition
                pos.y = self.clamp(pos.y - 30, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY - 30, 0, parseInt(style.height))
                self.lastPlaneMousePosition = pos
                self.update()
            }
            if ( e.key == 'PageDown' || (e.shiftKey && e.key == 'ArrowDown') ) {
                pos = self.lastPlaneMousePosition
                pos.y = self.clamp(pos.y + 30, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY + 30, 0, parseInt(style.height))
                self.lastPlaneMousePosition = pos
                self.update()
            }
            if ( e.key == 'Home' || (e.shiftKey && e.key == 'ArrowLeft')) {
                pos = self.lastPlaneMousePosition
                pos.x = self.clamp(pos.x - 30, 0, parseInt(style.width))
                pos.localX = self.clamp(pos.localX - 30, 0, parseInt(style.width))
                self.lastPlaneMousePosition = pos
                self.update()
            }
            if ( e.key == 'End' || (e.shiftKey && e.key == 'ArrowRight')) {
                pos = self.lastPlaneMousePosition
                pos.x = self.clamp(pos.x + 30, 0, parseInt(style.width))
                pos.localX = self.clamp(pos.localX + 30, 0, parseInt(style.width))
                self.lastPlaneMousePosition = pos
                self.update()
            }
        })



        this.colourBar.addEventListener("mousedown", function (e) {
            // console.log(`mousedown: ${e.button}`)
            self.colourBarLeftButtonPressed = true
        })
        this.colourBar.addEventListener("click", function (e) {
            const pos = self.getMousePosition(e, this.colourBar)
            self.lastColourBarMousePosition = pos
            self.update()
        })

        this.colourBar.addEventListener("mousemove", function (e) {
            if (self.colourBarLeftButtonPressed) {
                const pos = self.getMousePosition(e, this.colourBar)
                self.lastColourBarMousePosition = pos
                self.update()
                e.stopPropagation()
            }
        })
        this.colourBar.addEventListener("mouseup", function (e) {
            // console.log(`mouseup: ${e.button}`)
            self.colourBarLeftButtonPressed = false
        })

        this.colourBar.addEventListener("focus", function (e) {
            self.colourBarContainer.classList.add("hasFocus")
        })
        this.colourBar.addEventListener("blur", function (e) {
            self.colourBarContainer.classList.remove("hasFocus")
        })

        this.colourBar.addEventListener("keydown", function (e) {
            // console.log(`alphabar::keydown ${e.key}`)
            const style = window.getComputedStyle(self.colourBar)
            let pos
            if (e.key == 'ArrowUp') {
                pos = self.lastColourBarMousePosition
                pos.y = self.clamp(pos.y - 1, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY - 1, 0, parseInt(style.height))
                self.lastColourBarMousePosition = pos
                self.update()
            }
            if (e.key == 'ArrowDown') {
                pos = self.lastColourBarMousePosition
                pos.y = self.clamp(pos.y + 1, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY + 1, 0, parseInt(style.height))
                self.lastColourBarMousePosition = pos
                self.update()
            }
            if ( e.key == 'PageUp' || (e.shiftKey && e.key == 'ArrowUp')) {
                pos = self.lastColourBarMousePosition
                pos.y = self.clamp(pos.y - 30, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY - 30, 0, parseInt(style.height))
                self.lastColourBarMousePosition = pos
                self.update()
            }
            if ( e.key == 'PageDown' || (e.shiftKey && e.key == 'ArrowDown')) {
                pos = self.lastColourBarMousePosition
                pos.y = self.clamp(pos.y + 30, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY + 30, 0, parseInt(style.height))
                self.lastColourBarMousePosition = pos
                self.update()
            }
        })


        this.alphaBar.addEventListener("mousedown", function (e) {
            // console.log(`mousedown: ${e.button}`)
            self.alphaBarLeftButtonPressed = true
        })
        this.alphaBar.addEventListener("click", function (e) {
            const pos = self.getMousePosition(e, this.alphaBar)
            self.lastAlphaBarMousePosition = pos
            self.update()
        })

        this.alphaBar.addEventListener("mousemove", function (e) {
            if (self.alphaBarLeftButtonPressed) {
                const pos = self.getMousePosition(e, this.alphaBar)
                self.lastAlphaBarMousePosition = pos
                self.update()
                e.stopPropagation()
            }
        })
        this.alphaBar.addEventListener("mouseup", function (e) {
            // console.log(`mouseup: ${e.button}`)
            self.alphaBarLeftButtonPressed = false
        })
        this.alphaBar.addEventListener("focus", function (e) {
            self.alphaBarContainer.classList.add("hasFocus")
        })
        this.alphaBar.addEventListener("blur", function (e) {
            self.alphaBarContainer.classList.remove("hasFocus")
        })

        this.alphaBar.addEventListener("keydown", function (e) {
            // console.log(`alphabar::keydown ${e.key}`)
            let pos
            if (e.key == 'ArrowUp') {
                pos = self.lastAlphaBarMousePosition
                pos.y = self.clamp(pos.y - 1, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY - 1, 0, parseInt(style.height))
                self.lastAlphaBarMousePosition = pos
                self.update()
            }
            if (e.key == 'ArrowDown') {
                pos = self.lastAlphaBarMousePosition
                pos.y = self.clamp(pos.y + 1, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY + 1, 0, parseInt(style.height))
                self.lastAlphaBarMousePosition = pos
                self.update()
            }
            if ( e.key == 'PageUp' || (e.shiftKey && e.key == 'ArrowUp')) {
                pos = self.lastAlphaBarMousePosition
                const style = window.getComputedStyle(self.alphaBar)
                pos.y = self.clamp(pos.y - 30, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY - 30, 0, parseInt(style.height))
                self.lastAlphaBarMousePosition = pos
                self.update()
            }
            if ( e.key == 'PageDown' || (e.shiftKey && e.key == 'ArrowDown')) {
                pos = self.lastAlphaBarMousePosition
                const style = window.getComputedStyle(self.alphaBar)
                pos.y = self.clamp(pos.y + 30, 0, parseInt(style.height))
                pos.localY = self.clamp(pos.localY + 30, 0, parseInt(style.height))
                self.lastAlphaBarMousePosition = pos
                self.update()
            }
        })

        this.hex.addEventListener("change", function (e) {
            const value = self.hex.value
            const regex1 = new RegExp("^#?[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]{0,5}$")
            self.hex.style.backgroundColor = null
            if (regex1.test(value)) {
                self.setHexColour(value)
            } else {
                self.hex.style.backgroundColor = "#ff0066"
            }
        })

        this.hsl_hue.addEventListener("change", function (e) {
            self.onHslChange()
        })
        this.hsl_saturation.addEventListener("change", function (e) {
            self.onHslChange()
        })
        this.hsl_luminosity.addEventListener("change", function (e) {
            self.onHslChange()
        })



        this.colourPlane.width = this.colourPlaneSize + 1
        this.colourPlane.height = this.colourPlaneSize + 1

        const style = window.getComputedStyle(this.colourBar)
        this.colourBar.width = parseInt(style.width)    // default: 72
        this.colourBar.height = parseInt(style.height)  // default: 360, 1 line per colour band

        const colourPlaneStyle = window.getComputedStyle(this.colourPlane)
        this.lastPlaneMousePosition = {
            x: this.colourPlane.width / 2,
            y: this.colourPlane.height / 2,
            localX: parseInt(colourPlaneStyle.width) / 2,
            localY: parseInt(colourPlaneStyle.height) / 2,
        }
        const colourBarStyle = window.getComputedStyle(this.colourBar)
        this.lastColourBarMousePosition = {
            x: this.colourBar.width / 2,
            y: this.colourBar.height / 2,
            localX: parseInt(colourBarStyle.width) / 2,
            localY: parseInt(colourBarStyle.height) / 2
        }
        const alphaBarStyle = window.getComputedStyle(this.colourBar)
        this.lastAlphaBarMousePosition = {
            x: this.alphaBar.width / 2,
            y: 0,
            localX: parseInt(alphaBarStyle.width) / 2,
            localY: 0
        }

        this.fillAlphaBar()
        const alpha = this.selectAlphaFromBar(this.lastAlphaBarMousePosition)
        this.fillColourBar(alpha)
        this.update()
    }

    getSelectedColour() {
        return this.selectedColour
    }

    //
    // Internal functions that are kept with this component so we can use it independently
    //

    clamp(value, min, max, missing) {
        if (typeof (value) === "undefined") {
            if (typeof (missing) === "undefined") {
                missing = min
            }
            return missing
        }
        return Math.min(max, Math.max(value, min))
    }

    // The following 2 functions are from https://www.cs.rit.edu/~ncs/color/t_convert.html

    // r,g,b values are from 0 to 1
    // h = [0,360], s = [0,1], v = [0,1]
    //		if s == 0, then h = -1 (undefined)
    // a in [0,1] where 0 is transparent and 1 is opaque
    RGBtoHSV(r, g, b, a = 1) {
        let h = 0, s = 0, v = 0;
        let min, max, delta = 0;

        min = Math.min(r, g, b);
        max = Math.max(r, g, b);
        v = max;
        delta = max - min;
        if (max != 0) {
            s = delta / max;
        } else {
            // r = g = b = 0
            // s = 0, v is undefined
            return {
                h: h,
                s: 0,
                v: null,
                a: a
            };
        }

        if (delta === 0) {
            h = 0
        } else {
            if (r == max)
                h = (g - b) / delta;		// between yellow & magenta
            else if (g == max)
                h = 2 + (b - r) / delta;	// between cyan & yellow
            else
                h = 4 + (r - g) / delta;	// between magenta & cyan
        }

        h *= 60;				// degrees
        if (h < 0) {
            h += 360;
        }

        return {
            h: h,
            s: s,
            v: v,
            a: a
        }
    }

    HSVtoRGB(h, s, v, a = 1) {
        if ( h === 360 ) {
            console.log(`HSVtoRGB ${h} ${s} ${v}`)
        }
        let r, g, b;              // float
        let i;                  // integer
        let f, p, q, t;         // float

        if (s == 0) {
            // achromatic (grey)
            r = g = b = v;
            return {
                r: r,
                g: g,
                b: b,
                a: a
            };
        }

        h /= 60;			// sector 0 to 5
        i = Math.floor(h);
        f = h - i;			// factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));

        switch (i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 6:         // added in for when we pass 360
                r = v;
                g = p;
                b = 0;
                break;
            default:		// case 5:
                r = v;
                g = p;
                b = q;
                break;
        }
        return {
            r: r,
            g: g,
            b: b,
            a: a
        }
    }

    /**
         * Converts an RGB color value to HSL. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
         * Assumes r, g, and b are contained in the set [0, 255] and
         * returns h, s, and l in the set [0, 1].
         * https://gist.github.com/mjackson/5311256
         *
         * @param   Number  r       The red color value
         * @param   Number  g       The green color value
         * @param   Number  b       The blue color value
         * @param   Number  a       The alpha channel value [0,255]
         * @return  Array           The HSL representation
         */
    RGBtoHSL(r, g, b, a = 255) {
        console.log(`RGB2HSL ${r} ${g} ${b}`)
        r /= 255, g /= 255, b /= 255, a /= 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return {
            h: h,
            s: s,
            l: l,
            a: a
        }
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 1].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Object}           The RGB representation
     */
    HSLtoRGB(h, s, l, a = 1) {
        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: r,
            g: g,
            b: b,
            a: a
        }
    }

    RGBtoHex(rgba) {
        rgba.r *= 255
        rgba.g *= 255
        rgba.b *= 255
        rgba.a *= 255
        rgba.r = Math.round(rgba.r)
        rgba.g = Math.round(rgba.g)
        rgba.b = Math.round(rgba.b)
        rgba.a = Math.round(rgba.a)
        let str = "#"
        if (rgba.r < 16) {
            str += "0" + rgba.r.toString(16)
        } else {
            str += Number(rgba.r).toString(16)
        }
        if (rgba.g < 16) {
            str += "0" + rgba.g.toString(16)
        } else {
            str += Number(rgba.g).toString(16)
        }
        if (rgba.b < 16) {
            str += "0" + rgba.b.toString(16)
        } else {
            str += Number(rgba.b).toString(16)
        }
        if (rgba.a < 16) {
            str += "0" + rgba.a.toString(16)
        } else {
            str += Number(rgba.a).toString(16)
        }
        return str.toUpperCase()
    }

    HEXtoRGB(hex) {
        // return an object of r,g,b,a between 0,1
        if (hex.substring(0, 1) == "#") {
            hex = hex.substring(1)
        }
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        let a = 1
        if (hex.length == 8) {
            a = parseInt(hex.substring(6, 8), 16) / 255
        }
        return {
            r: r / 255,
            g: g / 255,
            b: b / 255,
            a: a
        }
    }

    HSLtoHSV(h, s, l, a = 1) {
        if (typeof (h) === "object") {
            l = h.l
            s = h.s
            h = h.h
            a = h.a
        }
        const rgb = this.HSLtoRGB(h, s, l, a)
        const hsv = this.RGBtoHSV(rgb.r, rgb.g, rgb.b, rgb.a)
        return hsv
    }

    round(num, decimals) {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
    }

    copyHtmlCode() {
        return `<span style="font-size: .875em; margin-right: .125em; position: relative; top: -.25em; left: -.125em">📄\
            <span style="position: absolute; top: .25em; left: .25em">📄</span>\
            </span>`
    }

    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    fallbackCopyTextToClipboard(text) {
        let textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            let successful = document.execCommand('copy');
            let msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    copyTextToClipboard(text) {
        if (!navigator.clipboard) {
            this.fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(function () {
            alert(`The text '${text}' was copied to your clipboard.`)
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }
}