var webpack = require("webpack"),                                               //webpack基础库
    CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin"),    //将公共文件合并成一个
    path = require("path"),                                                     //用于处理目录的对象
    fs = require("fs"),                                                         //文件系统
    UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;                           //压缩js文件
var srcDir = path.resolve(process.cwd(), "src", "assets");        //获取到js文件所在的根目录，process.cwd()：当前工作目录；path.resolve:相当于不断的调用系统的cd命令

//获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
    var jsPath = path.resolve(srcDir, "js"),            //返回js文件所在目录
        dirs = fs.readdirSync(jsPath);                  //返回一个包含“指定目录下所有文件名称”的数组对象
    var matchs =[], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);               //匹配所有的js文件
        if(matchs){
            files[matchs[1]] = path.resolve(srcDir, "js", item);
        }
    });
    return files;
}
module.exports = {
    cache: true,
    devtool: 'source-map',                          //配置生成Source Maps，选择合适的选项
    entry: getEntry(),                              //文件入口目录
    //entry: __dirname + "/src/js/main.js",
    output: {
        path: __dirname + "/dist/assets/js",               //文件输出目录
        publicPath: "dist/assets/js/",                     //用于配置文件发布路径，如CDN或本地服务器
        filename: "[name].js",                      //根据入口文件输出的对应多个文件名
        chunkFilename: "[chunkhash].js"
    },
    //配置别名，在项目中可缩减引用路径
    resolve: {
        alias: {
            jquery: __dirname + "/bower_components/jquery/dist/jquery.min.js",
            bootstrap: __dirname + "/bower_components/bootstrap/dist/js/bootstrap.min.js",
            zepto: __dirname + "/bower_components/zepto/zepto.min.js",
            underscore: __dirname + "/bower_components/underscore/underscore-min.js",
            handlebars: __dirname + "/bower_components/handlebars/handlebars.js",
            swiiper: __dirname + "/bower_components/swiper/dist/js/swiper.jquery.min.js",
            vue: __dirname + "/bower_components/vue/dist/vue.min.js"
        }
    },
    //提供全局的变量，在模块中使用无需用require引入
    plugins: [
        //将公共代码抽离出来合并为一个文件
        new CommonsChunkPlugin("common.js"),
        //js文件的压缩
        new UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: "jquery",
            _: "underscore"
        })
    ],
    devServer: {
        contentBase: "./dist/assets/",
        colors: true,
        historyApiFallback: true,
        inline: true
    }
};

