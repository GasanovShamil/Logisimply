let config = require("../config");
let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let mailer = require("../helpers/mailer");
let customerModel = require("../models/Customer");
let invoiceModel = require("../models/Invoice");
let incomeModel = require("../models/Income");
let userModel = require("../models/User");
let jwt = require("jsonwebtoken");
let md5 = require("md5");
let express = require("express");
let router = express.Router();

router.use(middleware.localize);
router.use(middleware.isLogged);

router.get("/incomesPerCustomerType", middleware.wrapper(async (req, res) => {
    let deletedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let privatesData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let professionalsData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let today = new Date();
    let incomes = await incomeModel.find({user: req.loggedUser._id, dateIncome: {$gte: new Date(today.getFullYear(), 1, 1), $lt: new Date(today.getFullYear() + 1, 1, 1)}});
    for (let i = 0; i < incomes.length; i++) {
        let customer = await customerModel.findOne({code: incomes[i].customer, user: req.loggedUser._id});
        if (!customer)
            deletedData[incomes[i].dateIncome.getMonth()] += incomes[i].amount;
        else if (customer.type === 'private')
            privatesData[incomes[i].dateIncome.getMonth()] += incomes[i].amount;
        else if (customer.type === 'professional')
            professionalsData[incomes[i].dateIncome.getMonth()] += incomes[i].amount;
    }

    res.status(200).json({deleted: deletedData, privates: privatesData, professionals: professionalsData});
}));

router.get("/incomesPerMethod", middleware.wrapper(async (req, res) => {
    let advancedData = 0;
    let assetData = 0;
    let paypalData = 0;
    let cashData = 0;
    let checkData = 0;
    let incomes = await incomeModel.find({user: req.loggedUser._id});
    for (let i = 0; i < incomes.length; i++) {
        switch (incomes[i].method) {
            case "advanced":
                advancedData += incomes[i].amount;
                break;
            case "asset":
                assetData += incomes[i].amount;
                break;
            case "paypal":
                paypalData += incomes[i].amount;
                break;
            case "cash":
                cashData += incomes[i].amount;
                break;
            case "check":
                checkData += incomes[i].amount;
                break;
        }
    }

    res.status(200).json({advanced: advancedData, asset: assetData, paypal: paypalData, cash: cashData, check: checkData});
}));

router.get("/paymentStateOfInvoices", middleware.wrapper(async (req, res) => {
    let payedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let sumToPayData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let today = new Date();
    let invoices = await invoiceModel.find({user: req.loggedUser._id, status: 'lock', dateInvoice: {$gte: new Date(today.getFullYear(), 1, 1), $lt: new Date(today.getFullYear() + 1, 1, 1)}});
    for (let i = 0; i < invoices.length; i++) {
        let invoice = await invoices[i].fullFormat({owner: req.loggedUser._id, incomes: true});
        payedData[invoice.dateInvoice.getMonth()] += invoice.payed;
        sumToPayData[invoice.dateInvoice.getMonth()] += invoice.sumToPay;
        sumToPayData[invoice.dateInvoice.getMonth()] *= -1;
    }

    res.status(200).json({payed: payedData, sumToPay: sumToPayData});
}));

module.exports = router;