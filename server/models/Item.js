let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

let itemSchema = mongoose.Schema ({
    type: String,
    reference: String,
    label: String,
    priceET: Number,
    description: String,
    idUser: String,
    createdAt: Date,
    updatedAt: Date
});

module.exports = mongoose.model("Item", itemSchema);