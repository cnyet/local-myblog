/******路由设置********/
var express = require("express"),
    router = express.Router();

router.use(require("./../controllers/home"));
router.use(require("./../controllers/list"));

module.exports = router;