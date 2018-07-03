var express = require('express');
var router = express.Router();
var customerModel = require('../models/Customer');
var utils = require('../helpers/utils');
const mongoose = require('mongoose');

mongoose.connect('mongodb://172.18.0.2:27017/logisimply');

/**
 * @swagger
 * definition:
 *   Customer:
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *       lastname:
 *         type: string
 *       firstname:
 *         type: string
 *       civility:
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
 *       idUser:
 *         type: string
 *   NewCustomer:
 *     allOf:
 *       - $ref: '#/definitions/Customer'
 *       - type: object
 *         required:
 *           - type
 *           - lastname
 *           - legalForm
 *           - siret
 *           - emailAddress
 *           - address
 *           - zipCode
 *           - town
 *           - idUser
 */

router.use(utils.isLogged);

/**
 * @swagger
 * /customers/addCustomer:
 *   post:
 *     tags:
 *       - Customers
 *     description: Create a customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: customer
 *         description: Customer object
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/NewCustomer'
 *     responses:
 *       400:
 *         description: Error because customer already exists
 *       200:
 *         description: Success
 */
router.post('/addCustomer', function(req, res) {
    let addCustomer = req.body;
    addCustomer.idUser = req.loggedUser._id;
    console.log('id' + req.loggedUser._id);

    if (addCustomer.emailAddress && addCustomer.type && addCustomer.lastname && addCustomer.legalForm && addCustomer.siret && addCustomer.address && addCustomer.zipCode && addCustomer.town) {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (regex.test(String(addCustomer.emailAddress).toLowerCase())) {
            customerModel.find({emailAddress: addCustomer.emailAddress, siret: addCustomer.siret, idUser: addCustomer.idUser}, function (err, user) {
                if (!err && user.length !== 0) {
                    res.status(400).json({message: "Vous êtes déjà en relation avec ce client !"});
                } else {
                    customerModel.create(addCustomer, function (err) {
                        if (err) {
                            res.status(400).json({message: err});
                        } else {
                            res.status(200).json({message: "Client créé avec succès"});
                        }
                    });
                }
            });
        } else {
            res.status(400).json({message: "Le format de l'adresse email n'est pas correct"});
        }
    } else {
        res.status(400).json({message: "Merci de bien remplir les champs obligatoires"});
    }
});

/**
 * @swagger
 * /customers:
 *   get:
 *     tags:
 *       - Customers
 *     description: Get my customers
 *     produces:
 *       - application/json
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       200:
 *         description: Success
 */
router.get('/', function(req, res) {
    let myId = req.loggedUser._id;
    customerModel.find({idUser: myId}, function (err, customers) {
        if (err) {
            res.status(500).json({message: "Un problème est survenu."});
        } else {
            res.status(200).json(customers);
        }
    });
});

/**
 * @swagger
 * /customers/{siret}:
 *   get:
 *     tags:
 *       - Customers
 *     description: Get my customers
 *     produces:
 *       - application/json
 *     responses:
 *       500:
 *         description: Internal Server Error
 *       200:
 *         description: Success
 */
router.get('/:siret', function(req, res) {
    let customerId = req.params.siret;
    let myId = req.loggedUser._id;
    customerModel.findOne({idUser: myId, siret: customerId}, function (err, customer) {
        if (err) {
            res.status(500).json({message: "Un problème est survenu."});
        } else {
            res.status(200).json(customer);
        }
    });
});

/**
 * @swagger
 * /customers/update:
 *   post:
 *     tags:
 *       - Customers
 *     description: Update customers' information
 *     produces:
 *       - application/json
 *     parameters:
 *       - description: Customer's id
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Customer'
 *     responses:
 *       500:
 *         description: An error message on customer's update
 *       200:
 *         description: The customer's data is updated
 *         schema:
 *           $ref: '#/definitions/Customer'
 */
router.put('/update', function(req, res) {
    let updateCustomer = req.body;

    customerModel.findOneAndUpdate({_id: updateCustomer._id, idUser: req.loggedUser._id}, updateCustomer, null, function(err) {
        if (err) {
            res.status(500).json({message: "Problème lors de la mise à jour du client"});
        } else {
            res.status(200).json({message: "Client correctement modifié"});
        }
    });
});

/**
 * @swagger
 * /customers/{id]:
 *   delete:
 *     tags:
 *       - Customers
 *     description: Delete a customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       500:
 *         description: Error
 *       200:
 *         description: Success
 */
router.delete('/:id', function(req, res) {
    let idCustomer = req.params.id;
    customerModel.findOneAndRemove({_id: idCustomer, idUser: req.loggedUser._id}, function(err){
        if (err)
            res.status(500).json({message: "Problème lors de la suppression du client"});
        else
            res.status(200).json({message: "Client correctement supprimé"});
    });
});

module.exports = router;