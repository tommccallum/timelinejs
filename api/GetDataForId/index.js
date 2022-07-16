module.exports = async function (context, req, inputDocument) {
    // const id = (req.query.id || (req.body && req.body.id));
    // console.log(`GetDataForId: ${id}`)
    // if ( typeof(id) === "undefined")  {
    //     context.res = {
    //         // status: 200, /* Defaults to 200 */
    //         status: 400,
    //         body: "No id specified in query or in post body."
    //     };
    // } else {
    //     try {
    //         console.log(`Attempting call to Cosmos DB with id == ${id}`)
    //         const data = getContext().getCollection().filter(function(doc) { return doc.id == id })
    //         console.log("DB has returned with a value (hopefully!)")
    //         console.log(data)
    //         context.res = {
    //             // status: 200, /* Defaults to 200 */
    //             status: 200,
    //             body: data
    //         };
    //     } catch(error) {
    //         context.res = {
    //             // status: 200, /* Defaults to 200 */
    //             status: 400,
    //             body: error
    //         };
    //     }
    // }
    if ( !inputDocument ) {
        context.log("no data")
        context.res = {
            status:400,
            body: "no data"
        }
    } else {
        context.res = {
            status:200,
            body: inputDocument
        }
    }
}