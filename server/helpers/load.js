let userModel = require("../models/User");
let customerModel = require("../models/Customer");

module.exports = {
    infos: async (object, user) => {
        object.user = (await userModel.findOne({_id: user}).exec()).fullFormat({credentials: true});
        object.customer = (await customerModel.findOne({code: object.customer, user: user}).exec()).fullFormat();
        return object;
    },
    user: async (object, user) => {
        object.user = (await userModel.findOne({_id: user}).exec()).fullFormat();
        return object;
    },
    customer: async (object, user) => {
        object.customer = (await customerModel.findOne({code: object.customer, user: user}).exec()).fullFormat();
        return object;
    },
    incomes: async (object, user) => {
        return object;
    }
};