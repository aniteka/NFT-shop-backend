const { User } = require('../models/models')
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken")
const ApiError = require("../errors/apiError");
const {messagesFromErrors} = require("../utils")
const bcrypt = require("bcrypt");

const generateAccessToken = (id, role) => {
    const payload = {
        id, role
    }
    return jwt.sign(payload, process.env.JWT_SECRETKEY, {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN || "1h"})
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
            const validPassword = bcrypt.compareSync(password, user.password)
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
}

module.exports = new AuthController()
