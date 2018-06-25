var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var md5 = require('md5');
var transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: 'contact.logisimply@gmail.com',
        pass: '@dminLogisimply00'
    }
});

mongoose.connect('mongodb://172.18.0.2:27017/logisimply');

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
 *       sirenSiret:
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
 *       - sirenSiret
 *       - address
 *       - zipCode
 *       - town
 *       - emailAddress
 *       - password
 *   EmailUser:
 *     type: object
 *     required:
 *       - email
 *     properties:
 *       email:
 *         type: string
 *   TokenUser:
 *     type: object
 *     required:
 *       - token
 *     properties:
 *       token:
 *         type: string
 *   UpdateUser:
 *     type: object
 *     required:
 *       - token
 *       - user
 *     properties:
 *       token:
 *         type: string
 *       user:
 *         $ref: '#/definitions/User'
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     description: Create a user
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
 *       400:
 *         description: Error
 *       200:
 *         description: Success
 */
router.post('/register', function(req, res) {
    let addUser = req.body;
    addUser.status = "inactif";
    addUser.activationToken = md5(req.body.emailAddress);
    addUser.password = md5(addUser.password);

    if (addUser.firstname && addUser.lastname && addUser.activityEntitled && addUser.activityStarted && addUser.sirenSiret && addUser.address && addUser.zipCode && addUser.town) {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (regex.test(String(addUser.emailAddress).toLowerCase())) {
            userModel.find({emailAddress: addUser.emailAddress}, function (err, user) {
                if (!err && user.length !== 0) {
                    res.status(400).json({message: "Cette adresse email est déjà associée à un compte"});
                } else {
                    userModel.create(addUser, function (err) {
                        if (err) {
                            res.status(400).json({message: err});
                        } else {
                            let url = "http://" + req.headers.host + "/api/users/activate/" + addUser.activationToken;
                            sendActivationUrl({emailAddress: addUser.emailAddress, firstname: addUser.firstname}, url);
                            res.status(200).json({message: "Compte créé avec succès"});
                        }
                    });
                }
            });
        } else {
            res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
        }
    } else {
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
    }
});

/**
 * @swagger
 * /users/activate/{token}:
 *   get:
 *     tags:
 *       - Users
 *     description: Activate a user
 *     produces:
 *       - application/json
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Error
 *       200:
 *         description: Success
 */
router.get('/activate/:token', function(req, res) {
    let activationToken = req.params.token;
    userModel.findOne({status: "inactif", activationToken: activationToken}, function (err, user){
        if (err) {
            res.status(500).json({message: err});
        } else if (!user) {
            res.status(400).json({message: "Aucun compte inactif ne correspond à ce jeton d'activation"});
        } else {
            user.status = "actif";
            user.activationToken = "";
            user.save();
            res.status(200).json({message: "Votre compte a été activé"});
        }
    });
});

/**
 * @swagger
 * /users/forgetPassword:
 *   post:
 *     tags:
 *       - Users
 *     description: New password for the user
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: A valid email
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/EmailUser'
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: An error message because the email doesn't exist
 *       200:
 *         description: A new password has been sent by email
 */
router.post('/forgetPassword', function(req, res) {
    let emailUser = req.body.emailAddress;
    userModel.findOne({status: "actif", emailAddress: emailUser}, function (err, user){
        if (err) {
            res.status(500).json({message: err});
        } else if (!user) {
            res.status(400).json({message: "Aucun compte actif ne correspond à cette adresse mail"});
        } else {
            let newPassword = Math.floor(Math.random() * 999999) + 100000;
            user.password = md5("" + newPassword);
            user.save();
            sendPassword({firstname: user.firstname, emailAddress: user.emailAddress, password: newPassword});
            res.status(200).json({message: "Un nouveau mot de passe vous a été envoyé par email"});
        }
    });
});

/**
 * @swagger
 * /users/resendActivationUrl:
 *   post:
 *     tags:
 *       - Users
 *     description: The activation's link is resend to the user
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: A valid email
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/EmailUser'
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: An error message because the account is already activate or user doesn't exist
 *       200:
 *         description: The new activation link is sent
 */
router.post('/resendActivationUrl', function(req, res) {
    let emailUser = req.body.emailAddress;
    userModel.findOne({status: "inactif", emailAddress: emailUser}, function (err, user){
        if (err) {
            res.status(500).json({message: err});
        } else if (!user) {
            res.status(400).json({message: "Aucun compte inactif ne correspond à cette adresse mail"});
        } else {
            let url = "http://" + req.headers.host + "/api/users/activate/" + user.activationToken;
            sendActivationUrl({emailAddress: user.emailAddress, firstname: user.firstname}, url);
            res.status(200).json({message: "Un lien vous a été renvoyé à votre adresse email"});
        }
    });
});

/**
 * @swagger
 * /users/me:
 *   post:
 *     tags:
 *       - Users
 *     description: Get logged user's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: User's token
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/TokenUser'
 *     responses:
 *       403:
 *         description: An error message because user is logged out
 *       200:
 *         description: The current user object
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.post('/me', function(req, res) {
    jwt.verify(req.body.token, "zkfgjrezfj852", function(err, decoded) {
        if (err) {
            let url = "http://" + req.headers.host + "/login";
            res.status(403).json({message: "Vous devez d'abord vous connecter. Lien : " + url});
        } else {
            res.status(200).json(decoded);
        };
    });
});

/**
 * @swagger
 * /users/update:
 *   post:
 *     tags:
 *       - Users
 *     description: Update logged user's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: User's token
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/UpdateUser'
 *     responses:
 *       500:
 *         description: An error message on user's update
 *       403:
 *         description: An error message because user is logged out
 *       200:
 *         description: The current user object
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.put('/update', function(req, res) {
    jwt.verify(req.body.token, "zkfgjrezfj852", function(err, decoded) {
        if (err) {
            let url = "http://" + req.headers.host + "/login";
            res.status(403).json({message: "Vous devez d'abord vous connecter. Lien : " + url});
        } else {
            let updateUser = req.body.user;
            updateUser.password = md5(updateUser.password);
            updateUser.status = decoded.status;
            updateUser.activationToken = decoded.activationToken;

            userModel.findByIdAndUpdate(decoded._id, updateUser, null, function(err, user) {
                if (err) {
                    res.status(500).json({message: "Problème lors de la mise à jour du compte"});
                } else {
                    res.status(200).json({message: "RESEND TOKEN !!!!!!!!!!!!!!!!!!!"});
                }
            });
        };
    });
});

function sendActivationUrl(user, url) {

    var mailOptions = {
        from: 'contact.logisimply@gmail.com',
        to: user.emailAddress,
        subject: "Activation de votre compte Logisimply",
        text: "Bonjour " + user.firstname + ", veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : " + url,
        html: "<p>Bonjour " + user.firstname + "</p><p>Veuillez cliquer sur le lien suivant pour activer votre compte Logisimply : <b><a href='" + url + "' target='_blank'>Lien</a></p>"
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err){
            console.log("sendActivationUrl KO " + user.emailAddress + " : " + err);
        } else {
            console.log("sendActivationUrl OK " + user.emailAddress + " : " + info.response);
        }
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
        if (err){
            console.log("sendPassword KO " + user.emailAddress + " : " + err);
        } else {
            console.log("sendPassword OK " + user.emailAddress + " : " + info.response);
        }
    });
}

module.exports = router;