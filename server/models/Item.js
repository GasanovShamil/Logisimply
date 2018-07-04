const mongoose = require('mongoose');

const itemSchema = mongoose.Schema ({
    type: String,
    reference: String,
    label: String,
    priceTL: String,
    description: String,
    idUser: String
});

module.exports = mongoose.model('Item', itemSchema);