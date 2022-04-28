function convertTextToHTML(text) {
    const blocks = text.split(/\n\n/)
    let html = ""
    for ( let b of blocks ) {
        html += `<p>${b.trim()}</p>`
    }
    return html
}

