let config = require("../config");
let load = require("../helpers/load");
let mongoose = require("mongoose");
mongoose.connect("mongodb://" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database, {useNewUrlParser: true});

let itemSchema = mongoose.Schema ({
    type: String,
    reference: String,
    label: String,
    priceET: Number,
    description: String,
    user: String,
    createdAt: Date,
    updatedAt: Date
});

itemSchema.methods.fullFormat = function(include) {
    let result = {
        type: this.type,
        reference: this.reference,
        label: this.label,
        priceET: this.priceET,
        description: this.description || "",
        user: this.user,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };

    if (include && include.owner) {
        if (include.user)
            result = load.user(result, include.owner);
    }

    return result;
};

module.exports = mongoose.model("Item", itemSchema);