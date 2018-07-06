let config = require('../config.json');
let utils = require('../helpers/utils');
let jwt = require('jsonwebtoken');
let md5 = require('md5');
let mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.database);

let UserSchema = mongoose.Schema ({
    lastname: String,
    firstname: String,
    activityType: String,
    categoryType: String,
    activityEntitled: String,
    activityStarted: String,
    siret: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    emailAddress: String,
    password: String,
    status: String,
    activationToken: String
});

UserSchema.methods.shortUser = function shortUser() {
    return {
        _id: this._id,
        lastname: this.lastname,
        firstname: this.firstname,
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
        emailAddress: this.emailAddress
    }
};

module.exports = mongoose.model('User', UserSchema);