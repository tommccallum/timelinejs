class TimePoint {
    // This allows us as a user to easily define a date e.g. 1000AD and compare it against 1200BC

    constructor(str=null) {
        this.value = 0
        this.units = "AD"
        this.relativeValue = 0
        if ( typeof(str) === "string") {
            this.parse(str)
        }
        if ( typeof(str) ===  "number" ) {
            if ( str < 0 ) {
                this.units = "BC"
            } else {
                this.units = "AD"
            }
            this.relativeValue = str
            this.value = Math.abs(str)
        }
    }

    copy() {
        const t = new TimePoint()
        t.value = this.value
        t.units = this.units
        t.relativeValue = this.relativeValue
        return t
    }

    add(value) {
        if ( this.units == "BC" ) {
            this.value -= value
        } else {
            this.value += value
        }
        this.relativeValue += value
        if ( this.units == "AD" ) {
            if ( this.relativeValue < 0 ) {
                this.units = "BC"
                this.value = Math.abs(this.relativeValue)
            }
        } else if ( this.units == "BC") {
            if ( this.relativeValue >= 0 ) {
                this.units = "AD"
                this.value = Math.abs(this.relativeValue)
            }
        }
        return this
    }

    isEqual(pt) {
        return this.value == pt.value && this.unit == pt.unit
    }

    isGreater(pt) {
        return this.relativeValue > pt.relativeValue
    }

    isLess(pt) {
        return this.relativeValue < pt.relativeValue
    }

    isGreaterOrEqual(pt) {
        return this.relativeValue > pt.relativeValue || this.isEqual(pt)
    }

    isLessOrEqual(pt) {
        return this.relativeValue < pt.relativeValue || this.isEqual(pt)
    }

    isBefore(pt) {
        return this.isLess(pt)
    }

    isAfter(pt) {
        return this.isGreater(pt)
    }

    getThisYear() {
        return (new Date()).getYear() + 1900
    }

    parse(str) {
        if ( str === null ) return
        if ( typeof(str) === "undefined" ) return
        if ( str.trim().length == 0 ) return
        if ( str.trim().toLowerCase() === "today" ) {
            str = this.getThisYear() + "AD"
        }
        const units = str.substr(str.length-2, 2)
        if ( units.toUpperCase() == "AD") {
            this.value = parseInt(str.substr(0, str.length-2))
            this.relativeValue = this.value
            this.units = "AD"
        } else if ( units.toUpperCase() == "BC") {
            this.value = parseInt(str.substr(0, str.length-2))
            this.units = "BC"
            this.relativeValue = -this.value
        } else {
            this.value = parseInt(str)
            this.relativeValue = this.value
            if (this.value > 0 && this.value < this.getThisYear() ) {
                this.units = "AD"
            } else {
                this.relativeValue = -this.value
                this.units = "BC"
            }
        }
    }

    toString() {
        let value = Math.round(this.value,0)
        if ( value >= 1000000000 ) {
            value = (value / 1000000000).toLocaleString() + " billion"
        } else if ( value >= 1000000 ) {
            value = (value / 1000000).toLocaleString() + " million"
        } else if ( value >= 10000) {
            value = value.toLocaleString()
        }
        return value + " " + this.units
    }
}