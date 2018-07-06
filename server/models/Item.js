const mongoose = require('mongoose');

const itemSchema = mongoose.Schema ({
    type: String,
    reference: String,
    label: String,
    priceET: Number,
    description: String,
    idUser: String
});

module.exports = mongoose.model('Item', itemSchema);