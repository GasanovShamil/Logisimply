let config = require("../config");
let load = require("../helpers/load");
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
    assets: Number,
    comment: String,
    user: String,
    createdAt: Date,
    updatedAt: Date
});

customerSchema.methods.fullFormat = function(include) {
    let result = {
        code: this.code,
        type: this.type,
        civility: this.civility || "",
        firstname: this.firstname,
        lastname: this.lastname,
        name: this.name,
        phone: this.phone || "",
        legalForm: this.legalForm || "",
        siret: this.siret || "",
        email: this.email,
        address: this.address,
        zipCode: this.zipCode,
        town: this.town,
        country: this.country,
        assets: this.assets,
        comment: this.comment || "",
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

module.exports = mongoose.model("Customer", customerSchema);