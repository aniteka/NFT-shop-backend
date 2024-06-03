const {Router} = require('express')
const controller = require('../controllers/userController')
const {check, body} = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const {usernameBaseValidator, usernameDbExistsValidator, userIdDbExistsValidator} = require("../utilities/validators");

const router = Router()

router.put ('/updateInfo',
    authMiddleware,
    check("email", "Incorrect email")
        .optional()
        .trim()
        .isEmail(),
    check("links")
        .optional()
        .custom(links => JSON.parse(links)["X"] !== undefined).withMessage("Link to X is undefined")
        .custom(links => JSON.parse(links)["Instagram"] !== undefined).withMessage("Link to Instagram is undefined"),
    controller.updateInfo)

router.put ('/updatePassword',
    authMiddleware,
    check("oldPassword", "Incorrect old password")
        .isLength({min: 4, max: 20}),
    check("newPassword", "Incorrect new password")
        .isLength({min: 4, max: 20}),
    controller.updatePassword)

/*
query: count, page, name
 */
router.get('/getAll',
    controller.getAll)

router.get("/:username",
    check("username", "Invalid username")
        .notEmpty().bail()
        .custom(usernameBaseValidator).bail()
        .custom(usernameDbExistsValidator("user")).withMessage("Cant find user with such username"),
    controller.getOne)

router.get("/id/:id",
    check("id", "Invalid id")
        .isNumeric().bail()
        .custom(userIdDbExistsValidator("user")).withMessage("Cant find user with such id"),
    controller.getOneById)

router.get('/',
    authMiddleware,
    controller.getOneByJwt)

module.exports = router