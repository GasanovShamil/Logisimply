let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

let providerSchema = mongoose.Schema ({
    code: String,
    companyName: String,
    legalForm: String,
    siret: String,
    phone: String,
    email: String,
    website: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    idUser: String,
    createdAt: Date,
    updatedAt: Date
});

module.exports = mongoose.model("Provider", providerSchema);