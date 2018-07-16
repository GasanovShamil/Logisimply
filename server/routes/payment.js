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
        res.status(400).json({message: localization[req.language].invoices.income.impossible});
    else {
        let result = await invoice.fullFormat({owner: paramUser, infos: true});
        res.status(200).json(result);
    }
}));


/**
 * @swagger
 * /payment/create:
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
router.post("/create", middleware.wrapper(async (req, res) => {
    let paramUser = req.body.user;
    let paramCode = req.body.code;
    let paramAmount = req.body.amount;
    let invoice = await invoiceModel.findOne({code: paramCode, status: "lock", user: paramUser});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.income.impossible});
    else {
        let user = await userModel.findOne({_id: paramUser}).exec();
        let result = await invoice.fullFormat({owner: paramUser, customer: true});
        request({
            url: config.paypal_endpoint + "/v1/payments/payment",
            method: 'post',
            auth: utils.paypal.getAuth(user),
            json: {
                intent: "sale",
                payer: {payment_method: "paypal"},
                transactions: utils.paypal.getTransactions(result, paramAmount),
                redirect_urls: utils.paypal.getRedirect(paramUser, paramCode),
                note_to_payer: result.comment
            }
        }, function(err, response, body) {
            if (err)
                res.sendStatus(500);
            else
                res.status(200).json({id: body.id});
        });
    }
}));

/**
 * @swagger
 * /payment/execute:
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
router.post("/execute", middleware.wrapper(async (req, res) => {
    let paramUser = req.body.user;
    let paramCode = req.body.code;
    let paramAmount = req.body.amount;
    let paramPayment = req.body.payment;
    let paramPayer = req.body.payer;
    let invoice = await invoiceModel.findOne({code: paramCode, status: "lock", user: paramUser});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.income.impossible});
    else {
        let user = await userModel.findOne({_id: paramUser}).exec();
        let result = await invoice.fullFormat({owner: paramUser, infos: true});

        request({
            url: config.paypal_endpoint + "/v1/payments/payment/" + paramPayment + "/execute",
            method: "post",
            auth: utils.paypal.getAuth(user),
            json: {
                payer_id: paramPayer,
                transactions: utils.paypal.getTransactions(result, paramAmount)
            }
        }, function(err, response) {
            if (err)
                res.sendStatus(500);
            else {
                let executeStatus = response.statusCode;

                request({
                    url: config.url + "/api/payment/add/",
                    method: "post",
                    headers: utils.forward.getHeaders(req, false),
                    json: {
                        payer_id: paramPayer,
                        transactions: utils.paypal.getTransactions(result, paramAmount)
                    }
                }, function(err, response) {
                    if (err)
                        res.sendStatus(500);
                    else {
                        res.json({status: response.statusCode});
                    }
                });
            }
        });
    }
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
    if (!utils.fields.isIncomeMethodValid(paramIncome.method))
        res.status(400).json({message: localization[req.language].fields.prohibited});
    else if (!utils.fields.isIncomeComplete(paramIncome))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let countInvoice = await invoiceModel.countDocuments({code: paramIncome.invoice, customer: paramIncome.customer, status: "lock", user: paramIncome.user});
        if (countInvoice === 0)
            res.status(400).json({message: localization[req.language].invoices.income.impossible});
        else {
            paramIncome.createdAt = new Date();
            if (paramIncome.method === "asset") {
                let customer = await customerModel.findOne({code: paramIncome.customer, user: paramIncome.user});
                if (!customer) {
                    return res.status(400).json({message: localization[req.language].customers.code.failed});
                } else {
                    if (paramIncome.amount > customer.assets) {
                        return res.status(403).json({message: localization[req.language].customers.assets.failed});
                    } else {
                        customer.assets -= paramIncome.amount;
                        customer.save();
                    }
                }
            }
            let income = await incomeModel.create(paramIncome);
            let invoice = await invoiceModel.findOne({code: paramIncome.invoice, customer: paramIncome.customer, status: "lock", user: paramIncome.user});
            let check = await invoice.fullFormat({owner: income.user, incomes: true});
            if (check.sumToPay === 0) {
                invoice.status = "payed";
                invoice.save();
            }
            let result = await income.fullFormat();
            res.status(200).json({message: localization[req.language].invoices.income.success, data: result});
        }
    }
}));

module.exports = router;