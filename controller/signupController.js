const asyncHandler = require('express-async-handler');
const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');

const signupController = asyncHandler(async (req, res, next)=>{
    const {username, password, role} = req.body;
    // 2nd arg is salt. more is the salt more is the encryption
    let encryptedPassword = await bcrypt.hash(password, 10);

    let newUser = new userModel({
        username,
        password: encryptedPassword,
        role
    });

    let checkUser = await userModel.find({username: {$eq: username}});

    if(checkUser.length)
    {
        res.status(400);
        throw new Error("username already exists");
    }

    try{
        await newUser.validate();
        await userModel.create(newUser);
        res.json({
            success:"true"
        });
    }
    catch(err){
        console.log('catch')
        res.status(400);
        next(err, req, res);
    }

});

module.exports = signupController;