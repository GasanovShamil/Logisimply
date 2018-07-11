let userModel = require("../models/User");
let customerModel = require("../models/Customer");

module.exports = {
    user: async (object, user) => {
        object.user = await userModel.findOne({_id: user});
        return object;
    },
    customer: async (object, user) => {
        object.customer = await customerModel.findOne({code: object.customer, user: user}).exec();
        return object;
    },
    incomes: async (object, user) => {
        return object;
    }
};