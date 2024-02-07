const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        minLength: [4, "username must be atleast 4 letters"],
        required: true
    },
    password:{
        type: String,
        minLength: [6, "password must be atleast 6 characters"],
        validate: [
            {
                validator: function(v){
                    return String(v).match(/\d/g);
                },
                message: "password should have atleast one number"
            },
            {
                validator: function(v){
                    return String(v).match(/[a-zA-Z]/g);
                },
                message: "password should have atleast one alphabet"
            },
            {
                validator: function(v){
                    return String(v).match(/[!~@#$%^&*(),./]/g);
                },
                message: "password should have atleast one symbol"
            }
        ],
        required: true
    },
    role:{
        type: String
    },
    cart: {
        type: [mongoose.Types.ObjectId]
    },
    sessionId: {
        type: [String]
    }
});

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;