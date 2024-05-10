require('dotenv').config();

const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const apiRouter = require('./routers/index')
const cors = require('cors')
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware')
const {NftEntity} = require("./models/models");
const fileUpload = require("express-fileupload")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, process.env.STATIC_FOLDER)))
app.use(fileUpload({}))
app.use('/api', apiRouter)

app.use(errorHandlerMiddleware)

const main = async function () {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, function () {
            console.log(`Listen on port ${PORT}`)
        })
    } catch (e) {
        console.log(e);
    }
}

main()
