const {Router} = require('express')
const authRouter = require('./authRouter')
const creatorRouter = require('./creatorRouter')

const router = Router()

router.use("/auth/", authRouter)
router.use("/creator/", creatorRouter)

module.exports = router
