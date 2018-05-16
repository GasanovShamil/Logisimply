var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var mailer = require('mailer');
mongoose.connect('mongodb://172.18.0.2:27017/logisimply');

// Create a users
router.post('/addUser', function(req, res) {
    let addUser = req.body;
    addUser.status = "inactif";
    addUser.activationToken = "blablabla";

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
                            res.status(200).json({message: "Compte créé avec succès"});
                            let url = "http://google.com";
                            mailer.sendActivationUrl({emailAddress: addUser.emailAddress, firstname: addUser.firstname}, url);
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

// Activate user
router.get('/activate/:token', function(req, res) {
    let activationToken = req.params.token;
    userModel.findOne({status: "inactif", activationToken: activationToken}, function (err, user){
        if (err) {
            res.status(500).json({message: err});
        } else if (!user) {
            res.status(400).json({message: "Aucun compte ne correspond à ce jeton d'activation"});
        } else {
            user.status = "actif";
            user.activationToken = "";
            user.save();
            res.status(200).json({message: "Votre compte a été activé"});
        }
    });
});

module.exports = router;
