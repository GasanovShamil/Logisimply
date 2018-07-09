let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

let itemSchema = mongoose.Schema ({
    type: {type: String},
    reference: {type: String},
    label: {type: String},
    priceET: {type: Number},
    description: {type: String},
    idUser: {type: String},
    createdAt: {type : Date},
    updatedAt: {type : Date}
});

module.exports = mongoose.model("Item", itemSchema);