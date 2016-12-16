/******路由设置********/
var express = require("express"),
    router = express.Router();

router.use("/",
    require("./home"),
    require("./list")
);

module.exports = router;