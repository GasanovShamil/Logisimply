let config = require("../config");
let localization = require("../localization/localize");
let utils = require("../helpers/utils");
let nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
});

module.exports = {
    sendActivationUrl: function(user, language) {
        let url = config.url + "/activate/" + user.activationToken;
        let mailOptions = {
            from: config.email.user,
            to: user.email,
            subject: localization[language].email.template.activation,
            text: "Bonjour " + user.firstname + ", veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : " + url,
            html: "<p>Bonjour " + user.firstname + "</p><p>Pour activer votre compte Logisimply : <b><a href='" + url + "' target='_blank'>cliquez-ici</a></p>"
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail activation failed - email : " + user.email + " / error : " + err);
            else
                console.log("Mail activation succeeded - email : " + user.email);
        });
    },
    sendPassword: function(user, language) {
        let mailOptions = {
            from: config.email.user,
            to: user.email,
            subject: localization[language].email.template.password,
            text: "Bonjour " + user.firstname + ", votre nouveau mot de passe est : " + user.password,
            html: "<p>Bonjour " + user.firstname + "</p><p>Votre nouveau mot de passe est : " + user.password + "</p>"
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail password failed - email : " + user.email + " / error : " + err);
            else
                console.log("Mail password succeeded - email : " + user.email);
        });
    },
    sendQuote: function(quote, language) {
        let mailOptions = {
            from: config.email.user,
            to: quote.customer.email,
            subject: localization[language].email.template.password,
            text: "Bonjour",
            html: "<p>Bonjour " + quote.customer.name + "</p>",
            attachments: [{filename: "Devis - " + quote.code + ".pdf", path: utils.getPdfPath(quote.user._id, quote.code)}]
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail quote failed - user : " + quote.user._id + " / quote : " + quote.code);
            else
                console.log("Mail quote succeeded - user : " + quote.user._id + " / quote : " + quote.code);
        });
    },
    sendInvoice: function(invoice, language) {
        let mailOptions = {
            from: config.email.user,
            to: invoice.customer.email,
            subject: localization[language].email.template.password,
            text: "Bonjour",
            html: "<p>Bonjour " + invoice.customer.name + "</p>",
            attachments: [{filename: "Facture - " + invoice.code + ".pdf", path: utils.getPdfPath(invoice.user._id, invoice.code)}]
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail invoice failed - user : " + invoice.user._id + " / invoice : " + invoice.code);
            else
                console.log("Mail invoice succeeded - user : " + invoice.user._id + " / invoice : " + invoice.code);
        });
    }
};