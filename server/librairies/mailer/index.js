var nodemailer = require('nodemailer');

//var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'contact.logisimply@gmail.com',
        pass: '@dminLogisimply00'
    }
});

// var mailOptions = {
//     from: '"Fred Foo ?" <foo@blurdybloop.com>',
//     to: 'bar@blurdybloop.com, baz@blurdybloop.com',
//     subject: 'Hello ✔',
//     text: 'Hello world ?',
//     html: '<b>Hello world ?</b>'
// };

function sendActivationUrl(user, url) {
    var mailOptions = {
        from: '"Administrateur Logisimply" <contact.logisimply@gmail.com>',
        to: user.emailAddress,
        subject: "Activation de votre compte Logisimply",
        text: "Bonjour " + user.firstname + ", veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : " + url,
        html: "<p>Bonjour " + user.firstname + "</p><p>Veuillez cliquer sur le lien suivant pour activer votre compte Logisimply :<b><a href='" + url + "' target='_blank'>Lien</a></p>"
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err){
            return console.log("KO : " + err);
        } else {
            console.log("OK : " + info.response);
        }
    });
}

// export the module
module.exports = {
    sendActivationUrl: sendActivationUrl
};