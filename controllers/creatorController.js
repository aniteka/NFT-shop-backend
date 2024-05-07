const { User, Creator } = require('../models/models')
const {validationResult} = require("express-validator");
const {messagesFromErrors} = require("../utils")
const ApiError = require("../errors/apiError");


class CreatorController {
    async makeUserCreator(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["makeUserCreator error", ...messagesFromErrors(errors)]))
            }

            const {userId} = req.body

            if(await Creator.findOne({ where: {userId} })){
                return next(ApiError.badRequest([`User(id: ${userId}) is already creator`]))
            }

            const creator = await Creator.create({userId})
            return res.status(200).json({ creator })
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["makeUserCreator error"]))
        }
    }

    async getCreatorInfoByUser(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["getCreatorInfoByUser error", ...messagesFromErrors(errors)]))
            }

            const {userId} = req.params

            return res.json( {
                creator: await Creator.findOne({ where: {userId} })
            })
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["getCreatorInfoByUser error"]))
        }
    }

    async getCreatorInfo(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["getCreatorInfo error", ...messagesFromErrors(errors)]))
            }

            const {creatorId: id} = req.params

            return res.json( {
                creator: await Creator.findOne({ where: {id} })
            })
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["getCreatorInfo error"]))
        }
    }
}

module.exports = new CreatorController()