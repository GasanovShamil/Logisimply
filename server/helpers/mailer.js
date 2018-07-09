let config = require("../config.json");
let localization = require("../localization/fr_FR");
let nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
});

module.exports = {
    sendActivationUrl: function(user) {
        let url = "http://" + config.base_url + "/api/users/activate/" + user.activationToken;
        let mailOptions = {
            from: config.email.user,
            to: user.email,
            subject: localization.email.template.activation,
            text: "Bonjour " + user.firstname + ", veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : " + url,
            html: "<p>Bonjour " + user.firstname + "</p><p>Veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : <b><a href='" + url + "' target='_blank'>Lien</a></p>"
        };

        transporter.sendMail(mailOptions, function(err, info) {
            if (err)
                console.log("sendActivationUrl KO " + user.email + " : " + err);
            else
                console.log("sendActivationUrl OK " + user.email + " : " + info.response);
        });
    },
    sendPassword: function(user) {
        let mailOptions = {
            from: config.email.user,
            to: user.email,
            subject: localization.email.template.password,
            text: "Bonjour " + user.firstname + ", votre nouveau mot de passe est : " + user.password,
            html: "<p>Bonjour " + user.firstname + "</p><p>Votre nouveau mot de passe est : " + user.password + "</p>"
        };

        transporter.sendMail(mailOptions, function(err, info) {
            if (err)
                console.log("sendPassword KO " + this.email + " : " + err);
            else
                console.log("sendPassword OK " + this.email + " : " + info.response);
        });
    }
};