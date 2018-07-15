let config = require("../config");
let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let pdf = require("../helpers/pdf");
let mailer = require("../helpers/mailer");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let incomeModel = require("../models/Income");
let invoiceModel = require("../models/Invoice");
var request = require("request");
let express = require("express");
let router = express.Router();

router.use(middleware.localize);

function getAuth(user) {
    return {
        user: user.parameters.paypal.client,
        pass: user.parameters.paypal.secret
    }
}

function getTransactions(invoice) {
    let items = [];
    for (let i = 0; i < invoice.content.length; i++)
        items.push({
            name: invoice.content[i].label,
            description: invoice.content[i].description,
            quantity: invoice.content[i].quantity,
            price: invoice.content[i].unitPriceET,
            tax: '0.00',
            sku: invoice.content[i].reference,
            currency: 'EUR'
        });

    return [{
        amount: {
            total: "1",
            currency: "EUR",
            details: {
                subtotal: "1",
                tax: "0.00",
                shipping: "0.00",
                handling_fee: "0.00",
                shipping_discount: "0.00",
                insurance: "0.00"
            }
        },
        description: "The payment transaction description.",
        custom: invoice.code,
        item_list: {
            items: items,
            shipping_address: {
                recipient_name: invoice.customer.name,
                line1: invoice.customer.address,
                city: invoice.customer.town,
                postal_code: invoice.customer.zipCode,
                phone: invoice.customer.phone
            }
        }
    }];
}

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

router.get("/:user/:code/create", middleware.wrapper(async (req, res) => {
    let paramUser = req.params.user;
    let paramCode = req.params.code;
    let invoice = await invoiceModel.findOne({code: paramCode, status: "lock", user: paramUser});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.income.impossible});
    else {
        let user = await userModel.findOne({_id: paramUser}).exec();
        let result = await invoice.fullFormat({owner: paramUser, infos: true});

        request({
            url: config.paypal_endpoint + "/v1/payments/payment",
            method: 'post',
            auth: getAuth(user),
            json: {
                intent: "sale",
                payer: {payment_method: "paypal"},
                redirect_urls: {return_url: "https://www.google.fr/search?q=salut&oq=salut&aqs=chrome..69i57j69i61j35i39l2j0l2.719j0j7&sourceid=chrome&ie=UTF-8"},
                transactions: getTransactions(result),
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

router.post("/execute", middleware.wrapper(async (req, res) => {
    let paramUser = req.body.user;
    let paramCode = req.body.invoice;
    let paramPayment = req.body.payment;
    let paramPayer = req.params.paymer;
    let invoice = await invoiceModel.findOne({code: paramCode, status: "lock", user: paramUser});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.income.impossible});
    else {
        let user = await userModel.findOne({_id: paramUser}).exec();
        let result = await invoice.fullFormat({owner: paramUser, infos: true});

        request({
            url: config.paypal_endpoint + "/v1/payments/payment/" + paramPayment + "/execute",
            method: 'post',
            auth: getAuth(user),
            json: {
                payer_id: paramPayer,
                transactions: getTransactions(result),
                note_to_payer: result.comment
            }
        }, function(err, response, body) {
            if (err)
                res.sendStatus(500);
            else
                res.json({status: "success"});
        });
    }
}));

/**
 * @swagger
 * /payment/add:
 *   post:
 *     tags:
 *       - Invoices
 *     description: Logged - Add an income to an invoice
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