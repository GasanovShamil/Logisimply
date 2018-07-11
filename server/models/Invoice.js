let config = require("../config");
let utils = require("../helpers/utils");
let load = require("../helpers/load");
let content = require("./Content");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

let invoiceSchema = mongoose.Schema ({
    customer: String,
    code: String,
    dateInvoice: Date,
    subject: String,
    content: [content],
    datePayment: Date,
    dateExecution: Date,
    collectionCost: Boolean,
    advancedPayment: {
      amount: Number,
      status: String
    },
    comment: String,
    status: String,
    user: String,
    createdAt: Date,
    updatedAt: Date
});

invoiceSchema.methods.fullFormat = function(include) {
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
        dateInvoice: utils.formatDate(this.dateInvoice),
        subject: this.subject || "",
        content: arrayContent,
        discount: discount,
        totalPriceET: totalPriceET,
        datePayment: utils.formatDate(this.datePayment),
        dateExecution: utils.formatDate(this.dateExecution),
        collectionCost: this.collectionCost,
        advancedPayment: this.advancedPayment,
        comment: this.comment || "",
        status: this.status,
        user: this.user,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };

    //TODO: check why only the first call in loaded

    if (include && include.logged) {
        if (include.infos)
            result = load.infos(result, include.logged);
        if (include.customer)
            result = load.customer(result, include.logged);
        if (include.user)
            result = load.user(result, include.logged);
    }

    return result;
};

module.exports = mongoose.model("Invoice", invoiceSchema);