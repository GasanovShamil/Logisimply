let localization = require("../localization/localize");
let constants = require("../helpers/constants");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let invoiceModel = require("../models/Invoice");
let express = require("express");
let router = express.Router();

/**
 * @swagger
 * definition:
 *   Invoice:
 *     type: object
 *     properties:
 *       customer:
 *         type: string
 *       code:
 *         type: string
 *       dateInvoice:
 *         type: string
 *         format: date
 *       subject:
 *         type: string
 *       content:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             reference:
 *               type: string
 *             label:
 *               type: string
 *             description:
 *               type: string
 *             type:
 *               type: string
 *             unitPriceET:
 *               type: number
 *             quantity:
 *               type: number
 *             discount:
 *               type: number
 *           required:
 *             - reference
 *             - label
 *             - type
 *             - unitPriceET
 *             - quantity
 *       datePayment:
 *         type: string
 *       dateExecution:
 *         type: string
 *         format: date
 *       collectionCost:
 *         type: boolean
 *       comment:
 *         type: string
 *       status:
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
 *       - customer
 *       - dateInvoice
 *       - content
 *       - datePayment
 *       - dateExecution
 *       - collectionCost
 */

router.use(middleware.localize);
router.use(middleware.isLogged);

/**
 * @swagger
 * /invoices/add:
 *   post:
 *     tags:
 *       - Invoices
 *     description: Logged - Create an invoice
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Invoice object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Invoice'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - missing fields
 *       200:
 *         description: Invoice created
 *         schema:
 *           $ref: '#/definitions/Invoice'
 */
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramInvoice = req.body;
    if (!utils.isInvoiceComplete(paramInvoice))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let count = await customerModel.countDocuments({code: paramInvoice.customer, idUser: req.loggedUser._id});
        if (count === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.invoices += 1;
            user.save();
            paramInvoice.code = "FA" + utils.getDateCode() + utils.getCode(user.parameters.invoices);
            paramInvoice.status = constants.InvoiceStatus.created;
            paramInvoice.idUser = req.loggedUser._id;
            paramInvoice.createdAt = new Date();
            let invoice = await invoiceModel.create(paramInvoice);
            res.status(200).json({message: localization[req.language].invoices.add, data: invoice});
        }
    }
}));

/**
 * @swagger
 * /invoices/me:
 *   get:
 *     tags:
 *       - Invoices
 *     description: Logged - Get all of my invoices
 *     produces:
 *       - application/json
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An array of requested invoices
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Invoice'
 */
router.get("/me", middleware.wrapper(async (req, res) => {
    let invoices = await invoiceModel.find({idUser: req.loggedUser._id});
    res.status(200).json(invoices);
}));

/**
 * @swagger
 * /invoices/{code}:
 *   get:
 *     tags:
 *       - Invoices
 *     description: Logged - Get one of my invoices
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Invoice's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no invoice for code
 *       200:
 *         description: An object of the requested invoice
 *         schema:
 *           $ref: '#/definitions/Invoice'
 */
router.get("/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let invoice = await invoiceModel.findOne({code: paramCode, idUser: req.loggedUser._id});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else
        res.status(200).json(invoice.withTotal());
}));

/**
 * @swagger
 * /invoices/update:
 *   put:
 *     tags:
 *       - Invoices
 *     description: Logged - Update invoice's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Invoice to update
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Invoice'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no invoice for code
 *       200:
 *         description: Invoice updated
 *         schema:
 *           $ref: '#/definitions/Invoice'
 */
router.put("/update", middleware.wrapper(async (req, res) => {
    let paramInvoice = req.body;
    if (!utils.isInvoiceComplete(paramInvoice))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let count = await customerModel.countDocuments({code: paramInvoice.customer, idUser: req.loggedUser._id});
        if (count === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            paramInvoice.updatedAt = new Date();
            let invoice = await invoiceModel.findOneAndUpdate({code: paramInvoice.code, idUser: req.loggedUser._id}, paramInvoice, null);
            if (!invoice)
                res.status(400).json({message: localization[req.language].invoices.code.failed});
            else
                res.status(200).json({message: localization[req.language].invoices.update, data: invoice});
        }
    }
}));

/**
 * @swagger
 * /invoices/delete/{code}:
 *   delete:
 *     tags:
 *       - Invoices
 *     description: Logged - Delete an invoice
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Invoice's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no invoice for code
 *       200:
 *         description: Invoice deleted
 *         schema:
 *           $ref: '#/definitions/Invoice'
 */
router.delete("/delete/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let invoice = await invoiceModel.findOneAndRemove({code: paramCode, idUser: req.loggedUser._id});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else
        res.status(200).json({message: localization[req.language].invoices.delete.one, data: invoice});
}));

/**
 * @swagger
 * /invoices/delete:
 *   post:
 *     tags:
 *       - Invoices
 *     description: Logged - Delete multiple invoices
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Invocies to delete
 *         in: body
 *         required: true
 *         type: array
 *         items:
 *           $ref: '#/definitions/Invoice'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Quotes deleted
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Invoice'
 */
router.post("/delete", middleware.wrapper(async (req, res) => {
    let paramInvoices = req.body;
    let invoices = [];
    for (let i = 0; i < paramInvoices.length; i++) {
        let invoice = await invoiceModel.findOneAndRemove({code: paramInvoices[i].code, idUser: req.loggedUser._id});
        if (invoice)
            invoices.push(invoice);
    }
    res.status(200).json({message: localization[req.language].invoices.delete.multiple, data: invoices});
}));

module.exports = router;