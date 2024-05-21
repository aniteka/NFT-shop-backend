const {User} = require("../models/models");
const ApiError = require("../errors/apiError");
const {validationResult} = require("express-validator");
const {messagesFromErrors} = require("../utils");
const bcrypt = require("bcrypt");
const {Op} = require("sequelize")

class UserController {
    async updateInfo(req, res, next) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(ApiError.badRequest( ["updateInfo error", ...messagesFromErrors(errors)] ))
            }
            const {name: newName, bio: newBio, email: newEmail} = req.body

            const user = await User.findOne( {
                where: { id: req.jwtDecoded.id }
            } )
            if(user == null) {
                return next(ApiError.badRequest( ["token error"] ))
            }

            if(newEmail) {
                if(await User.findOne({ where: { email: newEmail } })) {
                    return next(ApiError.badRequest( ["invalid email"] ))
                }
                user.email = newEmail || user.email
            }

            user.name = newName || user.name
            user.bio = newBio || user.bio

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
            let {count, page, username} = req.query
            count = parseInt(count) || 10
            page = parseInt(page) || 1
            username ||= ""
            const offset = page * count - count

            const user = await User.findAll({
                where: {name: { [Op.startsWith]: username }},
                limit: count, offset})
            return res.json(user)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["getAll error"]))
        }
    }

    async getOne(req, res, next) {
        try{
            const {id} = req.params
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
