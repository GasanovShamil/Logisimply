let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let userModel = require("../models/User");
let express = require("express");
let router = express.Router();

router.use(middleware.localize);

router.get("/:token", middleware.wrapper(async (req, res) => {
    let paramToken = req.params.token;
    let user = await userModel.findOne({status: "inactive", activationToken: paramToken});
    if (!user)
        res.render("error", {message: localization[req.language].users.token.failed})
    else {
        user.status = "active";
        user.activationToken = "";
        user.save();
        res.render("activate", {user: user});
    }
}));

module.exports = router;