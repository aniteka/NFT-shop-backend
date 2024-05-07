const express = require('express')
const nftCreator = require('../controllers/nftEntityController')
const {check} = require("express-validator");

const router = express.Router()

router.post("/create/",
    check("name").notEmpty(),
    check("creationDate").isDate(),
    check("price").isDecimal(),
    check("hash").notEmpty(),
    check("image").notEmpty(),
    check("creatorId").isNumeric(),
    check("tags").isArray(),
    nftCreator.create)

module.exports = router
