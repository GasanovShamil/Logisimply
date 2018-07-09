let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

let billSchema = mongoose.Schema ({
    idUser: {type: String},
    createdAt: {type : Date},
    updatedAt: {type : Date}
});

module.exports = mongoose.model("Bill", billSchema);