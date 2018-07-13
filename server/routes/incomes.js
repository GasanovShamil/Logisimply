let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let invoiceModel = require("../models/Invoice");
let incomeModel = require("../models/Income");
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
 *       - dateIncome
 */

router.use(middleware.localize);
router.use(middleware.isLogged);

/**
 * @swagger
 * /incomes/add/{code}:
 *   post:
 *     tags:
 *       - Incomes
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
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no customer for code
 *       200:
 *         description: Amount added
 *         schema:
 *           $ref: '#/definitions/Income'
 */
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramIncome = req.body;
    if (!utils.isIncomeComplete(paramIncome))
        res.status(400).json({message: localization[req.language].fields.required});
    else {
        let countInvoice = await invoiceModel.countDocuments({code: paramIncome.invoice, status: "lock", user: paramIncome.user});
        if (countInvoice !== 0)
            res.status(400).json({message: localization[req.language].invoices.income.impossible});
        else {
            paramIncome.createdAt = new Date();
            let income = await incomeModel.create(paramIncome);
            let result = await income.fullFormat();
            res.status(200).json({message: localization[req.language].invoices.income.success, data: result});
        }
    }
}));

/**
 * @swagger
 * /incomes/me:
 *   get:
 *     tags:
 *       - Incomes
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
router.get("/me", middleware.wrapper(async (req, res) => {
    let customers = await customerModel.find({assets: {$gt: 0}, user: req.loggedUser._id});
    res.status(200).json(customers);
}));

module.exports = router;