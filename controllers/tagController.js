const {validationResult} = require("express-validator");
const ApiError = require("../errors/apiError");
const {messagesFromErrors} = require("../utilities/utilities");
const { Tag, NftEntity } = require("../models/models")

class TagController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["tagCreate error", ...messagesFromErrors(errors)]))
            }

            const {name} = req.body
            if(await Tag.findOne({ where: {name} })) {
                return next(ApiError.badRequest([`tag "${name}" is already exists`]))
            }

            const tag = await Tag.create({name})
            return res.status(200).json({ tag })
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["tagCreate error"]))
        }
    }
}

module.exports = new TagController()
