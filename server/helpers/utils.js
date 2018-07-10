module.exports = {
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
        return provider.companyName && provider.legalForm && provider.siret && provider.email && provider.website && provider.address && provider.zipCode && provider.town;
    },
    isItemComplete: function(item) {
        return item.type && item.reference && item.label && item.priceET && item.description;
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
        return invoice.customer && invoice.dateInvoice && this.isContentComplete(invoice.content) && invoice.datePayment && invoice.dateExecution && invoice.collectionCost;
    },
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
    generateInvoice: function(quote) {
        return {
            customer: quote.customer,
            dateInvoice: quote.dateQuote,
            subject: quote.subject,
            content: quote.content,
            datePayment: quote.datePayment,
            dateExecution: quote.dateQuote,
            collectionCost: quote.collectionCost,
            comment: quote.comment
        };
    }
};