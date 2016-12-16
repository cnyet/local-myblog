var express = require("express"),
    router = express.Router();

router.get("/list", function (req, res) {
    res.send("列表");
});

module.exports = router;
