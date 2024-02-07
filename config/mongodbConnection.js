const mongoose = require("mongoose");


// const mongoDBConnection = async()=>{
//     try{
//         const connection = await mongoose.connect(
//             process.env.MONGO_URL+"/ecommerce-app"
//         );
//     }
//     catch(err){
//         Promise.reject(err);
//         console.log(err)
//     }
// }

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const mongoDBConnection = async()=>{
    try
    {
        await mongoose.connect(process.env.MONGO_URL, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    catch(err)
    {
        console.log(err)
        await mongoose.disconnect();
    }
}

module.exports = mongoDBConnection;