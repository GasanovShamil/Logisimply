var config = require('../config.json');
var express = require('express');
var router = express.Router();
var providerModel = require('../models/Provider');
var utils = require('../helpers/utils');
const mongoose = require('mongoose');

mongoose.connect('mongodb://' + config.host + ':' + config.port + '/' + config.database);

/**
 * @swagger
 * definition:
 *   Provider:
 *     type: object
 *     properties:
 *       companyName:
 *         type: string
 *       legalForm:
 *         type: string
 *       siret:
 *         type: string
 *       telephone:
 *         type: string
 *       emailAddress:
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
 *     required:
 *       - companyName
 *       - legalForm
 *       - siret
 *       - emailAddress
 *       - address
 *       - zipCode
 *       - town
 *       - idUser
 */

router.use(utils.isLogged);

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
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - missing fields or email invalid or provider already exists
 *       200:
 *         description: Provider created
 */
router.post('/add', function(req, res) {
    let addProvider = req.body;
    addProvider.idUser = req.loggedUser._id;

    if (addProvider.companyName && addProvider.legalForm && addProvider.siret && addProvider.telephone && addProvider.emailAddress && addProvider.website && addProvider.address && addProvider.zipCode && addProvider.town) {
        if (utils.isEmailValid(addProvider.emailAddress)) {
            providerModel.find({emailAddress: addProvider.emailAddress, siret: addProvider.siret, idUser: addProvider.idUser}, function (err, provider) {
                if (err)
                    res.status(500).json({message: err});
                else if (provider.length !== 0)
                    res.status(400).json({message: "Vous avez déjà créer ce fournisseur !"});
                else {
                    providerModel.create(addProvider, function (err) {
                        if (err)
                            res.status(500).json({message: err});
                        else
                            res.status(200).json({message: "Le fournisseur a été créé avec succès"});
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
 * /providers:
 *   get:
 *     tags:
 *       - Providers
 *     description: Logged - Get all of my providers
 *     produces:
 *       - application/json
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An array of requested providers
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Provider'
 */
router.get('/', function(req, res) {
    let myId = req.loggedUser._id;
    providerModel.find({idUser: myId}, function (err, providers) {
        if (err)
            res.status(500).json({message: err});
        else
            res.status(200).json(providers);
    });
});

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     tags:
 *       - Providers
 *     description: Logged - Get one of my providers
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Provider's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An object of the requested provider
 *         schema:
 *           $ref: '#/definitions/Provider'
 */
router.get('/:id', function(req, res) {
    let idProvider = req.params.id;
    let myId = req.loggedUser._id;
    providerModel.findOne({idUser: myId, siret: idProvider}, function (err, provider) {
        if (err)
            res.status(500).json({message: err});
        else
            res.status(200).json(provider);
    });
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
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Provider updated
 */
router.put('/update', function(req, res) {
    let updateProvider = req.body;

    providerModel.findOneAndUpdate({_id: updateProvider._id, idUser: req.loggedUser._id}, updateProvider, null, function(err) {
        if (err)
            res.status(500).json({message: err});
        else
            res.status(200).json({message: "Fournisseur correctement modifié"});
    });
});

/**
 * @swagger
 * /providers/{id]:
 *   delete:
 *     tags:
 *       - Providers
 *     description: Logged - Delete a provider
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Provider's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Provider deleted
 */
router.delete('/:id', function(req, res) {
    let idProvider = req.params.id;
    providerModel.findOneAndRemove({_id: idProvider, idUser: req.loggedUser._id}, function(err, provider){
        if (err)
            res.status(500).json({message: "Problème lors de la suppression du fournisseur"});
        else if (!provider)
            res.status(400).json({message: "Ce fournisseur n'existe pas"});
        else
            res.status(200).json({message: "Fournisseur correctement supprimé"});
    });
});

module.exports = router;