const express = require("express");
const nftCreator = require("../controllers/nftEntityController");
const {check, oneOf} = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {usernameBaseValidator, usernameDbExistsValidator, nftHashDbExistsValidator} = require("../utilities/validators");

const router = express.Router();

router.post("/create/",
    authMiddleware,
    check("name", "Invalid name").notEmpty(),
    check("price", "Invalid price").isDecimal(),
    check("tags", "Invalid tags").isArray(),
    nftCreator.create);

router.post("/sendToUser/",
    authMiddleware,
    check("username", "Invalid username")
        .trim()
        .notEmpty().bail()
        .custom(usernameBaseValidator).bail()
        .custom(usernameDbExistsValidator("newOwner")).withMessage("Cant find user with such username"),
    check("hash", "Invalid hash")
        .trim()
        .notEmpty().bail()
        .custom(nftHashDbExistsValidator("nft")).withMessage("Cant find nft with such hash").bail()
        .custom((val, {req}) => {
            const {nft} = req.nsValidatorResult;
            const {id: ownerId} = req.jwtDecoded;
            return nft.ownerId === ownerId;
        }).withMessage("Current user is not a owner of this nft"),
    nftCreator.sendToUser);

router.get("/get/:hash",
    check("hash", "Invalid hash")
        .notEmpty(),
    nftCreator.getByHash);

router.get("/getAll/:username",
    check("username", "Invalid username")
        .trim()
        .notEmpty().bail()
        .custom(usernameBaseValidator).bail()
        .custom(usernameDbExistsValidator("user")).withMessage("Cant find user with such username"),
    nftCreator.getAllByUsername);

router.get("/getAll",
    nftCreator.getAllByNameAndTags);

module.exports = router;
