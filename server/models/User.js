let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

let userSchema = mongoose.Schema ({
    email: String,
    password: String,
    firstname: String,
    lastname: String,
    activityType: String,
    categoryType: String,
    activityEntitled: String,
    activityStarted: Date,
    siret: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    status: String,
    activationToken: String,
    parameters: {
        paypal: {
            client: String,
            secret: String
        },
        customers: Number,
        providers: Number,
        quotes: Number,
        invoices: Number,
        items: Number
    },
    createdAt: Date,
    updatedAt: Date
});

userSchema.methods.fullFormat = function() {
    return {
        _id: this._id,
        email: this.email,
        firstname: this.firstname,
        lastname: this.lastname,
        activityType: this.activityType || "",
        activityField: this.activityField || "",
        categoryType: this.categoryType || "",
        activityEntitled: this.activityEntitled,
        activityStarted: this.activityStarted,
        siret: this.siret,
        address: this.address,
        zipCode: this.zipCode,
        town: this.town,
        country: this.country || "",
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        credentials: this.parameters.paypal.client !== "" && this.parameters.paypal.secret !== ""
    };
};

module.exports = mongoose.model("User", userSchema);