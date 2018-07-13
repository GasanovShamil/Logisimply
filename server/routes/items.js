let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let userModel = require("../models/User");
let itemModel = require("../models/Item");
let express = require("express");
let router = express.Router();

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
 *       user:
 *         type: string
 *       createdAt:
 *         type: date
 *       updatedAt:
 *         type: date
 *     required:
 *       - type
 *       - label
 *       - priceET
 *       - description
 */

router.use(middleware.localize);
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
 *       - description: Item to add
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
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramItem = req.body;
    if (!utils.fields.isItemComplete(paramItem))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let countItem = await itemModel.countDocuments({reference: paramItem.reference, user: req.loggedUser._id});
        if (countItem !== 0)
            res.status(400).json({message: localization[req.language].items.reference.used});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.items += 1;
            user.save();
            paramItem.reference = "" + utils.format.getCode(user.parameters.items);
            paramItem.user = req.loggedUser._id;
            paramItem.createdAt = new Date();
            let item = await itemModel.create(paramItem);
            let result = await item.fullFormat();
            res.status(200).json({message: localization[req.language].items.add, data: result});
        }
    }
}));

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
router.get("/me", middleware.wrapper(async (req, res) => {
    let items = await itemModel.find({user: req.loggedUser._id});
    for (let i = 0; i < items.length; i++)
        items[i] = await items[i].fullFormat();
    res.status(200).json(items);
}));

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
router.get("/:reference", middleware.wrapper(async (req, res) => {
    let paramRef = req.params.reference;
    let item = await itemModel.findOne({reference: paramRef, user: req.loggedUser._id});
    if (!item)
        res.status(400).json({message: localization[req.language].items.reference.failed});
    else {
        let result = await item.fullFormat();
        res.status(200).json(result);
    }
}));

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
 *       - description: Item to update
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
router.put("/update", middleware.wrapper(async (req, res) => {
    let paramItem = req.body;
    if (!utils.fields.isItemComplete(paramItem))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        paramItem.updatedAt = new Date();
        await itemModel.findOneAndUpdate({reference: paramItem.reference, user: req.loggedUser._id}, paramItem, null);
        let item = await itemModel.findOne({reference: paramItem.reference, user: req.loggedUser._id});
        if (!item)
            res.status(400).json({message: localization[req.language].items.reference.failed});
        else {
            let result = await item.fullFormat();
            res.status(200).json({message: localization[req.language].items.update, data: result});
        }
    }
}));

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
router.delete("/delete/:reference", middleware.wrapper(async (req, res) => {
    let paramRef = req.params.reference;
    let item = await itemModel.findOneAndRemove({reference: paramRef, user: req.loggedUser._id});
    if (!item)
        res.status(400).json({message: localization[req.language].items.reference.failed});
    else {
        let result = await item.fullFormat();
        res.status(200).json({message: localization[req.language].items.delete.one, data: result});
    }
}));

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
 *           type: number
 */
router.post("/delete", middleware.wrapper(async (req, res) => {
    let paramItems = req.body;
    let count = 0;
    for (let i = 0; i < paramItems.length; i++) {
        let item = await itemModel.findOneAndRemove({reference: paramItems[i].reference, user: req.loggedUser._id});
        if (item)
            count++;
    }
    res.status(200).json({message: localization[req.language].items.delete.multiple, data: count});
}));

module.exports = router;