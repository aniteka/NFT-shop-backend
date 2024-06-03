const {User} = require("../models/models");
const ApiError = require("../errors/apiError");
const {validationResult} = require("express-validator");
const {messagesFromErrors} = require("../utilities/utilities");
const bcrypt = require("bcrypt");
const {Op} = require("sequelize")
const uuid = require("uuid");
const path = require("path");

class UserController {
    async updateInfo(req, res, next) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(ApiError.badRequest( ["updateInfo error", ...messagesFromErrors(errors)] ))
            }
            const {
                name: newName = undefined,
                bio: newBio = undefined,
                email: newEmail = undefined,
                links: newLinks = undefined} = req.body || {}

            const {
                avatarImage: newAvatarImage = undefined,
                backgroundImage: newBackgroundImage = undefined} = req.files || {}

            if(newAvatarImage) {
                var newAvatarImageFilename = uuid.v4() + ".jpg"
                await newAvatarImage.mv(path.resolve(__dirname, "..", process.env.STATIC_FOLDER, newAvatarImageFilename))
            }
            if(newBackgroundImage) {
                var newBackgroundImageFilename = uuid.v4() + ".jpg"
                await newBackgroundImage.mv(path.resolve(__dirname, "..", process.env.STATIC_FOLDER, newBackgroundImageFilename))
            }

            const user = await User.findOne( {
                where: { id: req.jwtDecoded.id }
            } )
            if(user == null) {
                return next(ApiError.badRequest( ["token error"] ))
            }

            if(newEmail && newEmail !== user.email) {
                if(await User.findOne({ where: { email: newEmail } })) {
                    return next(ApiError.badRequest( ["invalid email"] ))
                }
                user.email = newEmail || user.email
            }

            user.name = newName || user.name
            user.bio = newBio || user.bio
            user.links = newLinks || user.links

            user.avatarImage = newAvatarImageFilename || user.avatarImage
            user.backgroundImage = newBackgroundImageFilename || user.backgroundImage

            await user.save()

            return res.status(200).json( { user } )
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["updateInfo error"]))
        }
    }

    async updatePassword(req, res, next) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(ApiError.badRequest( ["updatePassword error", ...messagesFromErrors(errors)] ))
            }
            const {oldPassword, newPassword} = req.body

            const user = await User.findOne( {
                where: { id: req.jwtDecoded.id }
            } )
            if(user == null) {
                return next(ApiError.badRequest( ["token error"] ))
            }

            const validPassword = bcrypt.compareSync(oldPassword, user.password)
            if(!validPassword) {
                return next(ApiError.badRequest( ["password is incorrect"] ))
            }

            user.password = bcrypt.hashSync(newPassword, 7)

            await user.save()

            return res.status(200).json( { user } )
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["updatePassword error"]))
        }
    }

    async getAll(req, res, next) {
        try {
            let {count, page, name} = req.query
            count = parseInt(count) || 10
            page = parseInt(page) || 1
            name ||= ""
            const offset = page * count - count

            const user = await User.findAll({
                where: {name: { [Op.startsWith]: name }},
                limit: count, offset})
            return res.json(user)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["getAll error"]))
        }
    }

    async getOne(req, res, next) {
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(ApiError.badRequest( [...messagesFromErrors(errors)] ))
            }

            let {user} = req.nsValidatorResult
            user.password = undefined

            return res.status(200).json(user)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["getOne error"]))
        }
    }

    async getOneById(req, res, next) {
        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(ApiError.badRequest( [...messagesFromErrors(errors)] ))
            }

            let {user} = req.nsValidatorResult

            return res.status(200).json(user)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["getOne error"]))
        }
    }

    async getOneByJwt(req, res, next) {
        try{
            const id = req.jwtDecoded.id;
            const user = await User.findOne({
                where: {id}
            })
            if(!user) {
                return next(ApiError.badRequest([`id ${id} is incorrect`]))
            }
            return res.json(user)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["getOne error"]))
        }
    }
}

module.exports = new UserController();
