let config = require("../config");
let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let pdf = require("../helpers/pdf");
let mailer = require("../helpers/mailer");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let quoteModel = require("../models/Quote");
let request = require("request");
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
 *       - description: Quote to add
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
    if (!utils.fields.isQuoteComplete(paramQuote))
        return res.status(400).json({message: localization[req.language].fields.required});

    let countCustomer = await customerModel.countDocuments({code: paramQuote.customer, user: req.loggedUser._id});
    if (countCustomer === 0)
        return res.status(400).json({message: localization[req.language].customers.code.failed});

    let user = await userModel.findOne({_id: req.loggedUser._id});
    user.parameters.quotes += 1;
    user.save();
    paramQuote.code = "DE" + utils.format.getDateCode() + utils.format.getCode(user.parameters.quotes);
    paramQuote.status = "draft";
    paramQuote.user = req.loggedUser._id;
    paramQuote.createdAt = new Date();
    let quote = await quoteModel.create(paramQuote);
    let result = await quote.fullFormat({owner: req.loggedUser._id, customer: true});
    res.status(200).json({message: localization[req.language].quotes.add, data: result});
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
        quotes[i] = await quotes[i].fullFormat({owner: req.loggedUser._id, customer: true});
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
        return res.status(400).json({message: localization[req.language].quotes.code.failed});

    let result = await quote.fullFormat({owner: req.loggedUser._id, customer: true});
    res.status(200).json(result);
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
    if (!utils.fields.isQuoteStatusValid(paramQuote.status))
        return res.status(400).json({message: localization[req.language].fields.prohibited});

    if (!utils.fields.isQuoteComplete(paramQuote))
        return res.status(400).json({message: localization[req.language].fields.required});

    let countCustomer = await customerModel.countDocuments({code: paramQuote.customer, user: req.loggedUser._id});
    if (countCustomer === 0)
        return res.status(400).json({message: localization[req.language].customers.code.failed});

    paramQuote.status = 'draft';
    paramQuote.updatedAt = new Date();
    await quoteModel.findOneAndUpdate({code: paramQuote.code, user: req.loggedUser._id}, {$set: paramQuote}, null);
    let quote = await quoteModel.findOne({code: paramQuote.code, user: req.loggedUser._id});
    if (!quote)
        return res.status(400).json({message: localization[req.language].quotes.code.failed});

    let result = await quote.fullFormat({owner: req.loggedUser._id, customer: true});
    res.status(200).json({message: localization[req.language].quotes.update, data: result});
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
        return res.status(400).json({message: localization[req.language].quotes.code.failed});

    let result = await quote.fullFormat({owner: req.loggedUser._id, customer: true});
    res.status(200).json({message: localization[req.language].quotes.delete.one, data: result});
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
    let paramQuote = req.body;
    request({
        url: config.url + "/api/invoices/add",
        method: 'post',
        headers: utils.forward.getHeaders(req, true),
        json: {
            customer: paramQuote.customer,
            dateInvoice: paramQuote.dateQuote,
            subject: paramQuote.subject,
            content: paramQuote.content,
            datePayment: paramQuote.datePayment,
            dateExecution: paramQuote.dateQuote,
            collectionCost: paramQuote.collectionCost,
            comment: paramQuote.comment
        }
    }, function(err, response, body) {
        if (err)
            return res.status(err.statusCode).json({message: localization[req.language].customers.code.failed});

        res.status(200).json({message: body.message, data: body.data});
    });
}));

/**
 * @swagger
 * /quotes/send/{code}:
 *   get:
 *     tags:
 *       - Quotes
 *     description: Logged - Send a quote to the customer by email
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
 *       200:
 *         description: Quote sent
 *         schema:
 *           $ref: '#/definitions/Quote'
 */
router.get("/send/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let quote = await quoteModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!quote)
        return res.status(400).json({message: localization[req.language].quotes.code.failed});

    quote.status = "sent";
    quote.save();
    let result = await quote.fullFormat({owner: req.loggedUser._id, infos: true});
    pdf.getQuote(result, req.language, mailer.sendQuote);
    res.status(200).json({message: localization[req.language].quotes.send, data: result});
}));

/**
 * @swagger
 * /quotes/download/{code}:
 *   get:
 *     tags:
 *       - Quotes
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
router.get("/download/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let quote = await quoteModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!quote)
        return res.status(400).json({message: localization[req.language].quotes.code.failed});

    let result = await quote.fullFormat({owner: req.loggedUser._id, infos: true});
    pdf.getQuote(result, req.language);
    res.download(utils.pdf.getPath(result.user._id, result.code), "Devis - " + quote.code + ".pdf", function(err) {
        if (err)
            return res.status(500).json({message: localization[req.language].quotes.download.error});

        utils.pdf.remove(utils.pdf.getPath(result.user._id, result.code));
        res.status(200).json({message: localization[req.language].quotes.download.success, data: result});
    });
}));

module.exports = router;