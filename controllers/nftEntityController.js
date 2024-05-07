const {validationResult} = require("express-validator");
const ApiError = require("../errors/apiError");
const {messagesFromErrors} = require("../utils");
const {NftEntity, Tag} = require("../models/models");

class NftEntityController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["nftCreate error", ...messagesFromErrors(errors)]))
            }

            const {name, description, creationDate, price, hash, image, creatorId, tags} = req.body

            if(await NftEntity.findOne({ where: {hash} })){
                return next(ApiError.badRequest(["invalid hash"]))
            }

            let ftags = []
            for (let tag of tags) {
                let ftag
                if(typeof tag == "string") {
                    let ftag = await Tag.findOne({where: {name: tag}})
                    if(!ftag)
                    {
                        ftag = await Tag.create( {name: tag} )
                    }
                    tags.splice(tags.indexOf(tag), 1)
                    tags.push(ftag.id)
                }
                else {
                    let ftag = await Tag.findOne({where: {id: tag}})
                    if(!ftag) {
                        return next(ApiError.badRequest([`Bad tag id ${ftag}`]))
                    }
                }
                ftags.push(ftag)
            }

            let nftEntity = await NftEntity.create({
                name, description, creationDate, price, hash, image, ownerId: creatorId, creatorId
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
