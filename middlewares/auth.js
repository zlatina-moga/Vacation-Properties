const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { TOKEN_SECRET, COOKIE_NAME } = require('../config')

module.exports = () => (req, res, next) => {
    if (parseToken(req, res)){
        req.auth = {
            async register(name, username, password) {
                const token = await register(name, username, password)
                res.cookie(COOKIE_NAME, token)
            },
            async login(username, password){
                const token = await login(username, password)
                res.cookie(COOKIE_NAME, token)
            },
            logout(){
                res.clearCookie(COOKIE_NAME);
            }
        }
        next();
    }
}

async function register(name, username, password){
    const existing = await userService.getUserByName(username);

    if (existing){
        throw new Error('Username is taken!')
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.createUser(name, username, hashedPassword)

    return generateToken(user)
}

async function login(username, password){
    const user = await userService.getUserByName(username);

    if (!user){
        throw new Error('Incorrect username')
    }

    const hasMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!hasMatch){
        throw new Error('Incorrect password')
    }

    return generateToken(user)
    
}

function generateToken(userData){
    return jwt.sign({
        _id: userData._id,
        name: userData.name,
        username: userData.username
    }, TOKEN_SECRET);
}

function parseToken(req, res){
    const token = req.cookies[COOKIE_NAME];

    if (token) {
        try {
            const userData = jwt.verify(token, TOKEN_SECRET);
            req.user = userData;
            res.locals.user = userData;
            return true;
        }
        catch (err) {
            res.clearCookie(COOKIE_NAME)
            res.redirect('/auth/login')
            return false;
        }
    }
    return true;
}