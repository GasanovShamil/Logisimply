var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
mongoose.connect('mongodb://172.18.0.2:27017/logisimply');

router.post('/', function(req, res) {
    let nameCustomer = req.body.nameCust;
    let firstnameCust = req.body.firstnameCust;
    let emailCust = req.body.emailCust;
    let siren = req.body.siren;
});