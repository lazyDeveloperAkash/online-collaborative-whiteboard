const redis = require('../config/redis')

exports.storeUserData = async (userData, expiration = 3600)=> {
    try {
        await redis.set(`user:${userData._id}`, JSON.stringify(userData), 'EX', expiration);
        console.log('user stored!')
    } catch (error) {
        console.log(error)
    }
}

exports.getUserData = async(userId)=> {
    console.log(`user:${userId}`)
    try {
        const user = await redis.get(`user:${userId}`);
        // console.log("user" + user)
        return user ? JSON.parse(user) : null
    } catch (error) {
        console.log(error)
    }
}

exports.deleteUser = async(userId)=> {
    try {
        await redis.del(`user:${userId}`)
        return true
    } catch (error) {
        console.log(error)
    }
}