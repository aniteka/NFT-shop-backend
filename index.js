require('dotenv').config();

const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const apiRouter = require('./routers/index')
const cors = require('cors')
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
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
