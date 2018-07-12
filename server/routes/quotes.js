let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let mailer = require("../helpers/mailer");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let quoteModel = require("../models/Quote");
let invoiceModel = require("../models/Invoice");
let express = require("express");
let router = express.Router();

/**
 * @swagger
 * definition:
 *   Quote:
 *     type: object
 *     properties:
 *       customer:
 *         type: string
 *       code:
 *         type: string
 *       dateQuote:
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
 *       validity:
 *         type: number
 *       collectionCost:
 *         type: boolean
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
 *       - dateQuote
 *       - content
 *       - datePayment
 *       - validity
 *       - collectionCost
 */

router.use(middleware.localize);
router.use(middleware.isLogged);

/**
 * @swagger
 * /quotes/add:
 *   post:
 *     tags:
 *       - Quotes
 *     description: Logged - Create a quote
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Quote object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Quote'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - missing fields
 *       200:
 *         description: Quote created
 *         schema:
 *           $ref: '#/definitions/Quote'
 */
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramQuote = req.body;
    if (!utils.isQuoteComplete(paramQuote))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let count = await customerModel.countDocuments({code: paramQuote.customer, user: req.loggedUser._id});
        if (count === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.quotes += 1;
            user.save();
            paramQuote.code = "DE" + utils.getDateCode() + utils.getCode(user.parameters.quotes);
            paramQuote.status = "draft";
            paramQuote.user = req.loggedUser._id;
            paramQuote.createdAt = new Date();
            let quote = await quoteModel.create(paramQuote);
            let result = await quote.fullFormat({logged: req.loggedUser._id, customer: true});
            res.status(200).json({message: localization[req.language].quotes.add, data: result});
        }
    }
}));

/**
 * @swagger
 * /quotes/me:
 *   get:
 *     tags:
 *       - Quotes
 *     description: Logged - Get all of my quotes
 *     produces:
 *       - application/json
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An array of requested quotes
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Quote'
 */
router.get("/me", middleware.wrapper(async (req, res) => {
    let quotes = await quoteModel.find({user: req.loggedUser._id});
    for (let i = 0; i < quotes.length; i++)
        quotes[i] = await quotes[i].fullFormat({logged: req.loggedUser._id, customer: true});
    res.status(200).json(quotes);
}));

/**
 * @swagger
 * /quotes/{code}:
 *   get:
 *     tags:
 *       - Quotes
 *     description: Logged - Get one of my quotes
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Quote's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no quote for code
 *       200:
 *         description: An object of the requested quote with customer
 *         schema:
 *           $ref: '#/definitions/Quote'
 */
router.get("/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let quote = await quoteModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!quote)
        res.status(400).json({message: localization[req.language].quotes.code.failed});
    else {
        let result = await quote.fullFormat({logged: req.loggedUser._id, customer: true});
        res.status(200).json(result);
    }
}));

/**
 * @swagger
 * /quotes/update:
 *   put:
 *     tags:
 *       - Quotes
 *     description: Logged - Update quote's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Quote to update
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Quote'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no quote for code
 *       200:
 *         description: Quote updated
 *         schema:
 *           $ref: '#/definitions/Quote'
 */
router.put("/update", middleware.wrapper(async (req, res) => {
    let paramQuote = req.body;
    if (!utils.isProviderComplete(paramQuote))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let count = await customerModel.countDocuments({code: paramQuote.customer, user: req.loggedUser._id});
        if (count === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            paramQuote.status = "draft";
            paramQuote.updatedAt = new Date();
            await quoteModel.findOneAndUpdate({code: paramQuote.code, user: req.loggedUser._id}, paramQuote, null);
            let quote = await quoteModel.findOne({code: paramQuote.code, user: req.loggedUser._id});
            if (!quote)
                res.status(400).json({message: localization[req.language].quotes.code.failed});
            else {
                let result = await quote.fullFormat({logged: req.loggedUser._id, customer: true});
                res.status(200).json({message: localization[req.language].quotes.update, data: result});
            }
        }
    }
}));

/**
 * @swagger
 * /quotes/delete/{code}:
 *   delete:
 *     tags:
 *       - Quotes
 *     description: Logged - Delete a quote
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Quote's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no quote for code
 *       200:
 *         description: Quote deleted
 *         schema:
 *           $ref: '#/definitions/Quote'
 */
router.delete("/delete/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let quote = await quoteModel.findOneAndRemove({code: paramCode, user: req.loggedUser._id});
    if (!quote)
        res.status(400).json({message: localization[req.language].quotes.code.failed});
    else {
        let result = await quote.fullFormat({logged: req.loggedUser._id, customer: true});
        res.status(200).json({message: localization[req.language].quotes.delete.one, data: result});
    }
}));

/**
 * @swagger
 * /quotes/delete:
 *   post:
 *     tags:
 *       - Quotes
 *     description: Logged - Delete multiple quotes
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Quotes to delete
 *         in: body
 *         required: true
 *         type: array
 *         items:
 *           $ref: '#/definitions/Quote'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Quotes deleted
 *         schema:
 *           type: number
 */
router.post("/delete", middleware.wrapper(async (req, res) => {
    let paramQuotes = req.body;
    let count = 0;
    for (let i = 0; i < paramQuotes.length; i++) {
        let quote = await quoteModel.findOneAndRemove({code: paramQuotes[i].code, user: req.loggedUser._id});
        if (quote)
            count++;
    }
    res.status(200).json({message: localization[req.language].quotes.delete.multiple, data: count});
}));

/**
 * @swagger
 * /quotes/generateInvoice:
 *   post:
 *     tags:
 *       - Quotes
 *     description: Logged - Generate an invoice from a specific quote
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Quote object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Quote'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Invoice created
 *         schema:
 *           $ref: '#/definitions/Invoice'
 */
router.post("/generateInvoice", middleware.wrapper(async (req, res) => {
    let paramInvoice = utils.generateInvoice(req.body);
    if (!utils.isInvoiceComplete(paramInvoice))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let count = await customerModel.countDocuments({code: paramInvoice.customer, user: req.loggedUser._id});
        if (count === 0)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.quotes += 1;
            user.save();
            paramInvoice.code = "FA" + utils.getDateCode() + utils.getCode(user.parameters.quotes);
            paramInvoice.advandedPayment = {value: 0, status: "none"};
            paramInvoice.status = "draft";
            paramInvoice.user = req.loggedUser._id;
            paramInvoice.createdAt = new Date();
            let invoice = await invoiceModel.create(paramInvoice);
            res.status(200).json({message: localization[req.language].quotes.add, data: invoice});
        }
    }
}));

router.get("/send/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let quote = await quoteModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!quote)
        res.status(400).json({message: localization[req.language].quotes.code.failed});
    else {
        let result = await quote.fullFormat({logged: req.loggedUser._id, infos: true});
        mailer.sendQuote(result, req.language);
        res.status(200).json({message: localization[req.language].quotes.send, data: result});
    }
}));

module.exports = router;