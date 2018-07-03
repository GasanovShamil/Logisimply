const mongoose = require('mongoose');

const userSchema = mongoose.Schema ({
    lastname: String,
    firstname: String,
    activityType: String,
    activityField: String,
    categoryType: String,
    activityEntitled: String,
    activityStarted: String,
    sirenSiret: String,
    address: String,
    zipCode: String,
    town: String,
    country: String,
    emailAddress: String,
    password: String,
    status: String,
    activationToken: String
});

userSchema.methods.shortUser = function shortUser() {
    return {
        _id: this._id,
        lastname: this.lastname,
        firstname: this.firstname,
        activityType: this.activityType,
        activityField: this.activityField,
        categoryType: this.categoryType,
        activityEntitled: this.activityEntitled,
        activityStarted: this.activityStarted,
        sirenSiret: this.sirenSiret,
        address: this.address,
        zipCode: this.zipCode,
        town: this.town,
        country: this.country,
        emailAddress: this.emailAddress
    }
};

module.exports = mongoose.model('User', userSchema);