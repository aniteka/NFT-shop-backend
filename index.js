require('dotenv').config();

const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')

const app = express()
const PORT = process.env.PORT || 5000

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
