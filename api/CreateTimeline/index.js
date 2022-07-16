var timeline = require("./example.js")

module.exports = async function (context, req) {
    console.log("Saving public timeline data")
    try {
        const data = await timeline()
        console.log(data)
        context.bindings.outputDocument = JSON.stringify(data);

        context.res = {
            status: 200,
            body: "Successfully saved",
            data: data
        }
    } catch(error) {
        context.res = {
            status: 400,
            body: 'colliding id'
        }
    }
}