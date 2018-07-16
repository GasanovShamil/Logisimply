let utils = require("./utils");
let userModel = require("../models/User");
let customerModel = require("../models/Customer");
let incomeModel = require("../models/Income");

module.exports = {
    infos: async (object, user) => {
        if (object.user) {
            object.user = (await userModel.findOne({_id: user}).exec()).fullFormat({credentials: true});
            object.user.siret = utils.format.getSiret(object.user.siret);
        }
        if (object.customer) {
            object.customer = (await customerModel.findOne({code: object.customer, user: user}).exec()).fullFormat();
            object.customer.siret = utils.format.getSiret(object.customer.siret);
        }
        if (object.incomes && object.sumToPay && object.payed) {
            let incomes = await incomeModel.find({invoice: object.code, user: user}).exec();
            object.incomes = [];
            for (let i = 0; i < incomes.length; i++) {
                object.incomes.push(incomes[i].fullFormat());
                object.sumToPay -= incomes[i].amount;
                object.payed += incomes[i].amount;
            }
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
            for (let i = 0; i < incomes.length; i++) {
                object.sumToPay -= incomes[i].amount;
                object.payed += incomes[i].amount;
            }
        }
        return object;
    }
};