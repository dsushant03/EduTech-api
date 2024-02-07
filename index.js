const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require("dotenv").config();
const errorHandler = require('./middleware/errorHandler');
const mongodbConnection = require('./config/mongodbConnection');
const verifyTokenMiddleware = require('./middleware/authMiddleWare');

mongodbConnection();

// things in here get executed sequentially in code flow as and when invoked.
// request handling middlewares

// static middleware allows clients to access files in the 'public' folder directly through url.
// i.e., localhost:8080/<filename_in_'/public'>
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());
app.use(verifyTokenMiddleware);

const signupRoute = require('./routes/signupRoute');
const userRoute = require('./routes/userRoute');
const productsRoute = require('./routes/productsRoute');

app.use('/', signupRoute);
app.use('/',userRoute);
app.use('/', productsRoute);

// response handling middlewares
app.use(errorHandler);

// get triggered on connection-type issue/ Promise.reject()
process.on('unhandledRejection', (err)=>{
    console.log(err.name, err.message);
    // closes the server
    process.exit(1);
});

app.listen(process.env.PORT);