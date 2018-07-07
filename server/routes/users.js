let express = require("express");
let router = express.Router();
let utils = require("../helpers/utils");
let jwt = require("jsonwebtoken");
let md5 = require("md5");
let userModel = require("../models/User");

/**
 * @swagger
 * definition:
 *   User:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *       firstname:
 *         type: string
 *       lastname:
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
 *         type: Date
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
 *       status:
 *         type: string
 *       activationToken:
 *         type: string
 *       createdAt:
 *         type: Date
 *       updatedAt:
 *         type: Date
 *     required:
 *       - email
 *       - password
 *       - firstname
 *       - lastname
 *       - activityEntitled
 *       - activityStarted
 *       - siret
 *       - address
 *       - zipCode
 *       - town
 */

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
router.post("/add", function(req, res) {
    let paramUser = req.body;
    paramUser.status = "inactif";
    paramUser.activationToken = md5(paramUser.email);
    paramUser.password = md5(paramUser.password);
    paramUser.createdAt = new Date();

    if (!(paramUser.email && paramUser.password && paramUser.firstname && paramUser.lastname && paramUser.activityEntitled && paramUser.activityStarted && paramUser.siret && paramUser.address && paramUser.zipCode && paramUser.town))
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
    else if (!utils.isEmailValid(paramUser.email))
        res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
    else
        userModel.find({email: paramUser.email}, function (err, user) {
            if (err)
                res.status(500).json({message: err});
            else if (user.length !== 0)
                res.status(400).json({message: "Cette adresse email est déjà associée à un compte"});
            else {
                userModel.create(paramUser, function (err, user) {
                    if (err)
                        res.status(500).json({message: err});
                    else {
                        user.sendActivationUrl();
                        res.status(200).json({message: "Compte créé avec succès"});
                    }
                });
            }
        });
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
router.get("/activate/:token", function(req, res) {
    let paramToken = req.params.token;
    userModel.findOne({status: "inactif", activationToken: paramToken}, function (err, user){
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
router.post("/forgetPassword", function(req, res) {
    let paramEmail = req.body.email;

    if (utils.isEmailValid(paramEmail)) {
        userModel.findOne({status: "actif", email: paramEmail}, function (err, user){
            if (err)
                res.status(500).json({message: err});
            else if (!user)
                res.status(400).json({message: "Aucun compte actif ne correspond à cette adresse mail"});
            else {
                let newPassword = Math.floor(Math.random() * 999999) + 100000;
                user.password = md5("" + newPassword);
                user.save();
                user.sendPassword();
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
router.post("/resendActivationUrl", function(req, res) {
    let emailUser = req.body.email;

    if (utils.isEmailValid(emailUser)) {
        userModel.findOne({status: "inactif", email: emailUser}, function (err, user){
            if (err)
                res.status(500).json({message: err});
            else if (!user)
                res.status(400).json({message: "Aucun compte inactif ne correspond à cette adresse mail"});
            else {
                user.sendActivationUrl();
                res.status(200).json({message: "Un lien vous a été renvoyé à votre adresse email"});
            }
        });
    } else
        res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
});

/**
 * @swagger
 * /users/login:
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
router.post("/login", function(req, res) {
    let emailUser = req.body.email;
    let passwordUser = req.body.password;

    if (emailUser && passwordUser) {
        if (utils.isEmailValid(emailUser)) {
            userModel.findOne({email: emailUser}, function (err, user) {
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
router.get("/me", function(req, res) {
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
router.put("/update", function(req, res) {
    let paramUser = req.body;
    paramUser.password = md5(paramUser.password);
    paramUser.updatedAt = new Date();

    userModel.findByIdAndUpdate(req.loggedUser._id, paramUser, null, function(err, user) {
        if (err)
            res.status(500).json({message: err});
        else {
            jwt.sign(JSON.stringify(user.shortUser()), "zkfgjrezfj852", function(err, token) {
                if (err)
                    res.status(500).json({message: err});
                else
                    res.status(200).json({token: token});
            });
        }
    });
});

module.exports = router;