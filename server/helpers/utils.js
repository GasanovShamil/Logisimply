let jwt = require("jsonwebtoken");

module.exports = {
    isLogged: function(req, res, next) {
        const bearerHeader = req.get("Authorization");
        if (typeof bearerHeader !== "undefined") {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            jwt.verify(bearerToken, "zkfgjrezfj852", (err, decoded) => {
                if (err)
                    res.status(403).json({message: "Token d'authentification incorrect"});
                else {
                    req.loggedUser = decoded;
                    next();
                }
            });
        } else
            res.status(403).json({message: "Token d'authentification inexistant"});
    },
    isEmailValid: function(email) {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    },
    isRequired: function(val) {
        return val && val.length;
    }
};