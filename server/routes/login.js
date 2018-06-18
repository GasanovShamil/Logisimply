var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var md5 = require('md5');

mongoose.connect('mongodb://172.18.0.2:27017/logisimply');

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Login
 *     description: Log a user
 *     produces:
 *       - application/json
 *     responses:
 *       403:
 *         description: An error message because the account is inactive or banned
 *         schema:
 *           message: String
*        500:
 *         description: An error message on token's generation
 *         schema:
 *           message: String
 *       400:
 *         description: An error message because the password is incorrect
 *         schema:
 *           message: String
 *       200:
 *         description: A validation token
 *         schema:
 *           token: String
 */

router.post('/', function(req, res) {
    let emailUser = req.body.email;
    let passwordUser = req.body.password;
    if (emailUser && passwordUser) {
        userModel.findOne({emailAddress:emailUser}, function (err, user) {
            if (err) {
                res.status(400).json({message: "Cette adresse email n'est associée à aucun compte"});
            } else {
                switch(user.status){
                    case "banni":
                        res.status(403).json({message: "Votre compte a été banni, contactez l'administrateur à l'adresse suivante : admin@logisimply.fr"});
                    break;

                    case "inactif":
                        res.status(403).json({message: "Vous devez activer votre compte, un email vous a été envoyé à votre adresse"});
                    break;

                    case "actif":
                        if (user.password === md5(passwordUser)) {
                            let loggedUser = {
                                name: user.name,
                                firstname: user.firstname,
                                _id: user.id
                            };

                            jwt.sign(loggedUser, "zkfgjrezfj852", (err, token) => {
                                if (err)
                                    res.status(500).json({message: "Erreur lors de la génération du token"});
                                else
                                    res.status(200).json({token: token});
                            });
                        } else {
                            res.status(400).json({message: "Le mot de passe est incorrect"});
                        }
                    break;
                }
            }
        });
    } else {
        res.json({status: 400, message: 'Login et/ou mot de passe non renseignés !'});
    }
});

module.exports = router;