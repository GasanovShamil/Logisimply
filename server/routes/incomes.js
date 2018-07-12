let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let customerModel = require("../models/Customer");
let express = require("express");
let router = express.Router();

router.use(middleware.localize);
router.use(middleware.isLogged);

/**
 * @swagger
 * /incomes/add/{code}:
 *   post:
 *     tags:
 *       - Incomes
 *     description: Logged - Add an asset to a customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Amount to add
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
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 */
router.post("/add/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let paramAmount = req.body.amount
    let customer = await customerModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!customer)
        res.status(400).json({message: localization[req.language].customers.code.failed});
    else {
        customer.assets += paramAmount;
        customer.save();
        res.status(200).json({message: localization[req.language].customers.assets.add, data: customer});
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
 *             oneOf:
 *               - $ref: '#/definitions/PrivateCustomer'
 *               - $ref: '#/definitions/ProfessionalCustomer'
 */
router.get("/me", middleware.wrapper(async (req, res) => {
    let customers = await customerModel.find({assets: {$gt: 0}, user: req.loggedUser._id});
    res.status(200).json(customers);
}));

module.exports = router;