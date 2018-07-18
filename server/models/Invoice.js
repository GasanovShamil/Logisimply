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
    advancedPayment: Number,
    datePayment: Date,
    dateExecution: Date,
    collectionCost: Boolean,
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
        dateInvoice: this.dateInvoice,
        subject: this.subject || "",
        content: arrayContent,
        discount: discount,
        totalPriceET: totalPriceET,
        advancedPayment: this.advancedPayment,
        sumToPay: totalPriceET - discount - this.advancedPayment,
        payed: this.advancedPayment,
        incomes: [],
        datePayment: this.datePayment,
        dateExecution: this.dateExecution,
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
        if (include.incomes)
            result = load.incomes(result, include.owner);
    }

    return result;
};

module.exports = mongoose.model("Invoice", invoiceSchema);