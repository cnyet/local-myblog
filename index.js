//服务器
var http = require("http"),                             //内置的原生http模块
    express = require("express"),                       //引入express框架模块
    path = require("path"),                             //文件目录对象
    fs = require("fs"),                                 //文件系统
    url = require("url"),                               //处理请求的url
    mime = require("./util/mime").types,                //MIME文件类型
    config = require("./config/config"),                //公共配置文件
    hbs = require("hbs"),                               //模板引擎
    favicon = require("serve-favicon"),                 //引入favicon
    logger = require("morgan"),                         //引入记录日志模块
    routers = require("./util/router"),                 //引入路由
    bodyParser = require("body-parser"),                //解析客户端请求的body中的内容
    cookieParser = require("cookie-parser"),            //解析cookie
    session = require("express-session"),               //解析session
    errorhandler = require("errorhandler"),             //解析错误信息
    app = express();

app.set("views", path.join(__dirname, "/views"));               //设置页面文件所在的目录
app.engine(".html", hbs.__express);                             //设置模板文件的扩展名为.html
app.set("view engine", "html");                                 //设置渲染引擎渲染html页面
app.use(favicon(__dirname + "/assets/images/favicon.ico"));     //定义favicon图标,调用express中间件，默认路径是"/",app.use()的顺序决定中间件优先级
app.use(logger("dev"));                                         //定义日志和输出级别
app.use(bodyParser.json());                                     //定义解析<body>数据
app.use(bodyParser.urlencoded({extended: false}));              //定义解析url的中间件
app.use(cookieParser());                                        //定义cookie解析器
app.use(express.static(path.join(__dirname, config.host)));     //调用静态资源服务器(path.join()是将多个参数组合成一个path)

app.use(routers);                                               //调用路由规则

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    //res.render('error');
    res.send(err.status);
});

modules.exports = app;
