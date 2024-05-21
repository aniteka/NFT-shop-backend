const {Router} = require('express')
const authRouter = require('./authRouter')
const creatorRouter = require('./creatorRouter')
const tagRouter = require('./tagRouter')
const nftEntityRouter = require('./nftEntityRouter')
const userRouter = require('./userRouter')

const router = Router()

router.use("/auth/", authRouter)
router.use("/creator/", creatorRouter)
router.use("/tag/", tagRouter)
router.use("/nftEntity/", nftEntityRouter)
router.use("/user/", userRouter)

module.exports = router
