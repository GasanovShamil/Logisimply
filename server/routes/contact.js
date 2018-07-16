let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let mailer = require("../helpers/mailer");
let express = require("express");
let router = express.Router();

router.use(middleware.localize);

router.post("/", middleware.wrapper(async (req, res) => {
    let paramName = req.body.name;
    let paramEmail = req.body.email;
    let paramMessage = req.body.message;
    if (!paramName || !paramEmail || !paramMessage)
        return res.status(400).json({message: localization[req.language].fields.required});

    if (!utils.fields.isEmailValid(paramEmail))
        return res.status(400).json({message: localization[req.language].email.invalid});

    mailer.sendContact(paramName, paramEmail, paramMessage);
    res.status(200).json({message: 'Votre message a bien été envoyé !'});
}));

module.exports = router;