let config = require("../config");
let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let mailer = require("../helpers/mailer");
let userModel = require("../models/User");
let express = require("express");
let router = express.Router();
let jwt = require("jsonwebtoken");
let md5 = require("md5");

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
 *         type: date
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
 *         type: date
 *       updatedAt:
 *         type: date
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

router.use(middleware.localize);

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
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramUser = req.body;
    if (!utils.isUserComplete(paramUser))
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramUser.email))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        let count = await userModel.countDocuments({email: paramUser.email});
        if (count !== 0)
            res.status(400).json({message: localization[req.language].users.email.used});
        else {
            paramUser.status = "inactive";
            paramUser.activationToken = md5(paramUser.email);
            paramUser.password = md5(paramUser.password);
            paramUser.createdAt = new Date();
            paramUser.parameters = {customers: 0, providers: 0, quotes: 0, invoices: 0};
            let user = await userModel.create(paramUser);
            mailer.sendActivationUrl(user, req.language);
            res.status(200).json({message: localization[req.language].users.add});
        }
    }
}));

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
 *       default:
 *         description: Render
 */
router.get("/activate/:token", middleware.wrapper(async (req, res) => {
    let paramToken = req.params.token;
    let user = await userModel.findOne({status: "inactive", activationToken: paramToken});
    if (!user)
        res.render("error", {message: localization[req.language].users.token.failed})
    else {
        user.status = "active";
        user.activationToken = "";
        user.save();
        res.render("activate", {user: user});
    }
}));

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
router.post("/forgetPassword", middleware.wrapper(async (req, res) => {
    let paramEmail = req.body.email;
    if (!paramEmail)
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramEmail))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        let user = await userModel.findOne({status: "active", email: paramEmail});
        if (!user)
            res.status(400).json({message: localization[req.language].users.email.failed});
        else {
            let newPassword = Math.floor(Math.random() * 999999) + 100000;
            user.password = md5("" + newPassword);
            user.save();
            mailer.sendPassword(user, req.language);
            res.status(200).json({message: localization[req.language].users.password.new});
        }
    }
}));

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
router.post("/resendActivationUrl", middleware.wrapper(async (req, res) => {
    let paramEmail = req.body.email;
    if (!paramEmail)
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramEmail))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        let user = await userModel.findOne({status: "inactive", email: paramEmail});
        if (!user)
            res.status(400).json({message: localization[req.language].users.email.failed});
        else {
            mailer.sendActivationUrl(user, req.language);
            res.status(200).json({message: localization[req.language].users.link});
        }
    }
}));

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
router.post("/login", middleware.wrapper(async (req, res) => {
    let paramEmail = req.body.email;
    let paramPassword = req.body.password;
    if (!(paramEmail && paramPassword))
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramEmail))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        let user = await userModel.findOne({email: paramEmail});
        if (!user)
            res.status(400).json({message: localization[req.language].users.email.failed});
        else
            switch (user.status) {
                case "banned":
                    res.status(403).json({message: localization[req.language].users.banned});
                    break;

                case "inactive":
                    res.status(403).json({message: localization[req.language].users.inactive});
                    break;

                case "active":
                    if (user.password === md5(paramPassword))
                        jwt.sign(JSON.stringify(user.shortUser()), config.jwt_key, function (err, token) {
                            if (err)
                                res.status(500).json({message: err});
                            else
                                res.status(200).json({token: token});
                        });
                    else res.status(403).json({message: localization[req.language].users.password.failed});
                    break;
            }
    }
}));

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
router.get("/me", middleware.wrapper(async (req, res) => {
    res.status(200).json(req.loggedUser);
}));

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
 *       - description: User to update
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
router.put("/update", middleware.wrapper(async (req, res) => {
    let paramUser = req.body;
    if (!utils.isUserComplete(paramUser))
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramUser.email))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        paramUser.password = md5(paramUser.password);
        paramUser.updatedAt = new Date();
        await userModel.findOneAndUpdate({_id: req.loggedUser._id}, paramUser, null);
        let user = await userModel.findOne({_id: req.loggedUser._id});
        jwt.sign(JSON.stringify(user.shortUser()), config.jwt_key, function(err, token) {
            if (err)
                res.status(500).json({message: err});
            else
                res.status(200).json({message: localization[req.language].users.update, token: token});
        });
    }
}));

module.exports = router;