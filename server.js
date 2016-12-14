//服务器
var http = require("http"),                             //内置的原生http模块
    express = require("express"),                       //引入express框架模块
    path = require("path"),                             //文件目录对象
    url = require("url");                               //处理请求的url

app = express();
app.use(express.static("/"));                           //静态资源服务器


function start(route) {
    function onRequest(request, response){
        var pathName = url.parse(request.url).pathname;
        console.log("request for:"+pathName+"received.");

        route(pathName);

        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("hello world.");
        response.end();
    }
    http.createServer(onRequest).listen(3000);
    console.log("server has started.");
}

exports.start = start;
