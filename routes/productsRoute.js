const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/uploadMiddleware');

const {addProductsController, getProductsController, updateController, deleteController} = require('../controller/productsController');

router.get('/getProducts', getProductsController);
router.delete('/deleteProduct', deleteController);

// using this middleware for this route only
// multer needs a put request, post doesn't work for some reason
router.put('/updateProduct', uploadMiddleware.single('image'), updateController);
router.put('/addProduct', uploadMiddleware.single('image'), addProductsController);

module.exports = router;