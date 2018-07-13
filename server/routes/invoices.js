let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let pdf = require("../helpers/pdf");
let mailer = require("../helpers/mailer");
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
 *         type: object
 *         properties:
 *           amount:
 *             type: number
 *           status:
 *             type: string
 *         required:
 *           - amount
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
        let count = await customerModel.countDocuments({code: paramInvoice.customer, user: req.loggedUser._id});
        if (count === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.invoices += 1;
            user.save();
            paramInvoice.code = "FA" + utils.getDateCode() + utils.getCode(user.parameters.invoices);
            paramInvoice.advancedPayment.status = paramInvoice.advancedPayment.amount === 0 ? "none" : "pending";
            paramInvoice.status = "draft";
            paramInvoice.user = req.loggedUser._id;
            paramInvoice.createdAt = new Date();
            let invoice = await invoiceModel.create(paramInvoice);
            let result = await invoice.fullFormat({logged: req.loggedUser._id, customer: true});
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
        invoices[i] = await invoices[i].fullFormat({logged: req.loggedUser._id, customer: true});
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
        let result = await invoice.fullFormat({logged: req.loggedUser._id, customer: true});
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
    if (!utils.isInvoiceComplete(paramInvoice))
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
                paramInvoice.advancedPayment.status = paramInvoice.advancedPayment.amount === 0 ? "none" : "pending";
                paramInvoice.updatedAt = new Date();
                await invoiceModel.findOneAndUpdate({code: paramInvoice.code, user: req.loggedUser._id}, paramInvoice, null);
                let invoice = await invoiceModel.findOne({code: paramInvoice.code, user: req.loggedUser._id});
                if (!invoice)
                    res.status(400).json({message: localization[req.language].invoices.code.failed});
                else {
                    let result = await invoice.fullFormat({logged: req.loggedUser._id, customer: true});
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
    let invoice = await invoiceModel.findOneAndRemove({code: paramCode, user: req.loggedUser._id});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else {
        let result = await invoice.fullFormat({logged: req.loggedUser._id, customer: true});
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
 *         description: Quotes deleted
 *         schema:
 *           type: number
 */
router.post("/delete", middleware.wrapper(async (req, res) => {
    let paramInvoices = req.body;
    let count = 0;
    for (let i = 0; i < paramInvoices.length; i++) {
        let invoice = await invoiceModel.findOneAndRemove({code: paramInvoices[i].code, user: req.loggedUser._id});
        if (invoice)
            count++;
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
        let result = await invoice.fullFormat({logged: req.loggedUser._id, infos: true});
        pdf.getInvoice(result, req.language);
        mailer.sendInvoice(result, req.language);
        utils.removePdf(utils.getPdfPath(result.user._id, result.code));
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
 *         description: Quote download
 *         schema:
 *           $ref: '#/definitions/Quote'
 */
router.get("/send/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let invoice = await invoiceModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else {
        let result = await invoice.fullFormat({logged: req.loggedUser._id, infos: true});
        pdf.getQuote(result, req.language);
        res.download(utils.getPdfPath(result.user._id, result.code), "Facture - " + result.code + ".pdf", function(err){
            if (err)
                res.status(500).json({message: localization[req.language].invoices.download.error});
            else {
                utils.removePdf(utils.getPdfPath(result.user._id, result.code));
                res.status(200).json({message: localization[req.language].invoices.download.success, data: result});
            }
        });
    }
}));

module.exports = router;