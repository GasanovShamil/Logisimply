let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let pdf = require("../helpers/pdf");
let mailer = require("../helpers/mailer");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let incomeModel = require("../models/Income");
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
 *         type: date
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
 *         type: date
 *       collectionCost:
 *         type: boolean
 *       advancedPayment:
 *         type: number
 *       comment:
 *         type: string
 *       status:
 *         type: string
 *       user:
 *         type: string
 *       createdAt:
 *         type: date
 *       updatedAt:
 *         type: date
 *     required:
 *       - customer
 *       - dateInvoice
 *       - content
 *       - datePayment
 *       - dateExecution
 *       - collectionCost
 *   Income:
 *     type: object
 *     properties:
 *       method:
 *         type: string
 *       amount:
 *         type: number
 *       invoice:
 *         type: string
 *       user:
 *         type: string
 *       customer:
 *         type: string
 *       dateIncome:
 *         type: date
 *       createdAt:
 *         type: date
 *       updatedAt:
 *         type: date
 *     required:
 *       - type
 *       - amount
 *       - invoice
 *       - user
 *       - customer
 *       - dateIncome
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
 *       - description: Invoice to add
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
    if (!utils.fields.isInvoiceComplete(paramInvoice))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let countCustomer = await customerModel.countDocuments({code: paramInvoice.customer, user: req.loggedUser._id});
        if (countCustomer === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.invoices += 1;
            user.save();
            paramInvoice.code = "FA" + utils.format.getDateCode() + utils.format.getCode(user.parameters.invoices);
            if (!paramInvoice.advancedPayment)
                paramInvoice.advancedPayment = 0;
            paramInvoice.status = "draft";
            paramInvoice.user = req.loggedUser._id;
            paramInvoice.createdAt = new Date();
            let invoice = await invoiceModel.create(paramInvoice);
            let result = await invoice.fullFormat({owner: req.loggedUser._id, customer: true});
            res.status(200).json({message: localization[req.language].invoices.add, data: result});
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
    let invoices = await invoiceModel.find({user: req.loggedUser._id});
    for (let i = 0; i < invoices.length; i++)
        invoices[i] = await invoices[i].fullFormat({owner: req.loggedUser._id, customer: true});
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
    let invoice = await invoiceModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else {
        let result = await invoice.fullFormat({owner: req.loggedUser._id, customer: true});
        res.status(200).json(result);
    }
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
    if (!utils.fields.isInvoiceStatusValid(paramInvoice.status))
        res.status(400).json({message: localization[req.language].fields.prohibited});
    else if (!utils.fields.isInvoiceComplete(paramInvoice))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let countCustomer = await customerModel.countDocuments({code: paramInvoice.customer, user: req.loggedUser._id});
        if (countCustomer === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            let countInvoice = await invoiceModel.countDocuments({code: paramInvoice.code, status: "draft", user: req.loggedUser._id});
            if (countInvoice === 0)
                res.status(400).json({message: localization[req.language].invoices.update.impossible});
            else {
                if (!paramInvoice.advancedPayment)
                    paramInvoice.advancedPayment = 0;
                paramInvoice.updatedAt = new Date();
                await invoiceModel.findOneAndUpdate({code: paramInvoice.code, user: req.loggedUser._id}, {$set: paramInvoice}, null);
                let invoice = await invoiceModel.findOne({code: paramInvoice.code, user: req.loggedUser._id});
                if (!invoice)
                    res.status(400).json({message: localization[req.language].invoices.code.failed});
                else {
                    let result = await invoice.fullFormat({owner: req.loggedUser._id, customer: true});
                    res.status(200).json({message: localization[req.language].invoices.update.success, data: result});
                }
            }
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
    let countInvoice = await invoiceModel.countDocuments({code: paramCode, status: {$ne: "lock"}, user: req.loggedUser._id});
    if (countInvoice === 0)
        res.status(400).json({message: localization[req.language].invoices.delete.impossible});
    else {
        let invoice = await invoiceModel.findOneAndRemove({code: paramCode, user: req.loggedUser._id});
        let result = await invoice.fullFormat({owner: req.loggedUser._id, customer: true});
        res.status(200).json({message: localization[req.language].invoices.delete.one, data: result});
    }
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
 *         description: Invoices deleted
 *         schema:
 *           type: number
 */
router.post("/delete", middleware.wrapper(async (req, res) => {
    let paramInvoices = req.body;
    let count = 0;
    for (let i = 0; i < paramInvoices.length; i++) {
        let countInvoice = await invoiceModel.countDocuments({code: paramInvoices[i].code, status: {$ne: "lock"}, user: req.loggedUser._id});
        if (countInvoice === 1) {
            let invoice = await invoiceModel.findOneAndRemove({code: paramInvoices[i].code, user: req.loggedUser._id});
            if (invoice)
                count++;
        }
    }
    res.status(200).json({message: localization[req.language].invoices.delete.multiple, data: count});
}));

/**
 * @swagger
 * /invoices/send/{code}:
 *   get:
 *     tags:
 *       - Invoices
 *     description: Logged - Send an invoice to the customer by email
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
 *       200:
 *         description: Invoice sent
 *         schema:
 *           $ref: '#/definitions/Invoice'
 */
router.get("/send/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let invoice = await invoiceModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else {
        invoice.status = "lock";
        invoice.save();
        let result = await invoice.fullFormat({owner: req.loggedUser._id, infos: true});
        pdf.getInvoice(result, req.language, mailer.sendInvoice);
        res.status(200).json({message: localization[req.language].invoices.send, data: result});
    }
}));

/**
 * @swagger
 * /invoices/download/{code}:
 *   get:
 *     tags:
 *       - Invoices
 *     description: Logged - Download a quote
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Quote's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Error - user is logged out
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Invoice downloaded
 *         schema:
 *           $ref: '#/definitions/Quote'
 */
router.get("/download/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let invoice = await invoiceModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else {
        let result = await invoice.fullFormat({owner: req.loggedUser._id, infos: true});
        pdf.getInvoice(result, req.language);
        res.download(utils.pdf.getPath(result.user._id, result.code), "Facture - " + result.code + ".pdf", function(err){
            if (err)
                res.status(500).json({message: localization[req.language].invoices.download.error});
            else {
                utils.pdf.remove(utils.pdf.getPath(result.user._id, result.code));
                res.status(200).json({message: localization[req.language].invoices.download.success, data: result});
            }
        });
    }
}));

/**
 * @swagger
 * /invoices/incomes/me:
 *   get:
 *     tags:
 *       - Invoices
 *     description: Logged - Get all my assets
 *     produces:
 *       - application/json
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An array of requested customers with assets
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Income'
 */
router.get("/incomes/me", middleware.wrapper(async (req, res) => {
    let customers = await customerModel.find({assets: {$gt: 0}, user: req.loggedUser._id});
    res.status(200).json(customers);
}));

module.exports = router;