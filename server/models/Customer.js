const mongoose = require('mongoose');

const customerSchema = mongoose.Schema ({
    status: String,
    activationToken: String,
    nom: String,
    prenom: String,
    civilite: String,
    formeJuridique: String,
    siret: String,
    emailClient: String,
    adresse: String,
    codePostal: String,
    ville: String,
    pays: string
});

module.exports = mongoose.model('Customer', customerSchema);