const {validationResult} = require("express-validator");
const ApiError = require("../errors/apiError");
const {messagesFromErrors} = require("../utilities/utilities");
const {NftEntity, Tag, Creator, User, NftEntity_Tag} = require("../models/models");
const uuid = require("uuid")
const path = require("path")
const {Op, Sequelize} = require("sequelize");

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
            const imageFilename = uuid.v4() + image.name.substring(image.name.lastIndexOf("."))
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

    async sendToUser(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest([...messagesFromErrors(errors)]));
            }

            const newOwner = req.nsValidatorResult.newOwner
            const nft = req.nsValidatorResult.nft

            nft.ownerId = newOwner.id || nft.ownerId

            await nft.save()

            return res.status(200).json({message: "done"})
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["sendToUser error"]))
        }
    }

    async getByHash(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["nftGetByHash error", ...messagesFromErrors(errors)]))
            }

            const {hash} = req.params
            const entity = await NftEntity.findOne({where: {hash}})
            if(!entity)
                return next(ApiError.badRequest(["nftGetByHash error", "bad hash"]))

            return res.status(200).json([entity])
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["nftGetByHash error"]))
        }
    }

    async getAllByUsername(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest([...messagesFromErrors(errors)]))
            }

            let {count, page} = req.query
            count = parseInt(count) || 10
            page = parseInt(page) || 1
            const offset = page * count - count

            const {user} = req.nsValidatorResult

            const entities = await NftEntity.findAll(
                {where: {ownerId: user.id},
                    limit: count,
                    offset})

            return res.status(200).json([...entities])
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["nftGetAllByUserId error"]))
        }
    }

    async getAllByNameAndTags(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest(["nftGetAllByName error", ...messagesFromErrors(errors)]))
            }

            let {count, page, name, tags} = req.query
            count = parseInt(count) || 10
            page = parseInt(page) || 1
            name ||= ""
            tags ||= []
            const offset = page * count - count

            const tempentities = await NftEntity.findAll(
                {
                    attributes: {
                        include: [[Sequelize.fn("COUNT", Sequelize.col("tags.id")), "tagCount"]]
                    },
                    where: {
                        name: { [Op.startsWith]: name }
                    },
                    include: [ {
                        model: Tag,
                        through: NftEntity_Tag,
                        attributes: {},
                        where: {
                            name: tags.length === 0 ? { [Op.like]: "%" } : { [Op.in]: tags }
                        }
                    } ],
                    group: ["`nftEntity`.`id`"],
                    having: {
                        tagCount: tags.length === 0 ? { [Op.ne]: -1 } : tags.length
                    },
                    limit: count,
                    subQuery: false,
                    offset
                })

            const ids = tempentities.map((value, index) => { return value.id })

            const entities = await NftEntity.findAll(
                {
                    where: {
                        id: { [Op.in]: ids }
                    },
                    include: [ {
                        model: Tag,
                        through: NftEntity_Tag,
                    } ],
                    limit: count,
                    subQuery: false,
                    offset
                })

            return res.status(200).json([...entities])
        } catch (e) {
            console.log(e)
            return next(ApiError.internal(["nftGetAllByName error"]))
        }
    }
}

module.exports = new NftEntityController()
