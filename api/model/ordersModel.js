const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId
    },
    productsId: {
        type: [mongoose.Types.ObjectId]
    },
    orderDate: {
        type: Date,
        default: new Date()
    }
});

const ordersModel = mongoose.model('orders', ordersSchema);
module.exports = ordersModel;