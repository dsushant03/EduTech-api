const asyncHandler = require('express-async-handler');
const userModel = require('../model/userModel');
const mongoose = require('mongoose');
const ordersModel = require('../model/ordersModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {v4} = require('uuid');
const UserModel = require('../model/userModel');

const getAllUsersController = asyncHandler(async (req, res, next)=>{
    try{
        // returns all users if no filter applied
        const data = await userModel.find({role: {$eq: 'user'}});
        res.send(data);
    }
    catch(err){
        console.log('catch')
        res.status(400);
        next(err, req, res);
    }

});

const loginController = asyncHandler(async(req, res, next)=>{
    const {username, password} = req.body;
    let checkUser = await userModel.find({username: {$eq: username}});
    const sessionId = v4();
    if(username === '' || password === '')
    {
        res.status(400);
        throw new Error("One or more mandatory fields are empty");
    }

    if(checkUser.length === 0)
    {
        res.status(400);
        throw new Error("User does not exist, please signup to create user");
    }

    // under construction.
    // works for normal logout case.
    // yet to handle the case where user closes tab abruptly.
    // limit set to 1000 to avoid potential login errors 
    if(checkUser[0].sessionId.length > 1000)
    {
        res.status(400);
        throw new Error('User already logged in from two device');
    }

    const checkPwd = await bcrypt.compare(password, checkUser[0].password);
    if(!checkPwd)
    {
        res.status(400);
        throw new Error("Incorrect password");
    }

    try
    {
        const token = await generateToken(checkUser[0]._id, checkUser[0].role);
        const refreshToken = await generateRefreshToken(checkUser[0]._id, checkUser[0].role);

        await userModel.findByIdAndUpdate(checkUser[0]._id, {
            $addToSet: {sessionId: sessionId}
        })

        res.json({
            success:true,
            role: checkUser[0].role,
            id: checkUser[0]._id,
            token,
            refreshToken,
            sessionId
        });
    }
    catch(err)
    {
        next(err, req, res);
    }
})

const logoutController = asyncHandler(async(req, res, next)=>{
    const{userId, sessionId} = req.body;

    if(!userId || !sessionId)
    {
        res.status(400);
        throw new Error('Either user ID or session ID is missing');
    }

    try
    {
        const userIdObj = new mongoose.Types.ObjectId(userId);
        await UserModel.findByIdAndUpdate(userIdObj, {
            $pull: {sessionId, sessionId}
        })

        res.json({
            success: true
        })
    }
    catch(err)
    {
        res.status(400);
        next(err, req, res);
    }
})

const updateController = asyncHandler(async (req, res, next)=>{
    const{id, username} = req.body;
    const allUsers = await userModel.find();
    const user = allUsers.find(e=> e.id === id);

    if(!user)
    {
        res.status(400);
        next({message : "user not found"}, req, res);
    }
    else
    {
        try{
            await userModel.findByIdAndUpdate(id, {username});
            res.send("record updated succesfully");
        }
        catch(err){
            res.status(400);
            next(err, req, res);
        }
    }
});

const deleteController = asyncHandler(async (req, res, next)=>{
    const{id} = req.query;
    const user = userModel.find({_id: {$eq: id}});

    if(!user)
    {
        res.status(400);
        next({message : "user not found"}, req, res);
    }
    else
    {
        try{
            await userModel.findByIdAndDelete(id);
            res.send("record deleted succesfully");
        }
        catch(err){
            res.status(400);
            next(err, req, res);
        }
    }
});

const addToCartController = asyncHandler(async(req, res, next)=>{
    const {productId, userId} = req.body;

    try
    {
        const resp = await userModel.findByIdAndUpdate(userId, {$addToSet: {cart: productId}});

        res.json({
            success: true
        });
    }
    catch(err)
    {
        res.status(400);
        next(err, req, res);
    }
})

const getCartController = asyncHandler(async(req, res, next)=>{
    const userId = req.body.userId;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const data = await userModel.aggregate([
        {
            $match: {
                $expr: {$eq: [userObjId, '$_id']}
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'cart',
                foreignField: '_id',
                as: 'cartObjects'
            }
        },
        {
            $project: {
                cartObjects: 1 
                // 1 - include, 0 - exclude
            }
        }

    ]);
    // console.log(data)
    res.json({
        success: true,
        cartObjects: data.length? data[0].cartObjects : []
    })
})

const placeOrderController = asyncHandler(async(req, res, next)=>{
    const {userId, productsId} = req.body;

    if(!userId || !productsId)
    {
        throw new Error('Invalid user ID or product ID');
    }

    try
    {
        const data = await ordersModel.create({
            userId,
            productsId: productsId
        });

        // console.log(data)

        res.json({
            success: true,
            orderId: data?._id
        })
    }
    catch(err)
    {
        res.status(400);
        next(err, req, res);
    }
})

const clearCartController = asyncHandler(async(req, res, next)=>{
    const {userId} = req.body;

    if(!userId)
    {
        res.status(400);
        throw new Error('Invalid userId');
    }

    try
    {
        const data = await userModel.findByIdAndUpdate(userId, {
            cart: []
        });

        res.send({
            success: true
        });
    }
    catch(err)
    {
        res.status(400);
        next(err, req, res);
    }
})

const removeItemFromCartController = asyncHandler(async(req, res, next)=>{
    const {userId} = req.body;
    const {itemId} = req.query;

    if(!userId)
    {
        res.status(400);
        throw new Error('Invalid userId');
    }

    if(!itemId)
    {
        res.status(400);
        throw new Error('Invalid userId');
    }

    try
    {
        const data = await userModel.findByIdAndUpdate(userId, {
            $pull: {cart: itemId}
        });

        // console.log(data)
        res.send({
            success: true
        });
    }
    catch(err)
    {
        res.status(400);
        next(err, req, res);
    }
})

const getOrdersController = asyncHandler(async(req, res, next)=>{
    const {userId} = req.body;

    if(!userId)
    {
        res.status(400);
        throw new Error('Invalid userId');
    }

    try
    {
        const userObjId = new mongoose.Types.ObjectId(userId);

        const data = await userModel.aggregate([
            {
                $match: {$expr: {$eq: [userObjId, '$_id']}}
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'Orders'
                }
            },

            // This stage will destructure the orders array.
            // Try removing this stage and observe the difference in response
            {
                $unwind: '$Orders'
            },

            // Now this stage operates in each object in Orders array separately
            // So we get different object corrosponding to each order.  
            {
                $lookup: {
                    from: 'products',
                    // now, 'Orders' is a single object.
                    localField: 'Orders.productsId',
                    foreignField: '_id',
                    as: 'Products'
                }
            },
            {
                $project: {
                    Orders: 1,
                    Products: 1
                }
            }
        ]);
        // console.log(data)
        res.send(data);
    }
    catch(err)
    {
        res.status(400);
        next(err, req, res);
    }
})

const refreshTokenController = asyncHandler(async(req, res, next)=>{
    const {refreshToken} = req.body;

    // refreshToken here is used to verify whether the user is authorized to refresh the 
    // token or not.
    // User will only have valid refreshToken if he has logged in successfully

    if(!refreshToken)
    {
        // 401 - reserved for unauthorized user
        res.status(401);
        throw new Error('Refresh token missing');
    }

    try
    {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, user)=>{
            if(err)
            {
                // here 'err' is an asynchronous error.
                // try catch do not handle async stuff, so throw will not work here.
                // hence we have an error middleware for such asynchronous errors
                res.status(401);
                next('User is not authorized', req, res);
            }
            else
            {
                const {id, role} = user;
                const newToken = await generateToken(id, role);

                res.json({
                    success: 'true',
                    token: newToken
                })
            }
        })
    }
    catch(err)
    {
        next(err, req, res);
    }
})

async function generateToken(id, role)
{
    const token = jwt.sign({
            id,
            role
        }, process.env.TOKEN_SECRET,
        {
            expiresIn: '5m'
        });
    
    return token;
}

async function generateRefreshToken(id, role)
{
    const token = jwt.sign({
            id,
            role
        }, process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '60m'
        });
    
    return token;
}


module.exports = {getAllUsersController, updateController, deleteController, loginController, addToCartController, getCartController, placeOrderController, clearCartController, getOrdersController, refreshTokenController, logoutController, removeItemFromCartController};