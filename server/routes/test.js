var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var md5 = require('md5');
var transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: 'contact.logisimply@gmail.com',
        pass: '@dminLogisimply00'
    }
});

mongoose.connect('mongodb://172.18.0.2:27017/logisimply');

// Activate user
router.get('/', function(req, res) {
    userModel.find({}, function (err, user) {
        if (!err) {
            res.status(400).json({message: "error"});
        } else {
            res.status(200).json({message: "success : " + user.length});
        }
    });
});

module.exports = router;