let config = require("../config.json");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);
let nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
});

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

userSchema.methods.sendActivationUrl = function() {
    let url = "http://" + config.base_url + "/api/users/activate/" + this.activationToken;
    let mailOptions = {
        from: config.email.user,
        to: this.email,
        subject: "Activation de votre compte Logisimply",
        text: "Bonjour " + this.firstname + ", veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : " + url,
        html: "<p>Bonjour " + this.firstname + "</p><p>Veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : <b><a href='" + url + "' target='_blank'>Lien</a></p>"
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err)
            console.log("sendActivationUrl KO " + this.email + " : " + err);
        else
            console.log("sendActivationUrl OK " + this.email + " : " + info.response);
    });
};

userSchema.methods.sendPassword = function() {
    let mailOptions = {
        from: config.email.user,
        to: this.email,
        subject: "Votre nouveau mot de passe",
        text: "Bonjour " + this.firstname + ", votre nouveau mot de passe est : " + this.password,
        html: "<p>Bonjour " + this.firstname + "</p><p>Votre nouveau mot de passe est : " + this.password + "</p>"
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err)
            console.log("sendPassword KO " + this.email + " : " + err);
        else
            console.log("sendPassword OK " + this.email + " : " + info.response);
    });
};

module.exports = mongoose.model("User", userSchema);