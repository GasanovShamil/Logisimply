let express = require("express");
let router = express.Router();
let utils = require("../helpers/utils");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");

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
 *       comment:
 *         type: string
 *       idUser:
 *         type: string
 *       createdAt:
 *         type: string
 *         format: date
 *       updatedAt:
 *         type: string
 *         format: date
 *     required:
 *       - type
 *       - lastname
 *       - email
 *       - address
 *       - zipCode
 *       - town
 *       - country
 *       - idUser
 *   ProfessionalCustomer:
 *     type: object
 *     properties:
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
 *       comment:
 *         type: string
 *       idUser:
 *         type: string
 *       createdAt:
 *         type: Date
 *       updatedAt:
 *         type: Date
 *     required:
 *       - type
 *       - name
 *       - email
 *       - address
 *       - zipCode
 *       - town
 *       - country
 *       - idUser
 */

router.use(utils.isLogged);

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
 */
router.post("/add", async (req, res) => {
    let paramCustomer = req.body;
    if (!(paramCustomer.email && paramCustomer.type && paramCustomer.name && paramCustomer.address && paramCustomer.zipCode && paramCustomer.town && paramCustomer.country))
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
    else if (!utils.isEmailValid(paramCustomer.email))
        res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
    else {
        let count = await customerModel.count({email: paramCustomer.email, idUser: req.loggedUser._id});
        if (count !== 0)
            res.status(400).json({message: "Vous avez déjà créé ce client"});
        else {
            let user = await userModel.findOne({_id: req.loggedUser._id});
            let nextCode = "00000" + user.parameters.customers;
            user.parameters.customers += 1;
            user.save();
            paramCustomer.code = "C" + nextCode.substring(nextCode.length - 5, nextCode.length);
            paramCustomer.idUser = req.loggedUser._id;
            paramCustomer.createdAt = new Date();
            if (paramCustomer.type === "Particulier")
                paramCustomer.name = (paramCustomer.lastname + " " + paramCustomer.firstname).trim();
            let customer = await customerModel.create(paramCustomer);
            res.status(200).json({message: "Client créé : " + customer.code});
        }
    }
});

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
router.get("/me", async (req, res) => {
    let customers = await customerModel.find({idUser: req.loggedUser._id});
    res.status(200).json(customers);
});

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
 *       200:
 *         description: An object of the requested customer
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 */
router.get("/:code", async (req, res) => {
    let paramCode = req.params.code;
    let customer = await customerModel.findOne({code: paramCode, idUser: req.loggedUser._id});
    res.status(200).json(customer);
});

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
 *         description: Error - no customer for code
 *       200:
 *         description: Customer updated
 */
router.put("/update", async (req, res) => {
    let paramCustomer = req.body;
    if (!(paramCustomer.email && paramCustomer.type && paramCustomer.name && paramCustomer.address && paramCustomer.zipCode && paramCustomer.town && paramCustomer.country))
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
    else if (!utils.isEmailValid(paramCustomer.email))
        res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
    else {
        paramCustomer.updatedAt = new Date();
        let customer = await customerModel.findOneAndUpdate({code: paramCustomer.code, idUser: req.loggedUser._id}, paramCustomer, null);
        if (!customer)
            res.status(400).json({message: "Aucun client ne correspond au code : " + paramCustomer.code});
        else
            res.status(200).json({message: "Client modifié : " + customer.code});
    }
});

/**
 * @swagger
 * /customers/{code]:
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
 */
router.delete("/:code", async (req, res) => {
    let paramCode = req.params.code;
    let customer = await customerModel.findOneAndRemove({code: paramCode, idUser: req.loggedUser._id});
    if (!customer)
        res.status(400).json({message: "Aucun client ne correspond au code : " + paramCode});
    else
        res.status(200).json({message: "Client supprimé : " + customer.code});
});

module.exports = router;