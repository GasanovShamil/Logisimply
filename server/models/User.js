let config = require("../config.json");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

let userSchema = mongoose.Schema ({
    email: {type: String},
    password: {type: String},
    firstname: {type: String},
    lastname: {type: String},
    activityType: {type: String},
    categoryType: {type: String},
    activityEntitled: {type: String},
    activityStarted: {type: Date},
    siret: {type: String},
    address: {type: String},
    zipCode: {type: String},
    town: {type: String},
    country: {type: String},
    status: {type: String},
    activationToken: {type: String},
    parameters: {
        customers: {type: Number},
        providers: {type: Number},
        quotes: {type: Number},
        bills: {type: Number}
    },
    createdAt: {type : Date},
    updatedAt: {type : Date}
});

userSchema.methods.shortUser = function() {
    return {
        _id: this._id,
        email: this.email,
        firstname: this.firstname,
        lastname: this.lastname,
        activityType: this.activityType,
        activityField: this.activityField,
        categoryType: this.categoryType,
        activityEntitled: this.activityEntitled,
        activityStarted: this.activityStarted,
        siret: this.siret,
        address: this.address,
        zipCode: this.zipCode,
        town: this.town,
        country: this.country,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.createdAt,
    };
};

module.exports = mongoose.model("User", userSchema);