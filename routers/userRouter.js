﻿const {Router} = require('express')
const controller = require('../controllers/userController')
const {check, body} = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

const router = Router()

router.put ('/updateInfo',
    authMiddleware,
    check("email", "Incorrect email").if((email, _) => email).isEmail(),
    controller.updateInfo)

router.put ('/updatePassword',
    authMiddleware,
    check("oldPassword", "Incorrect old password").isLength({min: 4, max: 20}),
    check("newPassword", "Incorrect new password").isLength({min: 4, max: 20}),
    controller.updatePassword)

router.get('/',
    controller.getAll)

router.get('/:id',
    controller.getOne)

module.exports = router