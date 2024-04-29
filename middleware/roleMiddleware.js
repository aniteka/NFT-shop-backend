const authMiddleware = require('./authMiddleware')
const jwt = require("jsonwebtoken");

module.exports = function (allowedRole) {
    return function (req, res, next) {
        if(req.method === "OPTIONS") {
            next()
        }

        try {
            // "Bearer token_body"
            const token = req.headers.authorization?.split( ' ' )[1]
            if(!token) {
                return res.status(403).json( {message: "user is not register"} )
            }

            const jwtDecoded = jwt.verify(token, process.env.JWT_SECRETKEY)
            if(jwtDecoded.role !== allowedRole) {
                return res.status(403).json( {message: `user is not ${allowedRole}`} )
            }

            req.jwtDecoded = jwtDecoded
            return next()
        } catch (e) {
            console.log(e)
            return res.status(403).json( { message: "user is not register" } )
        }
    }
}