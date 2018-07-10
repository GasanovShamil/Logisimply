let config = require("../config");
let content = require("./Content");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

let quoteSchema = mongoose.Schema ({
    customer: String,
    code: String,
    dateQuote: Date,
    subject: String,
    content: [content],
    datePayment: Date,
    validity: Number,
    collectionCost: Boolean,
    comment: String,
    status: Number,
    idUser: String,
    createdAt: Date,
    updatedAt: Date
});

quoteSchema.methods.withTotal = function() {
    let arrayContent = [];
    let discount = 0;
    let totalPriceET = 0;
    for (let i = 0; i < this.content.length; i++) {
        let line = this.content[i].withTotal();
        arrayContent.push(line);
        if (line.discount)
            discount += line.discount;
        totalPriceET += line.totalPriceET;
    }

    return {
        customer: this.customer,
        code: this.code,
        dateQuote: this.dateQuote,
        subject: this.subject,
        content: arrayContent,
        discount: discount,
        totalPriceET: totalPriceET,
        datePayment: this.datePayment,
        validity: this.validity,
        collectionCost: this.collectionCost,
        comment: this.comment,
        status: this.status,
        idUser: this.idUser,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

module.exports = mongoose.model("Quote", quoteSchema);