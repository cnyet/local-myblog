var express = require("express"),
    router = express.Router(),
    userModel = require("../controllers/home");

router.get("/index", function (req, res) {
    var msg;
    userModel.showUser(req, res, function (err, result) {
        msg = JSON.parse(result);
        console.log("index");
        res.render("test", msg[0]);
    });
});

module.exports = router;