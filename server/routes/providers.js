let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let userModel = require("../models/User");
let providerModel = require("../models/Provider");
let express = require("express");
let router = express.Router();

/**
 * @swagger
 * definition:
 *   Provider:
 *     type: object
 *     properties:
 *       code:
 *         type: string
 *       companyName:
 *         type: string
 *       legalForm:
 *         type: string
 *       siret:
 *         type: string
 *       phone:
 *         type: string
 *       email:
 *         type: string
 *       website:
 *         type: string
 *       address:
 *         type: string
 *       zipCode:
 *         type: string
 *       town:
 *         type: string
 *       country:
 *         type: string
 *       user:
 *         type: string
 *       createdAt:
 *         type: date
 *       updatedAt:
 *         type: date
 *     required:
 *       - companyName
 *       - legalForm
 *       - siret
 *       - email
 *       - address
 *       - zipCode
 *       - town
 *       - country
 */

router.use(middleware.localize);
router.use(middleware.isLogged);

/**
 * @swagger
 * /providers/add:
 *   post:
 *     tags:
 *       - Providers
 *     description: Logged - Create a provider
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Provider object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Provider'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - missing fields or email invalid or provider already exists
 *       200:
 *         description: Provider created
 *         schema:
 *           $ref: '#/definitions/Provider'
 */
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramProvider = req.body;
    if (!utils.isProviderComplete(paramProvider))
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramProvider.email))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        let count = await providerModel.countDocuments({email: paramProvider.email, siret: paramProvider.siret, user: req.loggedUser._id});
        if (count !== 0)
            res.status(400).json({message: localization[req.language].providers.code.used});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.providers += 1;
            user.save();
            paramProvider.code = "P" + utils.getCode(user.parameters.providers);
            paramProvider.user = req.loggedUser._id;
            paramProvider.createdAt = new Date();
            let provider = await providerModel.create(paramProvider);
            let result = await provider.fullFormat();
            res.status(200).json({message: localization[req.language].providers.add, data: result});
        }
    }
}));

/**
 * @swagger
 * /providers/me:
 *   get:
 *     tags:
 *       - Providers
 *     description: Logged - Get all of my providers
 *     produces:
 *       - application/json
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An array of requested providers
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Provider'
 */
router.get("/me", middleware.wrapper(async (req, res) => {
    let providers = await providerModel.find({user: req.loggedUser._id});
    for (let i = 0; i < providers.length; i++)
        providers[i] = await providers[i].fullFormat();
    res.status(200).json(providers);
}));

/**
 * @swagger
 * /providers/{code}:
 *   get:
 *     tags:
 *       - Providers
 *     description: Logged - Get one of my providers
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Provider's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no provider for code
 *       200:
 *         description: An object of the requested provider
 *         schema:
 *           $ref: '#/definitions/Provider'
 */
router.get("/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let provider = await providerModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!provider)
        res.status(400).json({message: localization[req.language].providers.code.failed});
    else {
        let result = await provider.fullFormat();
        res.status(200).json(result);
    }
}));

/**
 * @swagger
 * /providers/update:
 *   put:
 *     tags:
 *       - Providers
 *     description: Logged - Update provider's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Provider's id
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Provider'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no provider for code
 *       200:
 *         description: Provider updated
 *         schema:
 *           $ref: '#/definitions/Provider'
 */
router.put("/update", middleware.wrapper(async (req, res) => {
    let paramProvider = req.body;
    if (!utils.isProviderComplete(paramProvider))
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramProvider.email))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        paramProvider.updatedAt = new Date();
        await providerModel.findOneAndUpdate({code: paramProvider.code, user: req.loggedUser._id}, paramProvider, null);
        let provider = await providerModel.findOne({code: paramProvider.code, user: req.loggedUser._id});
        if (!provider)
            res.status(400).json({message: localization[req.language].providers.code.failed});
        else {
            let result = await provider.fullFormat();
            res.status(200).json({message: localization[req.language].providers.update, data: result});
        }
    }
}));

/**
 * @swagger
 * /providers/delete/{code}:
 *   delete:
 *     tags:
 *       - Providers
 *     description: Logged - Delete a provider
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Provider to update
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no provider for code
 *       200:
 *         description: Provider deleted
 *         schema:
 *           $ref: '#/definitions/Provider'
 */
router.delete("/delete/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let provider = await providerModel.findOneAndRemove({code: paramCode, user: req.loggedUser._id});
    if (!provider)
        res.status(400).json({message: localization[req.language].providers.code.failed});
    else {
        let result = await provider.fullFormat();
        res.status(200).json({message: localization[req.language].providers.delete.one, data: result});
    }
}));

/**
 * @swagger
 * /providers/delete:
 *   post:
 *     tags:
 *       - Providers
 *     description: Logged - Delete multiple providers
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Providers to delete
 *         in: body
 *         required: true
 *         type: array
 *         items:
 *           $ref: '#/definitions/Provider'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Providers deleted
 *         schema:
 *           type: number
 */
router.post("/delete", middleware.wrapper(async (req, res) => {
    let paramProviders = req.body;
    let count = 0;
    for (let i = 0; i < paramProviders.length; i++) {
        let provider = await providerModel.findOneAndRemove({code: paramProviders[i].code, user: req.loggedUser._id});
        if (provider)
            count++;
    }
    res.status(200).json({message: localization[req.language].providers.delete.multiple, data: count});
}));

module.exports = router;