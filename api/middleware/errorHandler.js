const errorHandler = (err, req, res, next)=>{
    const status = res.statusCode || 500;
    console.log(err)
    res.status(status);
    res.json({
        errorCode: status,
        errorMessage: err.message
    });
};

module.exports = errorHandler;