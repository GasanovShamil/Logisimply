let config = require("../config");
let load = require("../helpers/load");
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
    status: String,
    user: String,
    createdAt: Date,
    updatedAt: Date
});

quoteSchema.methods.fullFormat = function(include) {
    let arrayContent = [];
    let discount = 0;
    let totalPriceET = 0;
    for (let i = 0; i < this.content.length; i++) {
        let line = this.content[i].withTotal();
        arrayContent.push(line);
        discount += line.discount;
        totalPriceET += line.totalPriceET;
    }

    let result = {
        customer: this.customer,
        code: this.code,
        dateQuote: this.dateQuote,
        subject: this.subject || "",
        content: arrayContent,
        discount: discount,
        totalPriceET: totalPriceET,
        datePayment: this.datePayment,
        validity: this.validity,
        collectionCost: this.collectionCost,
        comment: this.comment || "",
        status: this.status,
        user: this.user,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };

    if (include && include.owner) {
        if (include.infos)
            result = load.infos(result, include.owner);
        if (include.customer)
            result = load.customer(result, include.owner);
        if (include.user)
            result = load.user(result, include.owner);
    }

    return result;
};

module.exports = mongoose.model("Quote", quoteSchema);