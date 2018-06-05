// var express = require('express');
// var router = express.Router();
// var customerModel = require('../models/Customer');
// const mongoose = require('mongoose');
// var jwt = require('jsonwebtoken');
// mongoose.connect('mongodb://172.18.0.2:27017/logisimply');
//
// router.post('/', function(req, res) {
//     let addCustomer = req.body;
//
//     if (addCustomer.status == "Particulier") {
//         if (addCustomer.nom && addCustomer.prenom && addCustomer.civilite && addCustomer.emailClient && addCustomer.adresse && addCustomer.codePostal && addCustomer.ville && addCustomer.pays) {
//             var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//             if (regex.test(String(addCustomer.emailClient).toLowerCase())) {
//                 customerModel.find({emailClient: addUser.emailClient}, function (err, customer) {
//                     if (!err && customer.length !== 0) {
//                         res.status(400).json({message: "Cette adresse email est déjà associée à un compte"});
//                     } else {
//                         customerModel.create(addCustomer, function (err) {
//                             if (err) {
//                                 res.status(400).json({message: err});
//                             } else {
//                                 res.status(200).json({message: "Le client a créé avec succès"});
//                             }
//                         });
//                     }
//                 });
//             }
//         }
//     } else if (addCustomer == "Professionnel") {
//
//     } else {
//         res.status(400).json({message: "Merci de remplir le status du client !"});
//     }
// });