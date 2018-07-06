var config = require('../config.json');
var utils = require('../helpers/utils');
var express = require('express');
var router = express.Router();
var itemModel = require('../models/Item');
const mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.database);

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
 *       priceET:
 *         type: number
 *       description:
 *         type: string
 *       idUser:
 *         type: string
 *     required:
 *       - type
 *       - reference
 *       - label
 *       - priceET
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
 *     description: Logged - Create an item
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Item object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Item'
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - item already exists
 *       200:
 *         description: Item created
 */
router.post('/add', function(req, res) {
    let addItem = req.body;
    addItem.idUser = req.loggedUser._id;
    if (addItem.type && addItem.reference && addItem.label && addItem.priceET && addItem.description) {
        itemModel.find({reference: addItem.reference, idUser: addItem.idUser}, function (err, user) {
            if (err)
                res.status(500).json({message: err});
            else if (user.length !== 0)
                res.status(400).json({message: "Vous avez déjà créé cet item !"});
            else {
                itemModel.create(addItem, function (err) {
                    if (err)
                        res.status(500).json({message: err});
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
 *     description: Logged - Get all my items
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
 *             $ref: '#/definitions/Item'
 */
router.get('/', function(req, res) {
    let myId = req.loggedUser._id;
    itemModel.find({idUser: myId}, function (err, items) {
        if (err)
            res.status(500).json({message: err});
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
 *     description: Logged - Get one of my items
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Item's reference
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An object of the requested item
 *         schema:
 *           $ref: '#/definitions/Item'
 */
router.get('/:reference', function(req, res) {
    let itemId = req.params.reference;
    let myId = req.loggedUser._id;
    itemModel.findOne({idUser: myId, reference: itemId}, function (err, item) {
        if (err)
            res.status(500).json({message: err});
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
 *     description: Logged - Update Item's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Item's id
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Item'
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Item updated
 */
router.put('/update', function(req, res) {
    let updateItem = req.body;

    itemModel.findOneAndUpdate({_id: updateItem._id, idUser: req.loggedUser._id}, updateItem, null, function(err) {
        if (err)
            res.status(500).json({message: err});
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
 *     description: Logged - Delete an item
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Item's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Item deleted
 */
router.delete('/:id', function(req, res) {
    let idItem = req.params.id;

    itemModel.findOneAndRemove({_id: idItem, idUser: req.loggedUser._id}, function(err, item){
        if (err)
            res.status(500).json({message: err});
        else if (!item)
            res.status(400).json({message: "Cet item n'existe pas"});
        else
            res.status(200).json({message: "Item correctement supprimé"});
    });
});

module.exports = router;