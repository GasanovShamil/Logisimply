var config = require('../config.json');
var express = require('express');
var router = express.Router();
var itemModel = require('../models/Item');
var utils = require('../helpers/utils');
const mongoose = require('mongoose');

mongoose.connect('mongodb://' + config.host + ':' + config.port + '/' + config.database);

/**
 * @swagger
 * definition:
 *   Item:
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *       reference:
 *         type: string
 *       label:
 *         type: string
 *       priceTL:
 *         type: string
 *       description:
 *         type: string
 *       idUser:
 *         type: string
 *     required:
 *       - type
 *       - reference
 *       - label
 *       - priceTL
 *       - description
 *       - idUser
 */

router.use(utils.isLogged);

/**
 * @swagger
 * /items/add:
 *   post:
 *     tags:
 *       - Items
 *     description: Create an item
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: item
 *         description: Item object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Item'
 *     responses:
 *       400:
 *         description: Error because item already exists
 *       200:
 *         description: Success
 */
router.post('/add', function(req, res) {
    let addItem = req.body;
    addItem.idUser = req.loggedUser._id;

    if (addItem.type && addItem.reference && addItem.label && addItem.priceTL && addItem.description) {
        itemModel.find({reference: addItem.reference, idUser: addItem.idUser}, function (err, user) {
            if (!err && user.length !== 0)
                res.status(400).json({message: "Vous avez déjà créé cet item !"});
            else {
                itemModel.create(addItem, function (err) {
                    if (err)
                        res.status(400).json({message: err});
                    else
                        res.status(200).json({message: "Item créé avec succès"});
                });
            }
        });
    } else
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
});

/**
 * @swagger
 * /items:
 *   get:
 *     tags:
 *       - Items
 *     description: Get my items
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
    itemModel.find({idUser: myId}, function (err, items) {
        if (err)
            res.status(500).json({message: "Un problème est survenu."});
        else
            res.status(200).json(items);
    });
});

/**
 * @swagger
 * /items/{reference}:
 *   get:
 *     tags:
 *       - Items
 *     description: Get my items
 *     produces:
 *       - application/json
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       200:
 *         description: Success
 */
router.get('/:reference', function(req, res) {
    let itemId = req.params.reference;
    let myId = req.loggedUser._id;
    itemModel.findOne({idUser: myId, reference: itemId}, function (err, item) {
        if (err)
            res.status(500).json({message: "Un problème est survenu."});
        else
            res.status(200).json(item);
    });
});

/**
 * @swagger
 * /items/update:
 *   put:
 *     tags:
 *       - Items
 *     description: Update Items' information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Item id
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Item'
 *     responses:
 *       500:
 *         description: An error message on item's update
 *       200:
 *         description: The item's data is updated
 *         schema:
 *           $ref: '#/definitions/Customer'
 */
router.put('/update', function(req, res) {
    let updateItem = req.body;

    itemModel.findOneAndUpdate({_id: updateItem._id, idUser: req.loggedUser._id}, updateItem, null, function(err) {
        if (err)
            res.status(500).json({message: "Problème lors de la mise à jour de l'item"});
        else
            res.status(200).json({message: "Item correctement modifié"});
    });
});

/**
 * @swagger
 * /items/{id]:
 *   delete:
 *     tags:
 *       - Items
 *     description: Delete an item
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Item's id
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
    let idItem = req.params.id;

    itemModel.findOneAndRemove({_id: idItem, idUser: req.loggedUser._id}, function(err, item){
        if (!item)
            res.status(400).json({message: "Cet item n'existe pas"});
        else if (err)
            res.status(500).json({message: "Problème lors de la suppression de l'item"});
        else
            res.status(200).json({message: "Item correctement supprimé"});
    });
});

module.exports = router;