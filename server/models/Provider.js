let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

let providerSchema = mongoose.Schema ({
    code: {type: String},
    companyName: {type: String},
    legalForm: {type: String},
    siret: {type: String},
    phone: {type: String},
    email: {type: String},
    website: {type: String},
    address: {type: String},
    zipCode: {type: String},
    town: {type: String},
    country: {type: String},
    idUser: {type: String},
    createdAt: {type : Date},
    updatedAt: {type : Date}
});

module.exports = mongoose.model("Provider", providerSchema);