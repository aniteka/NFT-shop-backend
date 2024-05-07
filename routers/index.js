const {Router} = require('express')
const authRouter = require('./authRouter')
const creatorRouter = require('./creatorRouter')
const tagRouter = require('./tagRouter')
const nftEntityRouter = require('./nftEntityRouter')

const router = Router()

router.use("/auth/", authRouter)
router.use("/creator/", creatorRouter)
router.use("/tag/", tagRouter)
router.use("/nftEntity/", nftEntityRouter)

module.exports = router
