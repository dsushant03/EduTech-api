const asyncHandler = require('express-async-handler');
const productsModel = require('../model/productsModel');

const addProductsController = asyncHandler(async(req, res, next)=>{

    const data = req.body.data;

    if(req.file)
    {
        data.image = req.file.filename;
    }

    const newProduct = new productsModel(data);

    try
    {
        const resp = await newProduct.validate();
        await productsModel.create(newProduct);
        res.json({
            success: true
        });
    }
    catch(err)
    {
        console.log(err)
        res.status(400);
        next(err);
    }

})

const deleteController = asyncHandler(async (req, res, next)=>{
    const{id} = req.query;
    const product = productsModel.find({_id: {$eq: id}});

    if(!product)
    {
        res.status(400);
        next({message : "user not found"}, req, res);
    }
    else
    {
        try{
            await productsModel.findByIdAndDelete(id);
            res.json({
                success: true
            })
        }
        catch(err){
            res.status(400);
            next(err, req, res);
        }
    }
});

const getProductsController = asyncHandler(async(req, res, next)=>{
    try
    {
        let limitPerPage = '';
        let currentPage = '';
        let skip = 0;
        let data = [];
        let total = 0;

        limitPerPage = parseInt(req.query.limitPerPage);
        currentPage = parseInt(req.query.currentPage);
        const role = req.query.role;

        if(limitPerPage && currentPage)
        {
            skip = (currentPage-1)*limitPerPage;
        }

        if(role === "admin")
        {
            data = await productsModel.find().skip(skip).limit(limitPerPage);
            
            total = await productsModel.find().count();
        }
        else
        {
            total = await productsModel.find({isPublished: true}).count();
            data = await productsModel.find({isPublished: true}).skip(skip).limit(limitPerPage);
        }
        
        res.json({
            totalProducts: total,
            products: data
        });
    }
    catch(err)
    {
        res.status(400);
        next(err);
    }

})

const updateController = asyncHandler(async(req, res, next)=>{
    const {data} = req.body;
    console.log(req.body)
    // console.log(req.file)
    if(!data._id)
    {
        throw new Error('Received empty ID');
    }
    try
    {
        // If image is being uploaded
        if(req.file)
        {
            data.image = req.file.filename;
        }
        await productsModel.findByIdAndUpdate(data._id, {...data});
        res.json({
            success: true
        });
    }
    catch(err)
    {
        res.status(400);
        next(err);
    }
})

module.exports = {addProductsController, getProductsController, updateController, deleteController};