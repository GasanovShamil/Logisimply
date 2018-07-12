let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let express = require("express");
let router = express.Router();

/**
 * @swagger
 * definition:
 *   PrivateCustomer:
 *     type: object
 *     properties:
 *       code:
 *         type: string
 *       type:
 *         type: string
 *       civility:
 *         type: string
 *       lastname:
 *         type: string
 *       firstname:
 *         type: string
 *       phone:
 *         type: string
 *       email:
 *         type: string
 *       address:
 *         type: string
 *       zipCode:
 *         type: string
 *       town:
 *         type: string
 *       country:
 *         type: string
 *       assets:
 *         type: number
 *       comment:
 *         type: string
 *       user:
 *         type: string
 *       createdAt:
 *         type: date
 *       updatedAt:
 *         type: date
 *     required:
 *       - type
 *       - lastname
 *       - email
 *       - address
 *       - zipCode
 *       - town
 *       - country
 *   ProfessionalCustomer:
 *     type: object
 *     properties:
 *       code:
 *         type: string
 *       type:
 *         type: string
 *       name:
 *         type: string
 *       phone:
 *         type: string
 *       legalForm:
 *         type: string
 *       siret:
 *         type: string
 *       email:
 *         type: string
 *       address:
 *         type: string
 *       zipCode:
 *         type: string
 *       town:
 *         type: string
 *       country:
 *         type: string
 *       assets:
 *         type: number
 *       comment:
 *         type: string
 *       user:
 *         type: string
 *       createdAt:
 *         type: date
 *       updatedAt:
 *         type: date
 *     required:
 *       - type
 *       - name
 *       - email
 *       - address
 *       - zipCode
 *       - town
 *       - country
 */

router.use(middleware.localize);
router.use(middleware.isLogged);

/**
 * @swagger
 * /customers/add:
 *   post:
 *     tags:
 *       - Customers
 *     description: Logged - Create a customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: PrivateCustomer or ProfessionalCustomer
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - missing fields or email invalid or customer already exists
 *       200:
 *         description: Customer created
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 */
router.post("/add", middleware.wrapper(async (req, res) => {
    let paramCustomer = req.body;
    if (paramCustomer.type !== "professional" && paramCustomer.type !== "private")
        res.status(400).json({message: localization[req.language].fields.prohibited});
    else {
        if (paramCustomer.type === "private")
            paramCustomer.name = (paramCustomer.firstname + " " + paramCustomer.lastname).trim();
        if (!utils.isCustomerComplete(paramCustomer))
            res.status(400).json({message: localization[req.language].fields.required});
        else if (!utils.isEmailValid(paramCustomer.email))
            res.status(400).json({message: localization[req.language].email.invalid});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            user.parameters.customers += 1;
            user.save();
            paramCustomer.code = "C" + utils.getCode(user.parameters.customers);
            paramCustomer.assets = 0;
            paramCustomer.user = req.loggedUser._id;
            paramCustomer.createdAt = new Date();
            let customer = await customerModel.create(paramCustomer);
            let result = await customer.fullFormat();
            res.status(200).json({message: localization[req.language].customers.add, data: result});
        }
    }
}));

/**
 * @swagger
 * /customers/me:
 *   get:
 *     tags:
 *       - Customers
 *     description: Logged - Get all my customers
 *     produces:
 *       - application/json
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An array of requested customers
 *         schema:
 *           type: array
 *           items:
 *             oneOf:
 *               - $ref: '#/definitions/PrivateCustomer'
 *               - $ref: '#/definitions/ProfessionalCustomer'
 */
router.get("/me", middleware.wrapper(async (req, res) => {
    let customers = await customerModel.find({user: req.loggedUser._id});
    for (let i = 0; i < customers.length; i++)
        customers[i] = await customers[i].fullFormat();
    res.status(200).json(customers);
}));

/**
 * @swagger
 * /customers/{code}:
 *   get:
 *     tags:
 *       - Customers
 *     description: Logged - Get one of my customers
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Customer's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no customer for code
 *       200:
 *         description: An object of the requested customer
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 */
router.get("/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let customer = await customerModel.findOne({code: paramCode, user: req.loggedUser._id});
    if (!customer)
        res.status(400).json({message: localization[req.language].customers.code.failed});
    else {
        let result = await customer.fullFormat();
        res.status(200).json(result);
    }
}));

/**
 * @swagger
 * /customers/update:
 *   put:
 *     tags:
 *       - Customers
 *     description: Logged - Update customer's information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Customer to update
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no customer for code
 *       200:
 *         description: Customer updated
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 */
router.put("/update", middleware.wrapper(async (req, res) => {
    let paramCustomer = req.body;
    if (paramCustomer.assets)
        res.status(400).json({message: localization[req.language].fields.prohibited});
    else if (!utils.isCustomerComplete(paramCustomer))
        res.status(400).json({message: localization[req.language].fields.required});
    else if (!utils.isEmailValid(paramCustomer.email))
        res.status(400).json({message: localization[req.language].email.invalid});
    else {
        if (paramCustomer.type === "private")
            paramCustomer.name = (paramCustomer.firstname + " " + paramCustomer.lastname).trim();
        paramCustomer.updatedAt = new Date();
        await customerModel.findOneAndUpdate({code: paramCustomer.code, user: req.loggedUser._id}, paramCustomer, null);
        let customer = await customerModel.findOne({code: paramCustomer.code, user: req.loggedUser._id});
        if (!customer)
            res.status(400).json({message: localization[req.language].customers.code.failed});
        else {
            let result = await customer.fullFormat();
            res.status(200).json({message: localization[req.language].customers.update, data: result});
        }
    }
}));

/**
 * @swagger
 * /customers/delete/{code}:
 *   delete:
 *     tags:
 *       - Customers
 *     description: Logged - Delete a customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Customer's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - no customer for code
 *       200:
 *         description: Customer deleted
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 */
router.delete("/delete/:code", middleware.wrapper(async (req, res) => {
    let paramCode = req.params.code;
    let customer = await customerModel.findOneAndRemove({code: paramCode, user: req.loggedUser._id});
    if (!customer)
        res.status(400).json({message: localization[req.language].customers.code.failed});
    else {
        let result = await customer.fullFormat();
        res.status(200).json({message: localization[req.language].customers.delete.one, data: result});
    }
}));

/**
 * @swagger
 * /customers/delete:
 *   post:
 *     tags:
 *       - Customers
 *     description: Logged - Delete multiple customers
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Customers to delete
 *         in: body
 *         required: true
 *         type: array
 *         items:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 *     responses:
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Customers deleted
 *         schema:
 *           type: number
 */
router.post("/delete", middleware.wrapper(async (req, res) => {
    let paramCustomers = req.body;
    let count = 0;
    for (let i = 0; i < paramCustomers.length; i++) {
        let customer = await customerModel.findOneAndRemove({code: paramCustomers[i].code, user: req.loggedUser._id});
        if (customer)
            count++;
    }
    res.status(200).json({message: localization[req.language].customers.delete.multiple, data: count});
}));

module.exports = router;