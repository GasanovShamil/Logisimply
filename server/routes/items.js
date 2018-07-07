let express = require("express");
let router = express.Router();
let utils = require("../helpers/utils");
let itemModel = require("../models/Item");

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
router.post("/add", function(req, res) {
    let paramItem = req.body;
    paramItem.idUser = req.loggedUser._id;
    if (paramItem.type && paramItem.reference && paramItem.label && paramItem.priceET && paramItem.description) {
        itemModel.find({reference: paramItem.reference, idUser: paramItem.idUser}, function (err, user) {
            if (err)
                res.status(500).json({message: err});
            else if (user.length !== 0)
                res.status(400).json({message: "Vous avez déjà créé cet item"});
            else {
                itemModel.create(paramItem, function (err) {
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
 * /items/me:
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
router.get("/me", function(req, res) {
    itemModel.find({idUser: req.loggedUser._id}, function (err, items) {
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
router.get("/:reference", function(req, res) {
    let paramRef = req.params.reference;
    itemModel.findOne({reference: paramRef, idUser: req.loggedUser._id}, function (err, item) {
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
router.put("/update", function(req, res) {
    let paramItem = req.body;
    itemModel.findOneAndUpdate({_id: paramItem._id, idUser: req.loggedUser._id}, paramItem, null, function(err) {
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
router.delete("/:id", function(req, res) {
    let paramId = req.params.id;
    itemModel.findOneAndRemove({_id: paramId, idUser: req.loggedUser._id}, function(err, item){
        if (err)
            res.status(500).json({message: err});
        else if (!item)
            res.status(400).json({message: "Cet item n'existe pas"});
        else
            res.status(200).json({message: "Item correctement supprimé"});
    });
});

module.exports = router;