const {validationResult} = require("express-validator");
const ApiError = require("../errors/apiError");
const {messagesFromErrors} = require("../utils");
const {NftEntity, Tag, Creator} = require("../models/models");
const uuid = require("uuid")
const path = require("path")

class NftEntityController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["nftCreate error", ...messagesFromErrors(errors)]))
            }

            const {name, description, price, tags} = req.body

            const {image = null} = req.files
            if(!image) {
                return next(ApiError.badRequest(["nftCreate error", "image is not set"]))
            }
            const imageFilename = uuid.v4() + ".jpg"
            await image.mv(path.resolve(__dirname, "..", process.env.STATIC_FOLDER, imageFilename))

            const {id: ownerId} = req.jwtDecoded
            let creator = await Creator.findOne({where: {userId: ownerId}})
            if(!creator) {
                creator = await Creator.create({userId: ownerId})
            }

            let hash = Math.random().toString(36);
            while(await NftEntity.findOne({ where: {hash} })){
                hash = Math.random().toString(36)
            }

            let ftags = []
            for (let tag of tags) {
                let ftag
                if(typeof tag == "string") {
                    ftag = await Tag.findOne({where: {name: tag}})
                    if(!ftag)
                    {
                        ftag = await Tag.create( {name: tag} )
                    }
                }
                else {
                    ftag = await Tag.findOne({where: {id: tag}})
                    if(!ftag) {
                        return next(ApiError.badRequest([`Bad tag id ${ftag}`]))
                    }
                }
                ftags.push(ftag)
            }

            let nftEntity = await NftEntity.create({
                name, description, price, hash, ownerId, creatorId: creator.id,
                image: imageFilename
            })
            await nftEntity.addTag(ftags)

            return res.status(200).json({nftEntity})
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["nftCreate error"]))
        }
    }
}

module.exports = new NftEntityController()
