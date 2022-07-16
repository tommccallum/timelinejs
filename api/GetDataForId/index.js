module.exports = async function (context, req) {
    const id = (req.query.id || (req.body && req.body.id));
    console.log(`GetDataForId: ${id}`)
    if ( typeof(id) === "undefined")  {
        context.res = {
            // status: 200, /* Defaults to 200 */
            status: 400,
            body: "No id specified in query or in post body."
        };
    } else {
        try {
            const data = getContext().getCollection().filter(function(doc) { return doc.id == id })
            context.res = {
                // status: 200, /* Defaults to 200 */
                status: 200,
                body: data
            };
        } catch(error) {
            context.res = {
                // status: 200, /* Defaults to 200 */
                status: 400,
                body: error
            };
        }
    }
}