const express = require('express')
const creatorController = require('../controllers/creatorController')
const {check} = require("express-validator");

const router = express.Router()

router.post("/makeUserCreator/",
    check("userId").isNumeric(),
    creatorController.makeUserCreator)

router.get("/getCreatorInfoByUser/:userId",
    check("userId").isNumeric(),
    creatorController.getCreatorInfoByUser)

router.get("/getCreatorInfo/:creatorId",
    check("creatorId").isNumeric(),
    creatorController.getCreatorInfo)

module.exports = router
