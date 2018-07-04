const mongoose = require('mongoose');

const customerSchema = mongoose.Schema ({
    type: String,
    civility: String,
    lastname: String,
    firstname: String,
    name: String,
    phone: String,
    legalForm: String,
    siret: String,
    emailAddress: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    comment: String,
    idUser: String
});

module.exports = mongoose.model('Customer', customerSchema);