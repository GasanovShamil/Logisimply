const mongoose = require('mongoose');

const customerSchema = mongoose.Schema ({
    type: String,
    lastname: String,
    firstname: String,
    civility: String,
    legalForm: String,
    siret: String,
    emailAddress: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    idUser: String
});

module.exports = mongoose.model('Customer', customerSchema);