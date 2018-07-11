let mongoose = require("mongoose");

let contentSchema = mongoose.Schema ({
    reference: String,
    label: String,
    description: String,
    type: String,
    unitPriceET: Number,
    quantity: Number,
    discount: Number
});

contentSchema.methods.withTotal = function() {
    return {
        reference: this.reference,
        label: this.label,
        description: this.description,
        type: this.type,
        unitPriceET: this.unitPriceET,
        quantity: this.quantity,
        discount: this.discount || 0,
        totalPriceET: (this.unitPriceET * this.quantity) - (this.discount ? this.discount : 0)
    };
};

module.exports = contentSchema;