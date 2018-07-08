let express = require("express");
let router = express.Router();
let utils = require("../helpers/utils");
let billModel = require("../models/Bill");

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
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - item already exists
 *       200:
 *         description: Item created
 */
router.post("/add", async (req, res) => {
    let paramItem = req.body;
    if (!(paramItem.type && paramItem.reference && paramItem.label && paramItem.priceET && paramItem.description))
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
    else {
        let count = await billModel.count({reference: paramItem.reference, idUser: paramItem.idUser});
        if (count !== 0)
            res.status(400).json({message: "Vous avez déjà créé cet item"});
        else {
            paramItem.idUser = req.loggedUser._id;
            paramItem.createdAt = new Date();
            let item = await billModel.create(paramItem);
            res.status(200).json({message: "Item créé : " + item.reference});
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
    let items = await billModel.find({idUser: req.loggedUser._id});
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
 *       200:
 *         description: An object of the requested item
 *         schema:
 *           $ref: '#/definitions/Item'
 */
router.get("/:reference", async (req, res) => {
    let paramRef = req.params.reference;
    let item = await billModel.findOne({reference: paramRef, idUser: req.loggedUser._id});
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
 *       200:
 *         description: Item updated
 */
router.put("/update", async (req, res) => {
    let paramItem = req.body;
    if (!(paramItem.type && paramItem.reference && paramItem.label && paramItem.priceET && paramItem.description))
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
    else {
        paramItem.updatedAt = new Date();
        let item = await billModel.findOneAndUpdate({reference: paramItem.reference, idUser: req.loggedUser._id}, paramItem, null);
        res.status(200).json({message: "Item modifié : " + item.reference});
    }
});

/**
 * @swagger
 * /items/{reference]:
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
 */
router.delete("/:reference", async (req, res) => {
    let paramRef = req.params.reference;
    let item = await billModel.findOneAndRemove({reference: paramRef, idUser: req.loggedUser._id});
    if (!item)
        res.status(400).json({message: "Aucun item ne correspond à la référence : " + paramRef});
    else
        res.status(200).json({message: "Item supprimé : " + item.reference});
});

module.exports = router;