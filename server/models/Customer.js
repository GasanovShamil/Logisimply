let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

let customerSchema = mongoose.Schema ({
    code: String,
    type: String,
    civility: String,
    firstname: String,
    lastname: String,
    name: String,
    phone: String,
    legalForm: String,
    siret: String,
    email: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    comment: String,
    idUser: String,
    createdAt: Date,
    updatedAt: Date
});

module.exports = mongoose.model("Customer", customerSchema);