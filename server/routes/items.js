let express = require("express");
let router = express.Router();
let middleware = require("../helpers/middleware");
let localization = require("../localization/fr_FR");
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
 *       createdAt:
 *         type: string
 *         format: date
 *       updatedAt:
 *         type: string
 *         format: date
 *     required:
 *       - type
 *       - reference
 *       - label
 *       - priceET
 *       - description
 */

router.use(middleware.promises);
router.use(middleware.isLogged);

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
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - item already exists
 *       200:
 *         description: Item created
 *         schema:
 *           $ref: '#/definitions/Item'
 */
router.post("/add", async (req, res) => {
    let paramItem = req.body;
    if (!(paramItem.type && paramItem.reference && paramItem.label && paramItem.priceET && paramItem.description))
        res.status(400).json({message: localization.fields.required});
    else {
        let count = await itemModel.count({reference: paramItem.reference, idUser: paramItem.idUser});
        if (count !== 0)
            res.status(400).json({message: localization.items.used});
        else {
            paramItem.idUser = req.loggedUser._id;
            paramItem.createdAt = new Date();
            let item = await itemModel.create(paramItem);
            res.status(200).json({message: localization.items.add, data: item});
        }
    }
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
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An array of requested providers
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Item'
 */
router.get("/me", async (req, res) => {
    let items = await itemModel.find({idUser: req.loggedUser._id});
    res.status(200).json(items);
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
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no item for reference
 *       200:
 *         description: An object of the requested item
 *         schema:
 *           $ref: '#/definitions/Item'
 */
router.get("/:reference", async (req, res) => {
    let paramRef = req.params.reference;
    let item = await itemModel.findOne({reference: paramRef, idUser: req.loggedUser._id});
    if (!item)
        res.status(400).json({message: localization.items.reference.failed});
    else
        res.status(200).json(item);
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
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no item for reference
 *       200:
 *         description: Item updated
 *         schema:
 *           $ref: '#/definitions/Item'
 */
router.put("/update", async (req, res) => {
    let paramItem = req.body;
    if (!(paramItem.type && paramItem.reference && paramItem.label && paramItem.priceET && paramItem.description))
        res.status(400).json({message: localization.fields.required});
    else {
        paramItem.updatedAt = new Date();
        let item = await itemModel.findOneAndUpdate({reference: paramItem.reference, idUser: req.loggedUser._id}, paramItem, null);
        if (!item)
            res.status(400).json({message: localization.items.reference.failed});
        else
            res.status(200).json({message: localization.items.update, data: item});
    }
});

/**
 * @swagger
 * /items/delete/{reference}:
 *   delete:
 *     tags:
 *       - Items
 *     description: Logged - Delete an item
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Item's reference
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no item for reference
 *       200:
 *         description: Item deleted
 *         schema:
 *           $ref: '#/definitions/Item'
 */
router.delete("/delete/:reference", async (req, res) => {
    let paramRef = req.params.reference;
    let item = await itemModel.findOneAndRemove({reference: paramRef, idUser: req.loggedUser._id});
    if (!item)
        res.status(400).json({message: localization.items.reference.failed});
    else
        res.status(200).json({message: localization.items.delete.one, data: item});
});

/**
 * @swagger
 * /items/delete:
 *   post:
 *     tags:
 *       - Items
 *     description: Logged - Delete multiple items
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Items to delete
 *         in: body
 *         required: true
 *         type: array
 *         items:
 *           $ref: '#/definitions/Item'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Items deleted
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Item'
 */
router.post("/delete", async (req, res) => {
    let paramItems = req.body;
    let items = [];
    for (let i = 0; i < paramItems.length; i++) {
        let item = await itemModel.findOneAndRemove({reference: paramItems[i].reference, idUser: req.loggedUser._id});
        if (item)
            items.push(item);
    }
    res.status(200).json({message: localization.items.delete.multiple, data: items});
});

module.exports = router;