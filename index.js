require('dotenv').config();

const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const authRouter = require('./routers/authRouter')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use('/api/auth', authRouter)

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
