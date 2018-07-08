let jwt = require("jsonwebtoken");

module.exports = {
    isLogged: function(req, res, next) {
        let bearerHeader = req.get("Authorization");
        if (typeof bearerHeader !== "undefined") {
            let bearer = bearerHeader.split(' ');
            let bearerToken = bearer[1];
            jwt.verify(bearerToken, "zkfgjrezfj852", (err, decoded) => {
                if (err)
                    res.status(403).json({message: "Token d'authentification incorrect"});
                else if (decoded.status !== "actif")
                    res.status(403).json({message: "Veuillez activer votre compte"});
                else {
                    req.loggedUser = decoded;
                    next();
                }
            });
        } else
            res.status(403).json({message: "Token d'authentification inexistant"});
    },
    isEmailValid: function(email) {
        let regex = /^(([^<>()\[\]\\.,8;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    },
    isRequired: function(val) {
        return val && val.length;
    }
};