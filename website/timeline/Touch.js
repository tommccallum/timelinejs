// https://www.stucox.com/blog/you-cant-detect-a-touchscreen/
// Do not use screensize as there are tablets and laptops that will get the wrong option.
// Check for the touch event (used by Modernizer) worked except for Chrome 24 which shipped with Touch always on.
function isTouchAvailable() {
    // check for the ontouchstart even in window
    return 'ontouchstart' in window || navigator.maxTouchPoints;
}