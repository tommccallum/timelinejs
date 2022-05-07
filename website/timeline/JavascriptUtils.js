// Ease of use functions

function isValueAvailable(x) {
    return typeof(x) !== "undefined" && x !== null
}

function isValueUnavailable(x) {
    return !isValueAvailable(x)
}

