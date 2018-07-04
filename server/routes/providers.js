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
 *     description: Create a provider
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: provider
 *         description: Provider object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Provider'
 *     responses:
 *       400:
 *         description: Error because customer already exists
 *       200:
 *         description: Success
 */
router.post('/add', function(req, res) {
    let addProvider = req.body;
    addProvider.idUser = req.loggedUser._id;

    if (addProvider.companyName && addProvider.legalForm && addProvider.siret && addProvider.telephone && addProvider.emailAddress && addProvider.website && addProvider.address && addProvider.zipCode && addProvider.town) {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (regex.test(String(addProvider.emailAddress).toLowerCase())) {
            providerModel.find({emailAddress: addProvider.emailAddress, siret: addProvider.siret, idUser: addProvider.idUser}, function (err, provider) {
                if (!err && provider.length !== 0)
                    res.status(400).json({message: "Vous avez déjà créer ce fournisseur !"});
                else {
                    providerModel.create(addProvider, function (err) {
                        if (err)
                            res.status(400).json({message: err});
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
 *     description: Get my providers
 *     produces:
 *       - application/json
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       200:
 *         description: Success
 */
router.get('/', function(req, res) {
    let myId = req.loggedUser._id;
    providerModel.find({idUser: myId}, function (err, providers) {
        if (err)
            res.status(500).json({message: "Un problème est survenu."});
        else
            res.status(200).json(providers);
    });
});

/**
 * @swagger
 * /providers/{siret}:
 *   get:
 *     tags:
 *       - Providers
 *     description: Get my providers
 *     produces:
 *       - application/json
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       200:
 *         description: Success
 */
router.get('/:siret', function(req, res) {
    let customerId = req.params.siret;
    let myId = req.loggedUser._id;
    providerModel.findOne({idUser: myId, siret: customerId}, function (err, providers) {
        if (err)
            res.status(500).json({message: "Un problème est survenu."});
        else
            res.status(200).json(providers);
    });
});

/**
 * @swagger
 * /providers/update:
 *   put:
 *     tags:
 *       - Providers
 *     description: Update providers' information
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
 *         description: An error message on provider's update
 *       200:
 *         description: The provider's data is updated
 *         schema:
 *           $ref: '#/definitions/Provider'
 */
router.put('/update', function(req, res) {
    let updateProvider = req.body;

    providerModel.findOneAndUpdate({_id: updateProvider._id, idUser: req.loggedUser._id}, updateProvider, null, function(err) {
        if (err)
            res.status(500).json({message: "Problème lors de la mise à jour du fournisseur"});
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
 *     description: Delete a provider
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Provider's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Error
 *       200:
 *         description: Success
 */
router.delete('/:id', function(req, res) {
    let idProvider = req.params.id;
    providerModel.findOneAndRemove({_id: idProvider, idUser: req.loggedUser._id}, function(err, provider){
        if (!provider)
            res.status(400).json({message: "Ce fournisseur n'existe pas"});
        else if (err)
            res.status(500).json({message: "Problème lors de la suppression du fournisseur"});
        else
            res.status(200).json({message: "Fournisseur correctement supprimé"});
    });
});

module.exports = router;