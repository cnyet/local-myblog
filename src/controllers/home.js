var express = require("express"),
    router = express.Router();

router.get("/", callBack);
router.get("/index", callBack);
router.get("index.html", callBack);

function callBack(req, res){
    //res.send("index");
    res.render("test", {title: "Express"});
}

module.exports = router;