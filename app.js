//服务器
var http = require("http"),                             //内置的原生http模块
    express = require("express"),                       //引入express框架模块
    path = require("path"),                             //文件目录对象
    fs = require("fs"),                                 //文件系统
    url = require("url"),                               //处理请求的url
    debug = require("debug")("local-node:server"),      //调试
    mime = require("./src/util/mime"),                  //MIME文件类型
    config = require("./src/config/config"),            //公共配置文件
    hbs = require("hbs"),                               //模板引擎
    favicon = require("serve-favicon"),                 //引入favicon
    logger = require("morgan"),                         //控制台打印日志
    routers = require("./src/util/router"),             //引入路由
    bodyParser = require("body-parser"),                //解析客户端请求的body中的内容
    cookieParser = require("cookie-parser"),            //解析cookie
    session = require("express-session"),               //解析session
    errorhandler = require("errorhandler"),             //解析错误信息
    reload = require('reload'),                         //后台服务器重启后浏览器自动刷新
    app = express();

var port = normalizePort(process.env.PORT || config.port);              //环境变量要是设置了PORT就用环境变量的PORT,否则用自定义的
hbs.registerPartials(config.baseDir + '/views/partials');            //设置局部模板文件位置
app.set("port", port);                                          //设置端口
app.set("views", path.join(config.baseDir, "views"));               //设置页面文件所在的目录
app.engine(".html", hbs.__express);                             //设置hbs来处理扩展名为.html文件
app.set("view engine", "html");                                 //设置渲染引擎渲染html页面
app.use(favicon(config.baseDir + "/assets/images/favicon.ico"));     //定义favicon图标,调用express中间件，默认路径是"/",app.use()的顺序决定中间件优先级
app.use(logger("dev"));                                         //定义日志和输出级别
app.use(bodyParser.json());                                     //定义解析<body>数据
app.use(bodyParser.urlencoded({extended: false}));              //定义解析url的中间件
app.use(cookieParser());                                        //定义cookie解析器
app.use(express.static(config.static));     //调用静态资源服务器(path.join()是将多个参数组合成一个path)

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
    if(err.status == 404){
        res.render('/others/404');
    }else{
        res.render('/others/error');
    }
    //res.sendStatus(err.status);
});

//创建http服务器
var server = http.createServer(app);

//刷新服务器
reload(server, app);

//服务器监听端口，注册事件
server.listen(port, function () {
    console.log(">> server start: http://localhost:"+port);
});

server.on("error", onError);
server.on("listening", onListening);

//格式化端口号
function normalizePort(val) {
    var port = parseInt(val, 10);
    if(isNaN(port)){
        return val;
    }
    if(port >= 0){
        return port;
    }
    return false;
}

//服务器错误事件的回调函数
function onError(error) {
    if(error.syscall !== "listen"){
        throw error;
    }
    var bind = typeof port === "string" ? "Pipe"+port : "Port"+port;

    switch(error.code){
        case "EACCES":
            console.error(bind + "requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + "is already in use.");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

//服务器监听事件回调函数
function onListening() {
    var addr = server.address(),
        bind = typeof addr === "string" ? "pipe" + addr : "port" + addr.port;
    debug("Listening on " + bind);
}
