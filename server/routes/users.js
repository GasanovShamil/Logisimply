var express = require('express');
var router = express.Router();
var userModel = require('../models/User');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
mongoose.connect('mongodb://172.18.0.2:27017/logisimply');

// Create a users
router.post('/addUser', function(req, res) {
    let addUser = req.body;
    userModel.create(addUser, function (err) {
        if (err)
            res.json({status:'error',message:err});
        else
            res.json({status:'success'});
    });

});

module.exports = router;
