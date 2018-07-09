let config = require("../config");
let localization = require("../localization/localize");
let jwt = require("jsonwebtoken");

module.exports = {
    isLogged: function(req, res, next) {
        let bearerHeader = req.get("Authorization");
        if (typeof bearerHeader !== "undefined") {
            let bearer = bearerHeader.split(' ');
            let bearerToken = bearer[1];
            jwt.verify(bearerToken, config.jwt_key, (err, decoded) => {
                if (err)
                    res.status(403).json({message: localization[req.language].middleware.failed});
                else if (decoded.status !== "actif")
                    res.status(403).json({message: localization[req.language].middleware.activate});
                else {
                    req.loggedUser = decoded;
                    next();
                }
            });
        } else
            res.status(403).json({message: localization[req.language].middleware.missing});
    },
    promises: function(req, res, next) {
        let languageHeader = req.get("Accept-Language");
        if (typeof languageHeader !== "undefined")
            req.language = languageHeader;
        else
            req.language = config.localize;

        next();
    }
};