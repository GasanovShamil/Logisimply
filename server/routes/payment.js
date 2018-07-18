let config = require("../config");
let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let incomeModel = require("../models/Income");
let invoiceModel = require("../models/Invoice");
let request = require("request");
let express = require("express");
let router = express.Router();

/**
 * @swagger
 * definition:
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

/**
 * @swagger
 * /payment/{user}/{code}/display:
 *   get:
 *     tags:
 *       - Invoices
 *     description: Logged - Payment of a specific invoice
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: User's id
 *         in: path
 *         required: true
 *         type: string
 *       - description: Invoice's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       400:
 *         description: Error - no invoice for code
 *       200:
 *         description: An object of the requested invoice
 *         schema:
 *           $ref: '#/definitions/Invoice'
 */
router.get("/:user/:code/display", middleware.wrapper(async (req, res) => {
    let paramUser = req.params.user;
    let paramCode = req.params.code;
    let invoice = await invoiceModel.findOne({code: paramCode, status: "lock", user: paramUser});
    if (!invoice)
        return res.status(400).json({message: localization[req.language].invoices.income.impossible});

    let result = await invoice.fullFormat({owner: paramUser, infos: true});
    res.status(200).json(result);
}));


/**
 * @swagger
 * /payment/paypal/create:
 *   post:
 *     tags:
 *       - Payment
 *     description: Anonymous - Create the PayPal Payment
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Payment's information
 *         in: body
 *         required: true
 *         type: object
 *         properties:
 *           user:
 *             type: string
 *           code:
 *             type: string
 *           amount:
 *             type: number
 *     responses:
 *       400:
 *         description: Error - no invoice for code and user
 *       200:
 *         description: The payment's id
 */
router.post("/paypal/create", middleware.wrapper(async (req, res) => {
    let paramUser = req.body.user;
    let paramCode = req.body.code;
    let paramAmount = req.body.amount;
    let invoice = await invoiceModel.findOne({code: paramCode, status: "lock", user: paramUser});
    if (!invoice)
        return res.status(400).json({message: localization[req.language].invoices.income.impossible});

    let user = await userModel.findOne({_id: paramUser}).exec();
    request({
        url: config.paypal_endpoint + "/v1/payments/payment",
        method: 'post',
        auth: utils.paypal.getAuth(user),
        json: {
            intent: "sale",
            payer: {payment_method: "paypal"},
            transactions: utils.paypal.getTransactions(invoice, paramAmount),
            redirect_urls: {return_url: config.url + '/payment/' + paramUser + '/' + paramCode, cancel_url: config.url + '/payment/' + paramUser + '/' + paramCode},
            note_to_payer: invoice.comment
        }
    }, function(err, response, body) {
        if (err)
            return res.sendStatus(500);

        res.status(200).json({id: body.id});
    });
}));

/**
 * @swagger
 * /payment/paypal/execute:
 *   post:
 *     tags:
 *       - Payment
 *     description: Anonymous - Execute the PayPal Payment
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Payment's information
 *         in: body
 *         required: true
 *         type: object
 *         properties:
 *           user:
 *             type: string
 *           code:
 *             type: string
 *           amount:
 *             type: number
 *           payment:
 *             type: string
 *           payer:
 *             type: string
 *     responses:
 *       400:
 *         description: Error - no invoice for code and user
 *       200:
 *         description: Result of the execution
 */
router.post("/paypal/execute", middleware.wrapper(async (req, res) => {
    let paramUser = req.body.user;
    let paramCode = req.body.code;
    let paramAmount = req.body.amount;
    let paramPayment = req.body.payment;
    let paramPayer = req.body.payer;
    let invoice = await invoiceModel.findOne({code: paramCode, status: "lock", user: paramUser});
    if (!invoice)
        return res.status(400).json({message: localization[req.language].invoices.income.impossible});

    let user = await userModel.findOne({_id: paramUser}).exec();
    request({
        url: config.paypal_endpoint + "/v1/payments/payment/" + paramPayment + "/execute",
        method: "post",
        auth: utils.paypal.getAuth(user),
        json: {
            payer_id: paramPayer,
            transactions: utils.paypal.getTransactions(invoice, paramAmount)
        }
    }, function(err, response) {
        if (err)
            return res.sendStatus(500);

        let executeStatus = response.statusCode;
        request({
            url: config.url + "/api/payment/add/",
            method: "post",
            headers: utils.forward.getHeaders(req, false),
            json: {
                method: "paypal",
                amount: paramAmount,
                invoice: invoice.code,
                user: invoice.user,
                customer: invoice.customer,
                dateIncome: new Date()
            }
        }, function(err, response, body) {
            if (err)
                return res.sendStatus(500);

            res.json({executeStatus: executeStatus, incomeStatus: response.statusCode, message: body.message, data: body.data.income});
        });
    });
}));

/**
 * @swagger
 * /payment/add:
 *   post:
 *     tags:
 *       - Payment
 *     description: Anonymous - Add an income to an invoice
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Income to add
 *         in: body
 *         required: true
 *         type: number
 *     responses:
 *       403:
 *         description: Error - customer assets is lower than amount
 *       400:
 *         description: Error - no customer for code
 *       200:
 *         description: Amount added
 *         schema:
 *           $ref: '#/definitions/Income'
 */
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramIncome = req.body;

    if (!utils.fields.isIncomeMethodValid(paramIncome.method) || paramIncome.amount <= 0)
        return res.status(400).json({message: localization[req.language].fields.prohibited});

    if (!utils.fields.isIncomeComplete(paramIncome))
        return res.status(400).json({message: localization[req.language].fields.required});

    let countInvoice = await invoiceModel.countDocuments({code: paramIncome.invoice, customer: paramIncome.customer, status: "lock", user: paramIncome.user});
    if (countInvoice === 0)
        return res.status(400).json({message: localization[req.language].invoices.income.impossible});

    paramIncome.createdAt = new Date();
    if (paramIncome.method === "asset") {
        let customer = await customerModel.findOne({code: paramIncome.customer, user: paramIncome.user});
        if (!customer)
            return res.status(400).json({message: localization[req.language].customers.code.failed});

        if (paramIncome.amount > customer.assets)
            return res.status(403).json({message: localization[req.language].customers.assets.failed});
        console.log(typeof paramIncome.amount);
        customer.assets -= paramIncome.amount;
        customer.save();
    }

    let invoice = await invoiceModel.findOne({code: paramIncome.invoice, customer: paramIncome.customer, status: "lock", user: paramIncome.user});
    let check = await invoice.fullFormat({owner: paramIncome.user, incomes: true});
    if (paramIncome.amount > check.sumToPay)
        return res.status(400).json({message: localization[req.language].fields.prohibited});

    if (paramIncome.amount === check.sumToPay) {
        invoice.status = "payed";
        invoice.save();
    }

    let income = await incomeModel.create(paramIncome);
    let resultIncome = await income.fullFormat();
    let resultInvoice = await invoice.fullFormat({owner: paramIncome.user, infos: true});
    res.status(200).json({message: localization[req.language].invoices.income.success, data: {income: resultIncome, invoice: resultInvoice}});
}));

module.exports = router;