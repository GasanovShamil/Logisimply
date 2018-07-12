let localization = require("../localization/localize");
let utils = require("../helpers/utils");

module.exports = {
    getCell: function(text, width, align, font) {
        return {
            text: text,
            width: width,
            align: align || "left",
            font: font || {name: "./pdf/config/fonts/arial.ttf"},
            background: "#111f46",
            color: "#FFFFFF"
        };
    },
    formatTextBloc: function(bloc) {
        for (let i = 0; i < bloc.length; i++)
            bloc[i] = bloc[i].trim();
        return bloc.join("\n");
    },
    getTableHead: function() {
        return [
            this.getCell("Ref", 35),
            this.getCell("Libellé", 85),
            this.getCell("Description", 245),
            this.getCell("P.U. H.T.", 40),
            this.getCell("Qte", 40, "center"),
            this.getCell("Remise (€)", 40, "center"),
            this.getCell("Total H.T.", 76, "center")
        ];
    },
    getTableBody: function(content) {
        let result = [];
        for (let i = 0; i < content.length; i++)
            result.push([content[i].reference, content[i].label, content[i].description, content[i].unitPriceET, content[i].quantity, content[i].discount, content[i].totalPriceET])
        result.push(['']);
        return result;
    },
    getQuote: function(quote, language) {
        let document = require("lx-pdf")("./pdf/config/templates/quote.json");

        document.addContent("company_name", quote.user.activityEntitled);
        document.addContent("date_quote", localization[language].pdf.date + quote.dateQuote);
        document.addContent("company_infos", this.formatTextBloc([localization[language].pdf.siret + quote.user.siret, quote.user.firstname + " " + quote.user.lastname + " - " + quote.user.email, quote.user.address, quote.user.zipCode + " " + quote.user.town, quote.user.country]));
        document.addContent("customer_infos", this.formatTextBloc([quote.customer.civility + " " + quote.customer.name, quote.customer.address, quote.customer.zipCode + " " + quote.customer.town, quote.customer.country]));
        document.addContent("banner", localization[language].pdf.banner.quote + quote.code);
        if (quote.subject)
            document.addContent("object", localization[language].pdf.subject + quote.subject);
        document.addContent("legal_notice_immatriculation", localization[language].pdf.immatriculation);

        document.addTable("content", this.getTableBody(quote.content), this.getTableHead());
        document.addTable("discount", [[quote.discount]], [this.getCell(localization[language].pdf.discount, 70, "center")]);
        document.addTable("total", [[quote.totalPriceET + " €"]], [this.getCell(localization[language].pdf.total, 70, "center")]);
        document.addContent("legal_notice_tva",localization[language].pdf.tva);

        document.addContent("date_payment", this.formatTextBloc([localization[language].pdf.date_payment + quote.datePayment, localization[language].pdf.validity + quote.validity]));
        if (quote.collectionCost)
            document.addContent("collection_cost", localization[language].pdf.collection_cost);

        if (quote.comment)
            document.addContent("comment", this.formatTextBloc([localization[language].pdf.comment, quote.comment]));
        document.addContent("signature", this.formatTextBloc([localization[language].pdf.accord, localization[language].pdf.signature]));
        document.addContent("foot_text", localization[language].pdf.generated.quote);
        document.addImage("foot_image", "./pdf/config/images/logo.png", {width: 50});

        document.save(utils.getPdfPath(quote.user._id, quote.code), function(result) {
            document.clear();
            if (result !== null)
                console.log("PDF generate failed - user : " + quote.user._id + " / quote : " + quote.code);
            else
                console.log("PDF generate succeeded - user : " + quote.user._id + " / quote : " + quote.code);
        });
    },
    getInvoice: function(invoice, language) {
        let document = require("lx-pdf")("./pdf/config/templates/invoice.json");

        document.addContent("company_name", invoice.user.activityEntitled);
        document.addContent("date_invoice", localization[language].pdf.date + invoice.dateInvoice);
        document.addContent("company_infos", this.formatTextBloc([localization[language].pdf.siret + invoice.user.siret, invoice.user.firstname + " " + invoice.user.lastname + " - " + invoice.user.email, invoice.user.address, invoice.user.zipCode + " " + invoice.user.town, invoice.user.country]));
        document.addContent("customer_infos", this.formatTextBloc([invoice.customer.civility + " " + invoice.customer.name, invoice.customer.address, invoice.customer.zipCode + " " + invoice.customer.town, invoice.customer.country]));
        document.addContent("banner", localization[language].pdf.banner.invoice + invoice.code);
        if (invoice.subject)
            document.addContent("object", localization[language].pdf.subject + invoice.subject);
        document.addContent("legal_notice_immatriculation", localization[language].pdf.pdf.immatriculation);

        document.addTable("content", this.getTableBody(invoice.content), this.getTableHead());
        document.addTable("advanced_payment", [[invoice.advancedPayment.amount + " €"]], [this.getCell(localization[language].pdf.advanced_payment, 70, "center")]);
        document.addTable("discount", [[invoice.discount]], [this.getCell(localization[language].pdf.discount, 70, "center")]);
        document.addTable("total", [[invoice.totalPriceET + " €"]], [this.getCell(localization[language].pdf.total, 70, "center")]);
        document.addContent("legal_notice_tva",localization[language].pdf.pdf.tva);

        document.addContent("date_payment", this.formatTextBloc([localization[language].pdf.date_payment + invoice.datePayment, localization[language].pdf.date_execution + invoice.dateExecution]));
        if (invoice.collectionCost)
            document.addContent("collection_cost", localization[language].pdf.collection_cost);

        if (invoice.comment)
            document.addContent("comment", this.formatTextBloc([localization[language].pdf.comment, invoice.comment]));
        document.addContent("signature", this.formatTextBloc([localization[language].pdf.accord, localization[language].pdf.signature]));
        document.addContent("foot_text", localization[language].pdf.generated.invoice);
        document.addImage("foot_image", "./pdf/config/images/logo.png", {width: 50});

        document.save(utils.getPdfPath(invoice.user._id, invoice.code), function(result) {
            document.clear();
            if (result !== null)
                console.log("PDF generate failed - user : " + invoice.user._id + " / invoice : " + invoice.code);
            else
                console.log("PDF generate succeeded - user : " + invoice.user._id + " / invoice : " + invoice.code);
        });
    }

};