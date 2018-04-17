const mongoose = require('mongoose');

const userSchema = mongoose.Schema ({
    name: String,
    emailAddress: String,
    password: String
});

module.exports = mongoose.model('User', userSchema);