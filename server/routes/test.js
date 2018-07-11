let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let invoiceModel = require("../models/Invoice");
let express = require("express");
let router = express.Router();

router.use(middleware.localize);

router.post("/:user/:invoice", middleware.wrapper(async (req, res) => {
    let paramId = req.params.user;
    let paramCode = req.params.invoice;
    let invoice = await invoiceModel.findOne({code: paramCode, idUser: paramId});
    if (!invoice)
        res.status(400).json({message: localization[req.language].invoices.code.failed});
    else
        res.status(200).json(invoice.withTotal());
}));

module.exports = router;