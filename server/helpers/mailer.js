let config = require("../config");
let localization = require("../localization/localize");
let utils = require("./utils");
let pdf = require("./pdf");
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
        let url = config.url + "/api/users/activate/" + user.activationToken;
        let mailOptions = {
            from: config.email.user,
            to: user.email,
            subject: localization[language].email.template.activation,
            text: localization[language].email.activation.hello + " " + user.firstname + ",\n" + localization[language].email.activation.wording + " " + url + "\n" + localization[language].email.courtesy.courtesy_form + "\n" + localization[language].email.courtesy.signature,
            html: "<p>" + localization[language].email.activation.hello + " " + user.firstname + "</p><p>" + localization[language].email.activation.wording + "<b> <a href='" + url + "' target='_blank'>" + localization[language].email.activation.click + "</a></p><p>" + localization[language].email.courtesy.courtesy_form + "</p><p>" + localization[language].email.courtesy.signature + "</p>"
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
            text: localization[language].email.password.hello + " " + user.firstname + ",\n" + localization[language].email.password.wording + "\n" + localization[language].email.password.new_password + " " + user.password + "\n" + localization[language].email.courtesy.courtesy_form + "\n" + localization[language].email.courtesy.signature,
            html: "<p>" + localization[language].email.password.hello + " "+ user.firstname + "</p><p>" + localization[language].email.password.wording + "</p><p>" + localization[language].email.password.new_password + " " + user.password + "</p><p>" + localization[language].email.courtesy.courtesy_form + "</p><p>" + localization[language].email.courtesy.signature + "</p>"
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail password failed - email : " + user.email + " / error : " + err);
            else
                console.log("Mail password succeeded - email : " + user.email);
        });
    },
    sendQuote: function(quote, language) {
        let path = utils.pdf.getPath(quote.user._id, quote.code);

        let mailOptions = {
            from: config.email.user,
            to: quote.customer.email,
            subject: localization[language].email.template.password,
            text: localization[language].email.quote.hello + " " + quote.customer.name + ", \n " + localization[language].email.quote.wording + " " + quote.code + "\n" + localization[language].email.quote.wording_2 + "\n" + localization[language].email.courtesy.courtesy_form + "\n" + localization[language].email.courtesy.signature,
            html: "<p>" + localization[language].email.quote.hello + " " + quote.customer.name + "</p><p>" + localization[language].email.quote.wording + " " + quote.code + " " + localization[language].email.quote.wording_2 + "</p><p>" + localization[language].email.courtesy.courtesy_form + "</p><p>" + localization[language].email.courtesy.signature + "</p>",
            attachments: [{filename: "Devis - " + quote.code + ".pdf", path: path}]
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail quote failed - user : " + quote.user._id + " / quote : " + quote.code);
            else {
                console.log("Mail quote succeeded - user : " + quote.user._id + " / quote : " + quote.code);
                utils.pdf.remove(path);
            }
        });
    },
    sendInvoice: function(invoice, language) {
        let path = utils.pdf.getPath(invoice.user._id, invoice.code);

        let mailOptions = {
            from: config.email.user,
            to: invoice.customer.email,
            subject: localization[language].email.template.password,
            text: localization[language].email.invoice.hello + " " + invoice.customer.name + ", \n " + localization[language].email.quoinvoicete.wording + " " + invoice.code + "\n" + localization[language].email.invoice.wording_2 + "\n" + localization[language].email.courtesy.courtesy_form + "\n" + localization[language].email.courtesy.signature,
            html: "<p>" + localization[language].email.invoice.hello + " " + invoice.customer.name + "</p><p>" + localization[language].email.invoice.wording + " " + invoice.code + " " + localization[language].email.invoice.wording_2 + "</p><p>" + localization[language].email.courtesy.courtesy_form + "</p><p>" + localization[language].email.courtesy.signature + "</p>",
            attachments: [{filename: "Facture - " + invoice.code + ".pdf", path: path}]
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail invoice failed - user : " + invoice.user._id + " / invoice : " + invoice.code);
            else {
                console.log("Mail invoice succeeded - user : " + invoice.user._id + " / invoice : " + invoice.code);
                utils.pdf.remove(path);
            }
        });
    },
    sendContact: function(name, email, message, language) {
        let mailOptions = {
            from: config.email.user,
            to: config.email.admin,
            subject: localization[language].email.contact.subject,
            text: localization[language].email.contact.hello + " " + localization[language].email.contact.contact + name + "\n" + localization[language].email.contact.email + " " + email + "\n" + localization[language].email.contact.message + " " + message + "\n" + localization[language].email.courtesy.courtesy_form + "\n" + localization[language].email.courtesy.signature,
            html: "<p>" + localization[language].email.contact.hello + "</p><p>" + localization[language].email.contact.contact + " " + name + "</p><p>" + localization[language].email.contact.email + " " + email + "</p><p>" + localization[language].email.contact.message + " " + message + "</p>"
        };

        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("Mail contact failed - email : " + email);
            else
                console.log("Mail contact succeeded - email : " + email);
        });
    }
};