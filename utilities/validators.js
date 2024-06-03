const {User, NftEntity} = require("../models/models");

module.exports = {
    userIdDbExistsValidator: (nameOfResult) =>
        async (val, {req}) => {
            const user = await User.findOne({where: {id: val}}) || undefined;
            if(user === undefined)
                return Promise.reject();

            req.nsValidatorResult ||= {};
            req.nsValidatorResult[nameOfResult] = user;
        },

    usernameBaseValidator: (val) => val.toString().startsWith("@")
        && val.toString().substring(1).search("[^a-z0-9]") === -1,

    // creates: req.nsValidatorResult.nameOfResult
    usernameDbExistsValidator: (nameOfResult) =>
        async (val, {req}) => {
            const user = await User.findOne({where: {username: val}}) || undefined;
            if(user === undefined)
                return Promise.reject();

            req.nsValidatorResult ||= {};
            req.nsValidatorResult[nameOfResult] = user;
        },

    // creates: req.nsValidatorResult.nameOfResult
    nftHashDbExistsValidator: (nameOfResult) =>
        async (val, {req}) => {
            const nft = await NftEntity.findOne({where: {hash: val}}) || undefined;
            if(nft === undefined)
                return Promise.reject()

            req.nsValidatorResult ||= {};
            req.nsValidatorResult[nameOfResult] = nft;
        },
};