const {Router} = require('express')
const controller = require('../controllers/authController')
const {check, body} = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

const router = Router()

router.post('/registration',
    check("name", "Incorrect name").notEmpty(),
    check("email", "Incorrect email").isEmail(),
    check("password", "Incorrect password").isLength({min: 4, max: 20}),
    controller.registration("USER"))

router.post('/registrationAdmin',
    roleMiddleware('ADMIN'),
    check("name", "Incorrect name").notEmpty(),
    check("email", "Incorrect email").isEmail(),
    check("password", "Incorrect password").isLength({min: 4, max: 20}),
    controller.registration("ADMIN"))

router.post('/login', controller.login)

router.put ('/updateInfo',
    authMiddleware,
    check("email", "Incorrect email").if((email, _) => email).isEmail(),
    controller.updateInfo)

router.put ('/updatePassword',
    authMiddleware,
    check("oldPassword", "Incorrect old password").isLength({min: 4, max: 20}),
    check("newPassword", "Incorrect new password").isLength({min: 4, max: 20}),
    controller.updatePassword)

router.get('/users',
    roleMiddleware('ADMIN'),
    controller.getAll)

router.get('/getUser/:id',
    controller.getOne)

module.exports = router