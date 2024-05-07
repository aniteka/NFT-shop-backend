const express = require('express')
const tagController = require("../controllers/tagController")
const {check} = require("express-validator");

const router = express.Router()

router.post("/create/",
    check("name").notEmpty(),
    tagController.create)

module.exports = router
