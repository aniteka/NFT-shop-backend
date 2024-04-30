const { User } = require('../models/models')
const bcrypt = require('bcrypt')
const {validationResult} = require("express-validator");
const bctypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const generateAccessToken = (id, role) => {
    const payload = {
        id, role
    }
    return jwt.sign(payload, process.env.JWT_SECRETKEY, {expiresIn: "24h"})
}

class AuthController {
    registration(role) {
        return async function(req, res, next) {
            try {
                const errors = validationResult(req)
                if(!errors.isEmpty()){
                    return res.status(400).json( { message: 'registration error', ...errors } )
                }

                const {name, email, password} = req.body
                const candidate = await User.findOne({
                    where: {email}
                })
                if(candidate) {
                    return res.status(400).json( { message: 'already registered' } )
                }
                const hashPassword = bcrypt.hashSync(password, 7)
                const user = await User.create({
                    name, email, password: hashPassword, role})

                const token = generateAccessToken(user.id, user.role)
                return res.json({ token })
            } catch (e) {
                console.log(e)
                return res.status(400).json( {message: "registration error" } )
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
                return res.status(400).json( { message: 'cant find user with this email'} )
            }
            const validPassword = bctypt.compareSync(password, user.password)
            if(!validPassword) {
                return res.status(400).json( { message: 'password is incorrect'} )
            }

            const token = generateAccessToken(user.id, user.role)
            return res.json({ token })

        } catch (e) {
            console.log(e)
            res.status(400).json( {message: "login error" } )
        }
    }

    async getAll(req, res, next) {
        try {
            const user = await User.findAll()
            return res.json(user)
        } catch (e) {
            console.log(e)
            res.status(400).json( {message: "getAll error" } )
        }
    }

    async getOne(req, res, next) {
        try{
            const {id} = req.params
            const user = await User.findOne({
                where: {id}
            })
            if(!user) {
                return res.status(400).json( { message: `id ${id} is incorrect` } )
            }
            return res.json(user)
        } catch (e) {
            console.log(e)
            res.status(400).json( {message: "getOne error" } )
        }
    }
}

module.exports = new AuthController()
