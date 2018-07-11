let config = require("../config");
let load = require("../helpers/load");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

let incomeSchema = mongoose.Schema ({
    invoice: String,
    method: String,
    amount: Number,
    user: String,
    createdAt: Date
});

incomeSchema.methods.fullFormat = function(include) {
    let result = {
        invoice: this.invoice,
        method: this.method,
        amount: this.amount,
        user: this.user,
        createdAt: this.createdAt
    };

    if (include && include.logged) {
        if (include.user)
            result = load.user(result, include.logged);
    }

    return result;
};

module.exports = mongoose.model("Income", incomeSchema);