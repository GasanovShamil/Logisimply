let config = require("../config");
let utils = require("../helpers/utils");
let load = require("../helpers/load");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

let incomeSchema = mongoose.Schema ({
    method: String,
    amount: Number,
    invoice: String,
    user: String,
    dateIncome: Date,
    createdAt: Date,
    updatedAt: Date
});

incomeSchema.methods.fullFormat = function(include) {
    let result = {
        invoice: this.invoice,
        method: this.method,
        amount: this.amount,
        user: this.user,
        dateIncome: utils.formatDate(this.dateIncome)
    };

    if (include && include.logged) {
        if (include.user)
            result = load.user(result, include.logged);
    }

    return result;
};

module.exports = mongoose.model("Income", incomeSchema);