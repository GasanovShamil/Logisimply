let localization = require("../localization/localize");
let fs = require("fs");

module.exports = {
    fields: {
        isEmailValid: function(email) {
            let regex = /^(([^<>()\[\]\\.,8;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(String(email).toLowerCase());
        },
        isUserComplete: function(user) {
            return user.email && user.password && user.firstname && user.lastname && user.activityEntitled && user.activityStarted && user.siret && user.address && user.zipCode && user.town;
        },
        isCustomerComplete: function(customer) {
            return customer.email && customer.type && customer.name && customer.address && customer.zipCode && customer.town && customer.country;
        },
        isProviderComplete: function(provider) {
            return provider.companyName && provider.legalForm && provider.siret && provider.email && provider.website && provider.address && provider.zipCode && provider.town && provider.country;
        },
        isItemComplete: function(item) {
            return item.type && item.label && item.priceET && item.description;
        },
        isContentComplete: function(content) {
            return content && content.length > 0 && content.every(function(line) {
                return line.reference && line.label && line.type && line.unitPriceET && line.quantity;
            });
        },
        isQuoteComplete: function(quote) {
            return quote.customer && quote.dateQuote && this.isContentComplete(quote.content) && quote.datePayment && quote.validity && quote.collectionCost;
        },
        isInvoiceComplete: function(invoice) {
            return invoice.customer && invoice.dateInvoice && this.isContentComplete(invoice.content) && invoice.datePayment && invoice.dateExecution && (typeof(invoice.collectionCost) === "boolean");
        },
        isIncomeComplete: function(income) {
            return income.method && income.amount && income.invoice && income.user && income.customer && income.dateIncome;
        },
        isCustomerTypeValid: function (type) {
            return ["private", "professional"].includes(type);
        },
        isQuoteStatusValid: function (status) {
            return ["draft", "sent"].includes(status);
        },
        isInvoiceStatusValid: function (status) {
            return ["draft", "lock"].includes(status);
        },
        isIncomeMethodValid: function (method) {
            return ["paypal", "asset", "cash", "check"].includes(method);
        }
    },
    format: {
        getCode: function(number) {
            let nextCode = "00000" + number;
            return nextCode.substring(nextCode.length - 5, nextCode.length);
        },
        getDateCode: function() {
            let now = new Date();
            let month = now.getMonth() + 1;
            if (month < 10)
                month = "0" + month;
            return "" + now.getFullYear() + month;
        },
        formatDate: function(date) {
            let day = date.getDate();
            let month = date.getMonth() + 1;
            if (month < 10)
                month = "0" + month;
            let year = date.getFullYear();
            return day + "/" + month + "/" + year;
        }
    },
    pdf: {
        getPath: function(user, code) {
            return "./pdf/" + user + "_" + code + ".pdf";
        },
        remove: function(path) {
            fs.unlink(path, function(err) {
                if (err)
                    console.log("PDF delete failed - path : " + path);
                else
                    console.log("PDF delete succeeded - path : " + path);
            });
        },
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
        getTableHead: function(language) {
            return [
                this.getCell(localization[language].pdf.content.reference, 35),
                this.getCell(localization[language].pdf.content.label, 85),
                this.getCell(localization[language].pdf.content.description, 245),
                this.getCell(localization[language].pdf.content.unit_price_ET, 40),
                this.getCell(localization[language].pdf.content.quantity, 40, "center"),
                this.getCell(localization[language].pdf.content.discount, 40, "center"),
                this.getCell(localization[language].pdf.content.total_price_ET, 76, "center")
            ];
        },
        getTableBody: function(content) {
            let result = [];
            for (let i = 0; i < content.length; i++)
                result.push([content[i].reference, content[i].label, content[i].description, content[i].unitPriceET, content[i].quantity, content[i].discount, content[i].totalPriceET])
            result.push(['']);
            return result;
        },
    }
};