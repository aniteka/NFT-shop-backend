const express = require('express')
const nftCreator = require('../controllers/nftEntityController')
const {check} = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/create/",
    authMiddleware,
    check("name", "Invalid name").notEmpty(),
    check("price", "Invalid price").isDecimal(),
    check("tags", "Invalid tags").isArray(),
    nftCreator.create)

router.get("/get/:hash",
    check("hash", "Invalid hash").notEmpty(),
    nftCreator.getByHash)

router.get("/getAll/:userId",
    check("userId", "Invalid userId").isNumeric(),
    nftCreator.getAllByUserId)

router.get("/getAll",
    nftCreator.getAllByNameAndTags)

module.exports = router
