let config = require("../config");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database);

let quoteSchema = mongoose.Schema ({
    code: {type: String},
    customer: {type: String},
    dateQuote: {type: Date},
    subject: {type: String},
    content: [{
        reference: {type: String},
        label: {type: String},
        priceET: {type: Number},
        description: {type: String},
        quantity: {type: Number},
        discount: {type: Number},
        type: {type: String}
    }],
    datePayment: {type: Date},
    validity: {type: Number},
    collectionCost: {type: Boolean},
    comment: {type: String},
    idUser: {type: String},
    createdAt: {type : Date},
    updatedAt: {type : Date}
});

module.exports = mongoose.model("Quote", quoteSchema);