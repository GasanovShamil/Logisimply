let localization = require("../localization/localize");
let middleware = require("../helpers/middleware");
let quoteModel = require("../models/Quote");
let express = require("express");
let router = express.Router();

/**
 * @swagger
 * definition:
 *   Quote:
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