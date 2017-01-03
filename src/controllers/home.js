var express = require("express"),
    router = express.Router(),
    userModel = require("../models/home"),
    logger = require("../util/logger").getLogger();

router.get("/", function (req, res) {
    res.render("index");
});

router.get("/index", function (req, res) {
    var msg;
    userModel.showUser(req, res, function (err, result) {
        msg = JSON.parse(result);
        res.render("index");
    });
});

logger.info("请求index接口");

module.exports = router;