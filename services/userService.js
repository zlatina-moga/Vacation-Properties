const User = require('../models/User')

async function createUser(name, username, hashedPassword){
    const user = new User({
        name, 
        username, 
        hashedPassword
    })
    await user.save();
    return user;
}

async function getUserByName(username){
    const pattern = new RegExp(`^${username}$`, 'i')
    const user = await User.findOne({username: {$regex: pattern}});
    return user;
}

module.exports = {
    createUser,
    getUserByName
}