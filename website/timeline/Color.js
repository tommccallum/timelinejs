// https://www.sitepoint.com/javascript-generate-lighter-darker-color/
// Examples
// ColorLuminance("#69c", 0);		// returns "#6699cc"
// ColorLuminance("6699CC", 0.2);	// "#7ab8f5" - 20% lighter
// ColorLuminance("69C", -0.5);	// "#334d66" - 50% darker
// ColorLuminance("000", 1);		// "#000000" - true black cannot be made lighter!
function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length == 3) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
    if ( hex.length != 6 ) {
        throw `hex value is not 6 characters (${hex})`
    }
	lum = lum || 0;

	// convert to decimal and change luminosity
	let rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substring(c.length);
	}

	return rgb;
}

function shades(start, n) {
    result = Array(n)
    for( let ii=0; ii < n; ii ++) {
        result[ii] = ColorLuminance(start, ii/n)
    }
    return result
}

if ( false ) {
console.log(ColorLuminance("#69c",0))
console.log(ColorLuminance("#69c",0.2))
console.log(ColorLuminance("#69c",-0.5))
console.log(ColorLuminance("#69c",1))
console.log(ColorLuminance("#000",1))
console.log(ColorLuminance("#000",0))
console.log(shades("#905030", 10))
}

function GColor(r,g,b) {
    r = (typeof r === 'undefined')?0:r;
    g = (typeof g === 'undefined')?0:g;
    b = (typeof b === 'undefined')?0:b;
    return {r:r, g:g, b:b};
};

function GColorHex(hex) {
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length == 3) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	let r = parseInt(hex.substr(0*2,2), 16);
	let g = parseInt(hex.substr(1*2,2), 16);
	let b = parseInt(hex.substr(2*2,2), 16);
	return {r:r,g:g,b:b}
}

function doubleDigitHex(x) {
	// ensures the hex value will have a leading zero
	return ("00"+x).substring(x.length)
}


function GColor2Hex(gcolor) {
	return '#' + doubleDigitHex(gcolor.r.toString(16)) + doubleDigitHex(gcolor.g.toString(16)) + doubleDigitHex(gcolor.b.toString(16))
}
function createColorRange(n) {
	// splices together a set of colours from an array of individual steps
	// the palette will always be included and we splice in shades until we 
	// have the number we actually want
	//let palette = [ '#5534A5','#A85CF9','#4B7BE5', '#6FDFDF']
	let palette = [ '#001E6C', '#035397', '#E8630A', '#FCD900']
	if ( n <= 4 ) {
		return palette
	}

    let colorList = [...palette], tmpColor;
	let m = Math.ceil(n/palette.length)
	let spliceIndex = 1
	for( let j=1; j < palette.length; j++ ) {
		let c1 = GColorHex(palette[j-1])
		let c2 = GColorHex(palette[j])
		for (let i=1; i<m; i++) {
			tmpColor = new GColor();
			tmpColor.r = Math.round(Math.min(255,Math.max(0,c1.r + ((i*(c2.r-c1.r))/m))));
			tmpColor.g = Math.round(Math.min(255,Math.max(0,c1.g + ((i*(c2.g-c1.g))/m))));
			tmpColor.b = Math.round(Math.min(255,Math.max(0,c1.b + ((i*(c2.b-c1.b))/m))));
			colorList.splice(spliceIndex, 0, GColor2Hex(tmpColor));
			spliceIndex++
			if (colorList.length == n) {
			 break
			}
		}
		if (colorList.length == n) {
			break
		}
		spliceIndex++
	}
	return colorList;
};

// console.log(GColor2Hex(GColor(8,8,8)))
// console.log(GColor2Hex(GColorHex('#095bab')))
// console.log(createColorRange(GColorHex('#095bab'), GColorHex('#b8ebf1'), 10))
