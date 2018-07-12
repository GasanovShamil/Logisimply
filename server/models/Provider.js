let config = require("../config");
let load = require("../helpers/load");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

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
    user: String,
    createdAt: Date,
    updatedAt: Date
});

providerSchema.methods.fullFormat = function(include) {
    let result = {
        code: this.code,
        companyName: this.companyName,
        legalForm: this.legalForm,
        siret: this.siret,
        phone: this.phone || "",
        email: this.email,
        website: this.website || "",
        address: this.address,
        zipCode: this.zipCode,
        town: this.town,
        country: this.country || "",
        user: this.user,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };

    if (include && include.logged) {
        if (include.user)
            result = load.user(result, include.logged);
    }

    return result;
};

module.exports = mongoose.model("Provider", providerSchema);