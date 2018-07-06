const mongoose = require('mongoose');

const providerSchema = mongoose.Schema ({
    companyName: String,
    legalForm: String,
    siret: String,
    phone: String,
    emailAddress: String,
    website: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    idUser: String
});

module.exports = mongoose.model('Provider', providerSchema);