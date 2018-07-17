let localization = require("../localization/localize");
let utils = require("../helpers/utils");

module.exports = {
    getQuote: function(quote, language, callback) {
        let document = require("lx-pdf")("./pdf/config/templates/quote.json");

        document.addContent("company_name", quote.user.activityEntitled);
        document.addContent("date_quote", localization[language].pdf.date + quote.dateQuote);
        document.addContent("company_infos", utils.pdf.formatTextBloc([localization[language].pdf.siret + utils.format.getSiret(quote.user.siret), quote.user.firstname + " " + quote.user.lastname + " - " + quote.user.email, quote.user.address, quote.user.zipCode + " " + quote.user.town, quote.user.country]));
        document.addContent("customer_infos", utils.pdf.formatTextBloc([quote.customer.civility + " " + quote.customer.name, quote.customer.address, quote.customer.zipCode + " " + quote.customer.town, quote.customer.country]));
        document.addContent("banner", localization[language].pdf.banner.quote + quote.code);
        document.addContent("object", localization[language].pdf.subject + quote.subject);
        document.addContent("legal_notice_immatriculation", localization[language].pdf.immatriculation);

        document.addTable("content", utils.pdf.getTableBody(quote.content), utils.pdf.getTableHead());
        document.addTable("discount", [[quote.discount]], [utils.pdf.getCell(localization[language].pdf.discount, 70, "center")]);
        document.addTable("total", [[quote.totalPriceET + " €"]], [utils.pdf.getCell(localization[language].pdf.total, 70, "center")]);
        document.addContent("legal_notice_tva",localization[language].pdf.tva);

        document.addContent("date_payment", utils.pdf.formatTextBloc([localization[language].pdf.date_payment + utils.format.formatDate(quote.datePayment), localization[language].pdf.validity + quote.validity]));
        if (quote.collectionCost)
            document.addContent("collection_cost", localization[language].pdf.collection_cost);

        document.addContent("comment", utils.pdf.formatTextBloc([localization[language].pdf.comment, quote.comment]));
        document.addContent("signature", utils.pdf.formatTextBloc([localization[language].pdf.accord, localization[language].pdf.signature]));
        document.addContent("foot_text", localization[language].pdf.generated.quote);
        document.addImage("foot_image", "./pdf/config/images/logo.png", {width: 50});

        document.save(utils.pdf.getPath(quote.user._id, quote.code), function(result) {
            document.clear();
            if (result !== null)
                console.log("PDF generate failed - user : " + quote.user._id + " / quote : " + quote.code);
            else {
                console.log("PDF generate succeeded - user : " + quote.user._id + " / quote : " + quote.code);
                callback(quote, language);
            }
        });
    },
    getInvoice: function(invoice, language, callback) {
        let document = require("lx-pdf")("./pdf/config/templates/invoice.json");

        document.addContent("company_name", invoice.user.activityEntitled);
        document.addContent("date_invoice", localization[language].pdf.date + invoice.dateInvoice);
        document.addContent("company_infos", utils.pdf.formatTextBloc([localization[language].pdf.siret + utils.format.getSiret(invoice.user.siret), invoice.user.firstname + " " + invoice.user.lastname + " - " + invoice.user.email, invoice.user.address, invoice.user.zipCode + " " + invoice.user.town, invoice.user.country]));
        document.addContent("customer_infos", utils.pdf.formatTextBloc([invoice.customer.civility + " " + invoice.customer.name, invoice.customer.address, invoice.customer.zipCode + " " + invoice.customer.town, invoice.customer.country]));
        document.addContent("banner", localization[language].pdf.banner.invoice + invoice.code);
        document.addContent("object", localization[language].pdf.subject + invoice.subject);
        document.addContent("legal_notice_immatriculation", localization[language].pdf.immatriculation);

        document.addTable("content", utils.pdf.getTableBody(invoice.content), utils.pdf.getTableHead(language));
        document.addTable("discount", [[invoice.discount + " €"]], [utils.pdf.getCell(localization[language].pdf.discount, 70, "center")]);
        document.addTable("total", [[invoice.totalPriceET + " €"]], [utils.pdf.getCell(localization[language].pdf.total, 70, "center")]);
        document.addTable("payed", [[invoice.payed + " €"]], [utils.pdf.getCell(localization[language].pdf.payed, 70, "center")]);
        document.addTable("sum_to_pay", [[invoice.sumToPay + " €"]], [utils.pdf.getCell(localization[language].pdf.sum_to_pay, 70, "center")]);
        document.addContent("legal_notice_tva",localization[language].pdf.tva);

        document.addContent("date_payment", utils.pdf.formatTextBloc([localization[language].pdf.date_payment + utils.format.formatDate(invoice.datePayment), localization[language].pdf.date_execution + utils.format.formatDate(invoice.dateExecution)]));
        if (invoice.collectionCost)
            document.addContent("collection_cost", localization[language].pdf.collection_cost);

        document.addContent("comment", utils.pdf.formatTextBloc([localization[language].pdf.comment, invoice.comment]));
        document.addContent("signature", utils.pdf.formatTextBloc([localization[language].pdf.accord, localization[language].pdf.signature]));
        document.addContent("foot_text", localization[language].pdf.generated.invoice);
        document.addImage("foot_image", "./pdf/config/images/logo.png", {width: 50});

        document.save(utils.pdf.getPath(invoice.user._id, invoice.code), function(result) {
            document.clear();
            if (result !== null)
                console.log("PDF generate failed - user : " + invoice.user._id + " / invoice : " + invoice.code);
            else {
                console.log("PDF generate succeeded - user : " + invoice.user._id + " / invoice : " + invoice.code);
                callback(invoice, language);
            }
        });
    }

};