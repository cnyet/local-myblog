//服务器
var http = require("http"),                             //内置的原生http模块
    express = require("express"),                       //引入express框架模块
    path = require("path"),                             //文件目录对象
    fs = require("fs"),                                 //文件系统
    url = require("url"),                               //处理请求的url
    mime = require("./src/controllers/mime").types,     //MIME文件类型
    hbs = require("hbs"),                               //模板引擎
    favicon = require("serve-favicon"),                 //引入favicon
    logger = require("morgan"),                         //引入记录日志模块
    routers = require("./src/controllers/router"),       //引入路由
    bodyParser = require("body-parser"),                //解析客户端请求的body中的内容
    cookieParser = require("cookie-parser"),            //解析cookie
    session = require("express-session"),               //解析session
    errorhandler = require("errorhandler"),             //解析错误信息
    app = express();

var host = {
    path: "dist/assets/",
    port: 3000,
    html: "index.html"
};

app.set("port", process.env.PORT || host.port);                 //设置端口号（process.env.PORT是本机环境变量默认的端口号）
app.set("views", path.join(__dirname, "src/views"));                //设置页面文件所在的目录
app.engine(".html", hbs.__express);                             //设置模板文件的扩展名为.html
app.set("view engine", "html");                                 //设置渲染引擎渲染html页面
//app.use(favicon);                                               //调用express中间件，默认路径是"/",app.use()的顺序决定中间件优先级
app.use(logger("dev"));                                         //调用日志
app.use(bodyParser.json());                                     //调用express的json
app.use(bodyParser.urlencoded({extended: false}));              //调用解析url的中间件
app.use(cookieParser());                                        //调用cookie
app.use(express.static(path.join(__dirname, host.path)));       //调用静态资源服务器(path.join()是将多个参数组合成一个path)

app.use(routers);                                               //调用路由规则
app.use(function (req, res, next) {
    var err = new Error("404");
    err.status = 404;
    res.send("404");
});
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send("500");
});

//开发环境配置
if("development" == app.get("env")){
    app.use(errorhandler());
}

//启动一个服务器
http.createServer(app).listen(host.port, function () {
    console.log("server start.");
});
