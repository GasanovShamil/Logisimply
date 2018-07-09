let express = require("express");
let router = express.Router();
let localization = require("../localization/fr_FR");
let billModel = require("../models/Bill");

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
 *       - idUser
 */

router.post("/", async (req, res) => {
    res.sendStatus(200);
});


module.exports = router;