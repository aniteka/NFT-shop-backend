const { User } = require('../models/models')
const bcrypt = require('bcrypt')
const {validationResult} = require("express-validator");
const bctypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const ApiError = require("../errors/apiError");

const generateAccessToken = (id, role) => {
    const payload = {
        id, role
    }
    return jwt.sign(payload, process.env.JWT_SECRETKEY, {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN || "1h"})
}

const messagesFromErrors = (errors) => {
    return errors.array().map(value => value.msg)
}

class AuthController {
    registration(role) {
        return async function(req, res, next) {
            try {
                const errors = validationResult(req)
                if(!errors.isEmpty()){
                    return next(ApiError.badRequest( ["registration error", ...messagesFromErrors(errors)] ))
                }

                const {name, email, password} = req.body
                const candidate = await User.findOne({
                    where: {email}
                })
                if(candidate) {
                    return next(ApiError.badRequest(["already registered"]))
                }
                const hashPassword = bcrypt.hashSync(password, 7)
                const user = await User.create({
                    name, email, password: hashPassword, role})

                const token = generateAccessToken(user.id, user.role)
                return res.json({ token, user })
            } catch (e) {
                console.log(e)
                return next(ApiError.internal(["registration error"]))
            }
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const user = await User.findOne({
                where: {email},
            })
            if(!user) {
                return next(ApiError.badRequest(["cant find user with this email"]))
            }
            const validPassword = bctypt.compareSync(password, user.password)
            if(!validPassword) {
                return next(ApiError.badRequest(["password is incorrect"]))
            }

            const token = generateAccessToken(user.id, user.role)
            return res.json({ token, user })

        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["login error"]))
        }
    }

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

            const validPassword = bctypt.compareSync(oldPassword, user.password)
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
            const user = await User.findAll()
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

module.exports = new AuthController()
