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

module.exports = mongoose.model('User', userSchema);