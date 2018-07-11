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
        return result;
    },
    generateQuote: async (quote, user, language) => {
        let document = require("lx-pdf")("./pdf/config/templates/quote.json");

        document.addContent("company_name", quote.user.activityEntitled);
        document.addContent("date_quote", "Date : " + quote.dateQuote);
        document.addContent("company_infos", this.formatTextBloc(["Siret : " + quote.user.siret, quote.user.firstname + " " + quote.user.lastname + " - " + quote.user.email, quote.user.address, quote.user.zipCode + " " + quote.user.town, quote.user.country]));
        document.addContent("customer_infos", this.formatTextBloc([quote.customer.civility + " " + quote.customer.name, quote.customer.address, quote.customer.zipCode + " " + quote.customer.town, quote.customer.country]));
        document.addContent("banner", "Devis - " + quote.code);
        if (quote.subject)
            document.addContent("object", "Objet : " + quote.subject);
        document.addContent("legal_notice_1", localization[language].pdf.legal_notice_1);

        document.addTable('content', this.getTableHead(), this.getTableBody(quote.content));
        //document.addTable('advancedPayment', [getCell('Acompte', 70, 'center')], [[" €"]]);
        document.addTable('discount', [getCell('Remise', 70, 'center')], [[quote.discount + " €"]]);
        document.addTable('total', [getCell('Net à payer', 70, 'center')], [[quote.totalPriceET + " €"]]);

        document.addContent("datePayment", this.formatTextBloc(["Date d'échéance de paiment : " + quote.datePayment, "Durée de validité : " + quote.validity + " jours"]));
        document.addContent("legal_notice_2", this.formatTextBloc([localization[language].pdf.legal_notice_2_1, localization[language].pdf.legal_notice_2_2]));
        if (quote.comment)
            document.addContent("comment", this.formatTextBloc(["Commentaire :", quote.comment]));
        document.addContent("signature", this.formatTextBloc(["\"Bon pour accord le :", "Signature"]));
        document.addContent("foot_text", localization[language].pdf.generated);
        document.addImage("foot_image", "./pdf/_config/images/logo.png", {width: 50});

        document.save("./pdf/" + quote.user._id + "_" + quote.code + ".pdf", function(result) {
            document.clear();
            if (result !== null)
                console.log("generateQuote KO " + quote.user._id + "/" + quote.code);
            else
                console.log("generateQuote OK " + quote.user._id + "/" + quote.code);
        });
    }
};