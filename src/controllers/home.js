var express = require("express"),
    router = express.Router(),
    userModel = require("../models/home");

router.get("/", function (req, res) {
    res.render("index");
});

router.get("/index", function (req, res) {
    var msg;
    userModel.showUser(req, res, function (err, result) {
        msg = JSON.parse(result);
        console.log(msg[0]);
        res.render("test", msg[0]);
    });
});

module.exports = router;