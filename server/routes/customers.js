let express = require("express");
let router = express.Router();
let utils = require("../helpers/utils");
var customerModel = require("../models/Customer");

/**
 * @swagger
 * definition:
 *   PrivateCustomer:
 *     type: object
 *     properties:
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
 *       emailAddress:
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
 *     required:
 *       - type
 *       - lastname
 *       - emailAddress
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
 *       emailAddress:
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
 *     required:
 *       - type
 *       - name
 *       - emailAddress
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
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - missing fields or email invalid or customer already exists
 *       200:
 *         description: Customer created
 */
router.post("/add", function(req, res) {
    let paramCustomer = req.body;
    paramCustomer.idUser = req.loggedUser._id;
    if (paramCustomer.type === "Particulier")
        paramCustomer.name = (paramCustomer.lastname + " " + paramCustomer.firstname).trim();

    if (paramCustomer.emailAddress && paramCustomer.type && paramCustomer.name && paramCustomer.address && paramCustomer.zipCode && paramCustomer.town && paramCustomer.country) {
        if (utils.isEmailValid(paramCustomer.emailAddress)) {
            customerModel.find({emailAddress: paramCustomer.emailAddress, idUser: paramCustomer.idUser}, function (err, user) {
                if (err)
                    res.status(500).json({message: err});
                else if (user.length !== 0)
                    res.status(400).json({message: "Vous êtes déjà en relation avec ce client !"});
                else {
                    customerModel.create(paramCustomer, function (err) {
                        if (err)
                            res.status(500).json({message: err});
                        else
                            res.status(200).json({message: "Client créé avec succès"});
                    });
                }
            });
        } else
            res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
    } else
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
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
 *       500:
 *         description: Internal Server Error
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
router.get("/me", function(req, res) {
    customerModel.find({idUser: req.loggedUser._id}, function (err, customers) {
        if (err)
            res.status(500).json({message: err});
        else
            res.status(200).json(customers);
    });
});

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     description: Logged - Get one of my customers
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: An object of the requested customer
 *         schema:
 *           oneOf:
 *             - $ref: '#/definitions/PrivateCustomer'
 *             - $ref: '#/definitions/ProfessionalCustomer'
 */
router.get("/:id", function(req, res) {
    let paramId = req.params.id;
    customerModel.findOne({_id: paramId, idUser: req.loggedUser._id}, function (err, customer) {
        if (err)
            res.status(500).json({message: err});
        else
            res.status(200).json(customer);
    });
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
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       200:
 *         description: Customer updated
 */
router.put("/update", function(req, res) {
    let paramCustomer = req.body;
    customerModel.findOneAndUpdate({_id: paramCustomer._id, idUser: req.loggedUser._id}, paramCustomer, null, function(err) {
        if (err)
            res.status(500).json({message: err});
        else
            res.status(200).json({message: "Client correctement modifié"});
    });
});

/**
 * @swagger
 * /customers/{id]:
 *   delete:
 *     tags:
 *       - Customers
 *     description: Logged - Delete a customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       403:
 *         description: Error - user is logged out
 *       400:
 *         description: Error - Customer doesn't exist
 *       200:
 *         description: Customer deleted
 */
router.delete("/:id", function(req, res) {
    let paramId = req.params.id;
    customerModel.findOneAndRemove({_id: paramId, idUser: req.loggedUser._id}, function(err, customer){
        if (err)
            res.status(500).json({message: err});
        else if (!customer)
            res.status(400).json({message: "Ce client n'existe pas"});
        else
            res.status(200).json({message: "Client correctement supprimé"});
    });
});

module.exports = router;