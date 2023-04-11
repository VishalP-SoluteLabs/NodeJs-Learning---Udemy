const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    
    if(!authHeader){
        const error = new Error('Not Authenticated..!!');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(' ')[1]   //To get 'Bearer Token' and split with whitespace so to get - 'Bearer' + 'token' separately
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretsecret')         //It will decode and verify both
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken){
        const error = new Error('Not Authenticated..!');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
}