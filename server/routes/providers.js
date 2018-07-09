let express = require("express");
let router = express.Router();
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let localization = require("../localization/fr_FR");
let userModel = require("../models/User");
let providerModel = require("../models/Provider");

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
 *       idUser:
 *         type: string
 *       createdAt:
 *         type: string
 *         format: date
 *       updatedAt:
 *         type: string
 *         format: date
 *     required:
 *       - companyName
 *       - legalForm
 *       - siret
 *       - email
 *       - address
 *       - zipCode
 *       - town
 *       - idUser
 */

router.use(middleware.promises);
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
router.post("/add", async (req, res) => {
    let paramProvider = req.body;
    if (!(paramProvider.companyName && paramProvider.legalForm && paramProvider.siret && paramProvider.email && paramProvider.website && paramProvider.address && paramProvider.zipCode && paramProvider.town))
        res.status(400).json({message: localization.fields.required});
    else if (!utils.isEmailValid(paramProvider.email))
        res.status(400).json({message: localization.email.invalid});
    else {
        let count = await providerModel.count({email: paramProvider.email, siret: paramProvider.siret, idUser: req.loggedUser._id});
        if (count !== 0)
            res.status(400).json({message: localization.providers.used});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            let nextCode = "00000" + user.parameters.providers;
            user.parameters.providers += 1;
            user.save();
            paramProvider.code = "P" + nextCode.substring(nextCode.length - 5, nextCode.length);
            paramProvider.idUser = req.loggedUser._id;
            paramProvider.createdAt = new Date();
            let provider = await providerModel.create(paramProvider);
            res.status(200).json({message: localization.providers.add, data: provider});
        }
    }
});

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
router.get("/me", async (req, res) => {
    let providers = await providerModel.find({idUser: req.loggedUser._id});
    res.status(200).json(providers);
});

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
router.get("/:code", async (req, res) => {
    let paramCode = req.params.code;
    let provider = await providerModel.findOne({code: paramCode, idUser: req.loggedUser._id});
    if (!provider)
        res.status(400).json({message: localization.providers.code.failed});
    else
        res.status(200).json(provider);
});

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
router.put("/update", async (req, res) => {
    let paramProvider = req.body;
    if (!(paramProvider.companyName && paramProvider.legalForm && paramProvider.siret && paramProvider.email && paramProvider.website && paramProvider.address && paramProvider.zipCode && paramProvider.town))
        res.status(400).json({message: localization.fields.required});
    else if (!utils.isEmailValid(paramProvider.email))
        res.status(400).json({message: localization.email.invalid});
    else {
        paramProvider.updatedAt = new Date();
        let provider = await providerModel.findOneAndUpdate({code: paramProvider.code, idUser: req.loggedUser._id}, paramProvider, null);
        if (!provider)
            res.status(400).json({message: localization.providers.code.failed});
        else
            res.status(200).json({message: localization.providers.update, data: provider});
    }
});

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
 *         description: Provider deleted
 *         schema:
 *           $ref: '#/definitions/Provider'
 */
router.delete("/delete/:code", async (req, res) => {
    let paramCode = req.params.code;
    let provider = await providerModel.findOneAndRemove({code: paramCode, idUser: req.loggedUser._id});
    if (!provider)
        res.status(400).json({message: localization.providers.code.failed});
    else
        res.status(200).json({message: localization.providers.delete.one, data: provider});
});

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
 *           type: array
 *           items:
 *             $ref: '#/definitions/Provider'
 */
router.post("/delete", async (req, res) => {
    let paramProviders = req.body;
    let providers = [];
    for (let i = 0; i < paramProviders.length; i++) {
        let provider = await providerModel.findOneAndRemove({code: paramProviders[i].code, idUser: req.loggedUser._id});
        if (provider)
            providers.push(provider);
    }
    res.status(200).json({message: localization.providers.delete.multiple, data: providers});
});

module.exports = router;