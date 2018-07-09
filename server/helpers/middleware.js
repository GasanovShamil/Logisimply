let config = require("../config.json");
let jwt = require("jsonwebtoken");

module.exports = {
    isLogged: function(req, res, next) {
        let bearerHeader = req.get("Authorization");
        if (typeof bearerHeader !== "undefined") {
            let bearer = bearerHeader.split(' ');
            let bearerToken = bearer[1];
            jwt.verify(bearerToken, config.jwt_key, (err, decoded) => {
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
    promises: function(req, res, next) {
        //TODO
        next();
    }
};