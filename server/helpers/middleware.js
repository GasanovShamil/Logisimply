let config = require("../config");
let localization = require("../localization/localize");
let constants = require("../helpers/constants");
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
                else if (decoded.status !== constants.UserStatus.active)
                    res.status(403).json({message: localization[req.language].users.inactive});
                else {
                    req.loggedUser = decoded;
                    next();
                }
            });
        } else
            res.status(403).json({message: localization[req.language].middleware.missing});
    },
    localize: function(req, res, next) {
        let languageHeader = req.get("Localize");
        if (typeof languageHeader !== "undefined")
            req.language = languageHeader;
        else
            req.language = config.default_localize;
        next();
    },
    wrapper: function(callback) {
        return function(req, res) {
            //callback(req, res).catch(() => res.status(500).json({message: localization[req.language].middleware.error}));
            //callback(req, res).catch((err) => res.status(500).json({message: err}));
            callback(req, res);
        };
    }
};