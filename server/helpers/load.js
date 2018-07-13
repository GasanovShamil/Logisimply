let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let incomeModel = require("../models/Income");

module.exports = {
    infos: async (object, user) => {
        if (object.user)
            object.user = (await userModel.findOne({_id: user}).exec()).fullFormat({credentials: true});
        if (object.customer)
            object.customer = (await customerModel.findOne({code: object.customer, user: user}).exec()).fullFormat();
        if (object.incomes && object.sumToPay) {
            let incomes = await incomeModel.find({invoice: object.code, user: user}).exec();
            object.incomes = incomes;
            for (let i = 0; i < incomes.length; i++)
                object.sumToPay -= incomes[i].amount;
        }
        return object;
    },
    user: async (object, user) => {
        if (object.user)
            object.user = (await userModel.findOne({_id: user}).exec()).fullFormat();
        return object;
    },
    customer: async (object, user) => {
        if (object.customer)
            object.customer = (await customerModel.findOne({code: object.customer, user: user}).exec()).fullFormat();
        return object;
    },
    incomes: async (object, user) => {
        if (object.incomes && object.sumToPay) {
            let incomes = await incomeModel.find({invoice: object.code, user: user}).exec();
            object.incomes = incomes;
            for (let i = 0; i < incomes.length; i++)
                object.sumToPay -= incomes[i].amount;
        }
        return object;
    }
};