let express = require("express");
let router = express.Router();
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let config = require("../config.json");
let localization = require("../localization/fr_FR");
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
 *         type: string
 *         format: date
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
 *         type: string
 *         format: date
 *       updatedAt:
 *         type: string
 *         format: date
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
 *       400:
 *         description: Error - missing fields or email invalid or email already used
 *       200:
 *         description: User created and activation email sent by email
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.post("/add", async (req, res) => {
    let paramUser = req.body;
    if (!(paramUser.email && paramUser.password && paramUser.firstname && paramUser.lastname && paramUser.activityEntitled && paramUser.activityStarted && paramUser.siret && paramUser.address && paramUser.zipCode && paramUser.town))
        res.status(400).json({message: localization.fields.required});
    else if (!utils.isEmailValid(paramUser.email))
        res.status(400).json({message: localization.email.invalid});
    else {
        let count = await userModel.count({email: paramUser.email});
        if (count !== 0)
            res.status(400).json({message: localization.users.email.used});
        else {
            paramUser.status = "inactif";
            paramUser.activationToken = md5(paramUser.email);
            paramUser.password = md5(paramUser.password);
            paramUser.createdAt = new Date();
            paramUser.parameters = {customers: 1, providers: 1, quotes: 1, bills: 1};
            let user = await userModel.create(paramUser);
            user.sendActivationUrl();
            res.status(200).json({message: localization.users.add});
        }
    }
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
 *       400:
 *         description: Render Error
 *       200:
 *         description: Render Success
 */
router.get("/activate/:token", async (req, res) => {
    let paramToken = req.params.token;
    let user = await userModel.findOne({status: "inactif", activationToken: paramToken});
    if (!user)
        res.render("error", {message: localization.users.token.failed})
    else {
        user.status = "actif";
        user.activationToken = "";
        user.save();
        res.render("activate", {user: user});
    }
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
 *       400:
 *         description: Error - email invalid or user doesn't exist
 *       200:
 *         description: New password sent by email
 */
router.post("/forgetPassword", async (req, res) => {
    let paramEmail = req.body.email;
    if (!paramEmail)
        res.status(400).json({message: localization.fields.required});
    else if (!utils.isEmailValid(paramEmail))
        res.status(400).json({message: localization.email.invalid});
    else {
        let user = await userModel.findOne({status: "actif", email: paramEmail});
        if (!user)
            res.status(400).json({message: localization.users.email.failed});
        else {
            let newPassword = Math.floor(Math.random() * 999999) + 100000;
            user.password = md5("" + newPassword);
            user.save();
            user.sendPassword();
            res.status(200).json({message: localization.users.password.new});
        }
    }
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
 *       400:
 *         description: Error - email invalid or user doesn't exist
 *       200:
 *         description: New activation link is sent by email
 */
router.post("/resendActivationUrl", async (req, res) => {
    let paramEmail = req.body.email;
    if (!paramEmail)
        res.status(400).json({message: localization.fields.required});
    else if (!utils.isEmailValid(paramEmail))
        res.status(400).json({message: localization.email.invalid});
    else {
        let user = await userModel.findOne({status: "inactif", email: paramEmail});
        if (!user)
            res.status(400).json({message: localization.users.email.failed});
        else {
            user.sendActivationUrl();
            res.status(200).json({message: localization.users.link});
        }
    }
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
 *         description: Error - token generation
 *       403:
 *         description: Error - password is incorrect or the account is inactive or banned
 *       400:
 *         description: Error - the email address is missing or invalid
 *       200:
 *         description: A validation token
 */
router.post("/login", async (req, res) => {
    let paramEmail = req.body.email;
    let paramPassword = req.body.password;
    if (!(paramEmail && paramPassword))
        res.status(400).json({message: localization.fields.required});
    else if (!utils.isEmailValid(paramEmail))
        res.status(400).json({message: localization.email.invalid});
    else {
        let user = await userModel.findOne({email: paramEmail});
        if (!user)
            res.status(400).json({message: localization.users.email.failed});
        else
            switch (user.status) {
                case "banni":
                    res.status(403).json({message: localization.users.banned});
                    break;

                case "inactif":
                    res.status(403).json({message: localization.users.inactive});
                    break;

                case "actif":
                    if (user.password === md5(paramPassword))
                        jwt.sign(JSON.stringify(user.shortUser()), config.jwt_key, function (err, token) {
                            if (err)
                                res.status(500).json({message: err});
                            else
                                res.status(200).json({token: token});
                        });
                    else res.status(403).json({message: localization.users.password.failed});
                    break;
            }
    }
});

router.use(middleware.isLogged);

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
 *         description: Error - token generation
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: A new validation token
 */
router.put("/update", async (req, res) => {
    let paramUser = req.body;
    if (!(paramUser.email && paramUser.password && paramUser.firstname && paramUser.lastname && paramUser.activityEntitled && paramUser.activityStarted && paramUser.siret && paramUser.address && paramUser.zipCode && paramUser.town))
        res.status(400).json({message: localization.fields.required});
    else if (!utils.isEmailValid(paramUser.email))
        res.status(400).json({message: localization.email.invalid});
    else {
        paramUser.password = md5(paramUser.password);
        paramUser.updatedAt = new Date();
        let user = await userModel.findOneAndUpdate({_id: req.loggedUser._id}, paramUser, null);
        jwt.sign(JSON.stringify(user.shortUser()), config.jwt_key, function(err, token) {
            if (err)
                res.status(500).json({message: err});
            else
                res.status(200).json({token: token});
        });
    }
});

module.exports = router;