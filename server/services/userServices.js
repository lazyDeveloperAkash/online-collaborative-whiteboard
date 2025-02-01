const { catchAsyncErrors } = require('../middlewares/catchAsyncErrors');
const userModel = require('../models/userModel');
const redisService = require('./redisService');

exports.getLoggedInUser = async (userId) => {
    try {
        const cachedUser = await redisService.getUserData(userId);
        if (cachedUser) return cachedUser;

        const user = await userModel.findById(userId);

        if (user) await redisService.storeUserData(user);
        return user;
    } catch (error) {
        console.log(error)
    }
}