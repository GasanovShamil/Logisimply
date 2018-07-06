var config = require('../config.json');
var utils = require('../helpers/utils');
var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
var jwt = require('jsonwebtoken');
var md5 = require('md5');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
});
const mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.database);

/**
 * @swagger
 * definition:
 *   User:
 *     type: object
 *     properties:
 *       lastname:
 *         type: string
 *       firstname:
 *         type: string
 *       activityType:
 *         type: string
 *       activityField:
 *         type: string
 *       categoryType:
 *         type: string
 *       activityEntitled:
 *         type: string
 *       activityStarted:
 *         type: string
 *       siret:
 *         type: string
 *       address:
 *         type: string
 *       zipCode:
 *         type: string
 *       town:
 *         type: string
 *       country:
 *         type: string
 *       emailAddress:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *       status:
 *         type: string
 *       activationToken:
 *         type: string
 *     required:
 *       - lastname
 *       - firstname
 *       - activityEntitled
 *       - activityStarted
 *       - siret
 *       - address
 *       - zipCode
 *       - town
 *       - emailAddress
 *       - password
 */

function sendActivationUrl(user) {
    let url = "http://" + config.base_url + "/api/users/activate/" + user.activationToken;
    var mailOptions = {
        from: 'contact.logisimply@gmail.com',
        to: user.emailAddress,
        subject: "Activation de votre compte Logisimply",
        text: "Bonjour " + user.firstname + ", veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : " + url,
        html: "<p>Bonjour " + user.firstname + "</p><p>Veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : <b><a href='" + url + "' target='_blank'>Lien</a></p>"
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err)
            console.log("sendActivationUrl KO " + user.emailAddress + " : " + err);
        else
            console.log("sendActivationUrl OK " + user.emailAddress + " : " + info.response);
    });
}

function sendPassword(user) {
    var mailOptions = {
        from: 'contact.logisimply@gmail.com',
        to: user.emailAddress,
        subject: "Votre nouveau mot de passe",
        text: "Bonjour " + user.firstname + ", votre nouveau mot de passe est : " + user.password,
        html: "<p>Bonjour " + user.firstname + "</p><p>Votre nouveau mot de passe est : " + user.password + "</p>"
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err)
            console.log("sendPassword KO " + user.emailAddress + " : " + err);
        else
            console.log("sendPassword OK " + user.emailAddress + " : " + info.response);
    });
}

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Users
 *     description: Anonymous - Log a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Login object
 *         in:  body
 *         required: true
 *         type: object
 *         properties:
 *           email:
 *             type: string
 *           password:
 *             type: string
 *             format: password
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - password is incorrect or the account is inactive or banned
 *       400:
 *         description: Error - the email address is missing or invalid
 *       200:
 *         description: A validation token
 */
router.post('/login', function(req, res) {
    let emailUser = req.body.email;
    let passwordUser = req.body.password;

    if (emailUser && passwordUser) {
        if (utils.isEmailValid(emailUser)) {
            userModel.findOne({emailAddress: emailUser}, function (err, user) {
                if (err)
                    res.status(500).json({message: err});
                else if (!user)
                    res.status(400).json({message: "Cette adresse email n'est associée à aucun compte"});
                else {
                    switch (user.status) {
                        case "banni":
                            res.status(403).json({message: "Votre compte a été banni, contactez l'administrateur à l'adresse suivante : admin@logisimply.fr"});
                            break;

                        case "inactif":
                            res.status(403).json({message: "Vous devez activer votre compte, un email vous a été envoyé à votre adresse email"});
                            break;

                        case "actif":
                            if (user.password === md5(passwordUser)) {
                                jwt.sign(JSON.stringify(user.shortUser()), "zkfgjrezfj852", function (err, token) {
                                    if (err)
                                        res.status(500).json({message: "Erreur lors de la génération du token : " + err});
                                    else
                                        res.status(200).json({token: token});
                                });
                            } else res.status(403).json({message: "Le mot de passe est incorrect"});
                            break;
                    }
                }
            });
        } else
            res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
    } else
        res.status(400).json({message: "Login et/ou mot de passe non renseignés !"});
});

/**
 * @swagger
 * /users/add:
 *   post:
 *     tags:
 *       - Users
 *     description: Anonymous - Create a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: User object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Error - missing fields or email invalid or email already used
 *       200:
 *         description: User created and activation email sent by email
 */
router.post('/add', function(req, res) {
    let addUser = req.body;
    addUser.status = "inactif";
    addUser.activationToken = md5(req.body.emailAddress);
    addUser.password = md5(addUser.password);

    if (addUser.firstname && addUser.lastname && addUser.activityEntitled && addUser.activityStarted && addUser.siret && addUser.address && addUser.zipCode && addUser.town) {
        if (utils.isEmailValid(addUser.emailAddress)) {
            userModel.find({emailAddress: addUser.emailAddress}, function (err, user) {
                if (err)
                    res.status(500).json({message: err});
                else if (user.length !== 0)
                    res.status(400).json({message: "Cette adresse email est déjà associée à un compte"});
                else {
                    userModel.create(addUser, function (err) {
                        if (err)
                            res.status(500).json({message: err});
                        else {
                            sendActivationUrl({emailAddress: addUser.emailAddress, firstname: addUser.firstname, activationToken: addUser.activationToken});
                            res.status(200).json({message: "Compte créé avec succès"});
                        }
                    });
                }
            });
        } else
            res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
    } else
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
});

/**
 * @swagger
 * /users/activate/{token}:
 *   get:
 *     tags:
 *       - Users
 *     description: Anonymous - Activate a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: User activation token
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Render Error
 *       200:
 *         description: Render Success
 */
router.get('/activate/:token', function(req, res) {
    let activationToken = req.params.token;
    userModel.findOne({status: "inactif", activationToken: activationToken}, function (err, user){
        if (err)
            res.render("error", {message: err});
        else if (!user)
            res.render("error", {message: "Aucun compte inactif ne correspond à ce jeton d'activation"})
        else {
            user.status = "actif";
            user.activationToken = "";
            user.save();
            res.render("activate", {user: user});
        }
    });
});

/**
 * @swagger
 * /users/forgetPassword:
 *   post:
 *     tags:
 *       - Users
 *     description: Anonymous - Password forgotten
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: A valid email
 *         in: body
 *         required: true
 *         type: object
 *         properties:
 *           email:
 *             type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Error - email invalid or user doesn't exist
 *       200:
 *         description: New password sent by email
 */
router.post('/forgetPassword', function(req, res) {
    let emailUser = req.body.emailAddress

    if (utils.isEmailValid(emailUser)) {
        userModel.findOne({status: "actif", emailAddress: emailUser}, function (err, user){
            if (err)
                res.status(500).json({message: err});
            else if (!user)
                res.status(400).json({message: "Aucun compte actif ne correspond à cette adresse mail"});
            else {
                let newPassword = Math.floor(Math.random() * 999999) + 100000;
                user.password = md5("" + newPassword);
                user.save();
                sendPassword({firstname: user.firstname, emailAddress: user.emailAddress, password: newPassword});
                res.status(200).json({message: "Un nouveau mot de passe vous a été envoyé par email"});
            }
        });
    } else
        res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
});

/**
 * @swagger
 * /users/resendActivationUrl:
 *   post:
 *     tags:
 *       - Users
 *     description: Anonymous - Send new activattion token
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: A valid email
 *         in: body
 *         required: true
 *         type: object
 *         properties:
 *           email:
 *             type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Error - email invalid or user doesn't exist
 *       200:
 *         description: New activation link is sent by email
 */
router.post('/resendActivationUrl', function(req, res) {
    let emailUser = req.body.emailAddress

    if (utils.isEmailValid(emailUser)) {
        userModel.findOne({status: "inactif", emailAddress: emailUser}, function (err, user){
            if (err)
                res.status(500).json({message: err});
            else if (!user)
                res.status(400).json({message: "Aucun compte inactif ne correspond à cette adresse mail"});
            else {
                sendActivationUrl({emailAddress: user.emailAddress, firstname: user.firstname, activationToken: user.activationToken});
                res.status(200).json({message: "Un lien vous a été renvoyé à votre adresse email"});
            }
        });
    } else
        res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
});

router.use(utils.isLogged);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     description: Logged - Get logged user's information
 *     produces:
 *       - application/json
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: The current user object
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/me', function(req, res) {
    res.status(200).json(req.loggedUser);
});

/**
 * @swagger
 * /users/update:
 *   put:
 *     tags:
 *       - Users
 *     description: Logged - Update logged user's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: The user to update
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: A new validation token
 */
router.put('/update', function(req, res) {
    let updateUser = req.body;
    updateUser.password = md5(updateUser.password);
    userModel.findByIdAndUpdate(decoded._id, updateUser, null, function(err, user) {
        if (err)
            res.status(500).json({message: err});
        else {
            jwt.sign(JSON.stringify(updateUser.shortUser()), "zkfgjrezfj852", function(err, token) {
                if (err)
                    res.status(500).json({message: err});
                else
                    res.status(200).json({token: token});
            });
        }
    });
});

module.exports = router;