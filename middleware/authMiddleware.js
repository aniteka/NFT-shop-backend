const jwt = require('jsonwebtoken')
const ApiError = require("../errors/apiError");

/**
 * req.jwtDecoded
 */
module.exports = function (req, res, next) {
    if(req.method === "OPTIONS") {
        next()
    }

    try {
        // "Bearer token_body"
        const token = req.headers.authorization?.split( ' ' )[1]
        if(!token) {
            return next( ApiError.badRequest(["user is not register"]) )
        }
        req.jwtDecoded = jwt.verify(token, process.env.JWT_SECRETKEY)
        return next()
    } catch (e) {
        console.log(e)
        return next( ApiError.badRequest(["user is not register"]))
    }
}