const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productsSchema = schema({
    courseName: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    }
});

const productsModel = mongoose.model('products', productsSchema);
module.exports = productsModel;