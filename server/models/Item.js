let config = require("../config.json");
let mongoose = require('mongoose');
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

const itemSchema = mongoose.Schema ({
    type: {type: String},
    reference: {type: String},
    label: {type: String},
    priceET: {type: Number},
    description: {type: String},
    idUser: {type: String},
    createdAt: {type : Date},
    updatedAt: {type : Date}
});

module.exports = mongoose.model('Item', itemSchema);