let config = require("../config.json");
let mongoose = require('mongoose');
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

const customerSchema = mongoose.Schema ({
    type: {type: String},
    civility: {type: String},
    firstname: {type: String},
    lastname: {type: String},
    name: {type: String},
    phone: {type: String},
    legalForm: {type: String},
    siret: {type: String},
    email: {type: String},
    address: {type: String},
    zipCode: {type: String},
    town: {type: String},
    country: {type: String},
    comment: {type: String},
    idUser: {type: String},
    createdAt: {type : Date},
    updatedAt: {type : Date}
});

module.exports = mongoose.model('Customer', customerSchema);