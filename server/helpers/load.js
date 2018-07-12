let userModel = require("../models/User");
let customerModel = require("../models/Customer");

module.exports = {
    infos: async (object, user) => {
        object.user = (await userModel.findOne({_id: user}).exec()).fullFormat();
        object.customer = (await customerModel.findOne({code: object.customer, user: user}).exec()).fullFormat();
        return object;
    },
    user: async function(object, user) {
        object.user = (await userModel.findOne({_id: user}).exec()).fullFormat();
        return object;
    },
    customer: async function(object, user) {
        object.customer = await customerModel.findOne({code: object.customer, user: user}).exec();
        return object;
    },
    incomes: async (object, user) => {
        return object;
    }
};