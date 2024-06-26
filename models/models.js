const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, defaultValue: "DEFAULT BIO" },
    links: { type: DataTypes.TEXT, defaultValue: "{ \"Instagram\": \"\" ,  \"X\": \"\" }" },
    role: { type: DataTypes.ENUM( 'USER', 'ADMIN' ), allowNull: false },
    avatarImage: { type: DataTypes.STRING },
    backgroundImage: { type: DataTypes.STRING },
})

const Creator = sequelize.define('creator', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
})

const NftEntity = sequelize.define('nftEntity', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: "DEFAULT BIO" },
    price: { type:DataTypes.FLOAT, allowNull: false },
    hash: { type:DataTypes.STRING, allowNull: false, unique: true },
    image: { type:DataTypes.STRING, /*allowNull: false TODO REMOVE */ }
})

const Tag = sequelize.define('tag', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
})

const NftEntity_Tag = sequelize.define('nftEntity_tag', {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
})

const Follower_Creator = sequelize.define("follower_creator", {
    id: { type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true },
})

User.hasMany(NftEntity, {foreignKey: "ownerId"})
NftEntity.belongsTo(User, {foreignKey: "ownerId"})

User.hasOne(Creator)
Creator.belongsTo(User)

Creator.hasMany(NftEntity)
NftEntity.belongsTo(Creator)

NftEntity.belongsToMany(Tag, {through: NftEntity_Tag})
Tag.belongsToMany(NftEntity, {through: NftEntity_Tag})

User.belongsToMany(Creator, {through: Follower_Creator})
Creator.belongsToMany(User, {through: Follower_Creator})

module.exports = {
    User,
    Creator,
    NftEntity,
    Tag,
    NftEntity_Tag,
    Follower_Creator,
}
