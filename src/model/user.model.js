var Sequelize = require('sequelize');
var DataTypes = Sequelize;
module.exports = (sequelize, Sequelize) => {
    const user = sequelize.define("user", {    
    name: {
        type: DataTypes.STRING
    },
    gender: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    otp:{
        type: DataTypes.INTEGER
    },
    isActive:{
        type: DataTypes.INTEGER
    }
    });    
    return user;
};
    