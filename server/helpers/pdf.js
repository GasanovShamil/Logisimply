let config = require("../config");
let localization = require("../localization/localize");

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
        document.addContent("date_quote", "Date : " + quote.dateQuote);
        document.addContent("company_infos", this.formatTextBloc(["Siret : " + quote.user.siret, quote.user.firstname + " " + quote.user.lastname + " - " + quote.user.email, quote.user.address, quote.user.zipCode + " " + quote.user.town, quote.user.country]));
        document.addContent("customer_infos", this.formatTextBloc([quote.customer.civility + " " + quote.customer.name, quote.customer.address, quote.customer.zipCode + " " + quote.customer.town, quote.customer.country]));
        document.addContent("banner", "Devis - " + quote.code);
        if (quote.subject)
            document.addContent("object", "Objet : " + quote.subject);
        document.addContent("legal_notice_immatriculation", localization[language].pdf.immatriculation);

        document.addTable("content", this.getTableBody(quote.content), this.getTableHead());
        document.addTable("discount", [[quote.discount + " €"]], [this.getCell("Remise", 70, "center")]);
        document.addTable("total", [[quote.totalPriceET + " €"]], [this.getCell("Net à payer", 70, "center")]);
        document.addContent("legal_notice_tva",localization[language].pdf.tva);

        document.addContent("date_payment", this.formatTextBloc(["Date d'échéance de paiement : " + quote.datePayment, "Durée de validité : " + quote.validity + " jours"]));
        if (quote.collectionCost)
            document.addContent("collection_cost", localization[language].pdf.collection_cost);

        if (quote.comment)
            document.addContent("comment", this.formatTextBloc(["Commentaire :", quote.comment]));
        document.addContent("signature", this.formatTextBloc(["Bon pour accord le :", "Signature"]));
        document.addContent("foot_text", localization[language].pdf.generated.quote);
        document.addImage("foot_image", "./pdf/config/images/logo.png", {width: 50});

        let filename = "./pdf/" + quote.user._id + "_" + quote.code + ".pdf";

        document.save(filename, function(result) {
            document.clear();
            if (result !== null) {
                console.log("PDF generation failed - user : " + quote.user._id + " / quote : " + quote.code);
                return false;
            } else {
                console.log("PDF generation succeeded - user : " + quote.user._id + " / quote : " + quote.code);
                return filename;
            }
        });
    },
    getInvoice: function(invoice, language) {
        let document = require("lx-pdf")("./pdf/config/templates/invoice.json");

        document.addContent("company_name", invoice.user.activityEntitled);
        document.addContent("date_invoice", "Date : " + invoice.dateInvoice);
        document.addContent("company_infos", this.formatTextBloc(["Siret : " + invoice.user.siret, invoice.user.firstname + " " + invoice.user.lastname + " - " + invoice.user.email, invoice.user.address, invoice.user.zipCode + " " + invoice.user.town, invoice.user.country]));
        document.addContent("customer_infos", this.formatTextBloc([invoice.customer.civility + " " + invoice.customer.name, invoice.customer.address, invoice.customer.zipCode + " " + invoice.customer.town, invoice.customer.country]));
        document.addContent("banner", "Devis - " + invoice.code);
        if (invoice.subject)
            document.addContent("object", "Objet : " + invoice.subject);
        document.addContent("legal_notice_immatriculation", localization[language].pdf.immatriculation);

        document.addTable("content", this.getTableBody(invoice.content), this.getTableHead());
        document.addTable("advanced_payment", [[invoice.advancedPayment.amount + " €"]], [this.getCell("Acompte", 70, "center")]);
        document.addTable("discount", [[invoice.discount + " €"]], [this.getCell("Remise", 70, "center")]);
        document.addTable("total", [[invoice.totalPriceET + " €"]], [this.getCell("Net à payer", 70, "center")]);
        document.addContent("legal_notice_tva",localization[language].pdf.tva);

        document.addContent("date_payment", this.formatTextBloc(["Date d'échéance de paiement : " + invoice.datePayment, "Date de la vente/prestation : " + invoice.dateExecution]));
        if (invoice.collectionCost)
            document.addContent("collection_cost", localization[language].pdf.collection_cost);

        if (invoice.comment)
            document.addContent("comment", this.formatTextBloc(["Commentaire :", invoice.comment]));
        document.addContent("signature", this.formatTextBloc(["Bon pour accord le :", "Signature"]));
        document.addContent("foot_text", localization[language].pdf.generated.invoice);
        document.addImage("foot_image", "./pdf/config/images/logo.png", {width: 50});

        let filename = "./pdf/" + invoice.user._id + "_" + invoice.code + ".pdf";

        document.save(filename, function(result) {
            document.clear();
            if (result !== null) {
                console.log("PDF generation failed - user : " + invoice.user._id + " / invoice : " + invoice.code);
                return false;
            } else {
                console.log("PDF generation succeeded - user : " + invoice.user._id + " / invoice : " + invoice.code);
                return filename;
            }
        });
    }

};