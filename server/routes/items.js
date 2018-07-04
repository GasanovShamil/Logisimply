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

module.exports = router;