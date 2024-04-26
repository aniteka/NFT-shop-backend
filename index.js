const express = require('express')

const app = express()
const PORT = process.env.PORT || 5000

const main = async function () {
    try {
        app.listen(PORT, function () {
            console.log(`Listen on port ${PORT}`)
        })
    } catch (e) {
        console.log(e);
    }
}

main()
