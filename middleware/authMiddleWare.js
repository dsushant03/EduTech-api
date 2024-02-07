const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// this is what JWT did.
// while generating, 
// ({id, role}, secretKey) => token
// while decoding,
// (token, secretKey) => {id, role}

const verifyTokenMiddleware = asyncHandler(async(req, res, next)=>{
    if(['/login', '/signup', '/refreshToken','/logout', '/public'].indexOf(req.url) > -1)
    {
        next();
    }
    else
    {
        const auth = req.headers.authorization;
        const token = auth.split(' ')[1];
        
        if(auth && token)
        {
            jwt.verify(token, process.env.TOKEN_SECRET, (err, user)=>{
                if(err)
                {
                    // 403 error code is reserved for jwt expiry only
                    res.status(403);
                    throw new Error('Token is invalid');
                }
                else
                {
                    // so, we get id, and role in req body of all API's without passing it  from client side
                    req.body.userId = user.id;
                    req.body.role = user.role;
                    next();
                }
            });
        }
        else
        {
            res.status(401);
            throw new Error('User not authorized');
        }
    }
})

module.exports = verifyTokenMiddleware