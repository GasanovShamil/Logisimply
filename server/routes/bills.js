let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let utils = require("../helpers/utils");
let billModel = require("../models/Bill");
let express = require("express");
let router = express.Router();

/**
 * @swagger
 * definition:
 *   Bill:
 *     type: object
 *     properties:
 *       idUser:
 *         type: string
 *       createdAt:
 *         type: string
 *         format: date
 *       updatedAt:
 *         type: string
 *         format: date
 *     required:
 */

router.use(middleware.promises);
router.use(middleware.isLogged);

router.post("/", async (req, res) => {
    res.sendStatus(200);
});


module.exports = router;