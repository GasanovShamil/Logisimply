var config = require('../config.json');
var utils = require('../helpers/utils');
var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var md5 = require('md5');

mongoose.connect('mongodb://' + config.host + ':' + config.port + '/' + config.database);

/**
 * @swagger
 * definition:
 *   Login:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 */

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
 *         schema:
 *           $ref: '#/definitions/Login'
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - password is incorrect or the account is inactive or banned
 *       400:
 *         description: Error - thz email address is missing or invalid
 *       200:
 *         description: A validation token
 */
router.post('/', function(req, res) {
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

module.exports = router;