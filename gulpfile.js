/*
* gulp开发版本配置
*/
var gulp = require("gulp"),                                 //gulp基础库
    os = require('os'),                                     //获取操作系统对象
    jshint = require("gulp-jshint"),                        //审查js代码
    uglify = require("gulp-uglify"),                        //压缩js代码
    stylelish = require("jshint-stylish"),                  //js错误信息高亮显示
    csslint = require("gulp-csslint"),                      //审查css代码
    less = require("gulp-less"),                            //将less编译成css
    minifycss = require("gulp-clean-css"),                  //压缩css文件
    htmlmin = require("gulp-htmlmin"),                      //压缩html文件
    imagemin = require("gulp-imagemin"),                    //压缩图片
    header = require("gulp-header"),                        //用来在压缩后的JS、CSS文件中添加头部注释
    spritesmith = require("gulp.spritesmith"),              //合并sprite小图片，生成单独的css和一张大图
    spriter = require("gulp-css-spriter"),                  //将sprite图合并生成样式文件
    base64 = require("gulp-css-base64"),                    //把小图片的URL替换为Base64编码图片
    concat = require("gulp-concat"),                        //文件合并
    rename = require("gulp-rename"),                        //文件重命名
    jeditor = require("gulp-json-editor"),                  //编辑json对象
    merge = require('merge-stream'),                        //将多个流合并成一个返回
    rev = require("gulp-rev"),                              //加MD5版本号生成无缓存文件
    md5 = require('gulp-md5-plus'),                         //给页面引用的js,css,图片引用路径加MD5
    revReplace = require("gulp-rev-replace"),               //重写加了MD5的文件名
    clean = require("gulp-clean"),                          //清除文件
    revCollector = require("gulp-rev-collector"),           //根据map文件替换页面引用文件
    gutil = require("gulp-util"),                           //提供很多常用函数
    usemin = require("gulp-usemin"),                        //文件合并到指定的目录，将样式和脚本直接嵌入到页面中，移除部分文件，为文件执行各种任务
    useref = require("gulp-useref"),                        //合并html中引入的静态文件
    fileinclude = require("gulp-file-include"),             //在html中引入模板文件
    runSequence = require("run-sequence"),                  //串行依次执行任务
    filter = require("gulp-filter"),                        //把stream里的文件根据一定的规则进行筛选过滤
    gulpOpen = require('gulp-open'),                        //自动在浏览器打开页面
    print = require("gulp-print"),                          //打印出stream里面的所有文件名
    plumber = require("gulp-plumber"),                      //一旦pipe中的某一steam报错了，保证下面的steam还继续执行
    inject = require("gulp-inject"),                        //指定需要插入html引用文件的列表
    gulpExpress = require("gulp-express"),                  //express服务器自动刷新
    connect = require("gulp-connect"),                      //web服务器
    bs = require('browser-sync').create('My server'),         //浏览器同步模块
    nodemon = require("gulp-nodemon"),                      //重启后台服务器
    webpack = require("webpack"),                           //webpack基础库
    webpackConfig = require('./webpack.config.js');         //引入webpack的配置文件

//将字体拷贝到目标文件夹
gulp.task("copy:fonts", function () {
    return gulp.src(["bower_components/font-awesome/fonts/**"])
        .pipe(gulp.dest("src/assets/fonts/"));
});

//压缩合并样式文件，包括先把less文件编译成css和引入的第三方css
gulp.task("build-css", ["copy:fonts"], function () {
    var cssFilter = filter("src/assets/style/default.css", {restore: true}),
        lessFilter = filter("src/assets/style/main.less", {restore: true}),
        cssOptions = {
            keepSpecialComments: 0                  //删除所有注释
        };
    return gulp.src("src/assets/style/*.{css,less}")
        .pipe(cssFilter)
        .pipe(concat("components.min.css"))
        .pipe(minifycss(cssOptions))
        .pipe(cssFilter.restore)
        .pipe(lessFilter)
        .pipe(less())
        .pipe(plumber())
        .pipe(concat("style.min.css"))
        .pipe(minifycss(cssOptions))
        .pipe(plumber.stop())
        .pipe(lessFilter.restore)
        .pipe(gulp.dest("src/assets/css/"))
        .pipe(bs.stream({match: "**/*.css"}))
        .pipe(bs.reload({stream: true}));
});

//引用webpack对js进行操作
var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);
gulp.task("build-js", function(callback) {
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-js", err);
        gutil.log("[webpack:build-js]", stats.toString({
            colors: true
        }));
        callback();
    });
});

//启动后台服务器express
gulp.task("nodemon", function() {
    nodemon({
        script: 'app.js',
        ignore: ['.idea', 'node_modules'],
        env: {
            'NODE_ENV': 'development'
        }
    })
});

//browserSync代理服务器自动刷新页面
gulp.task("browser-sync", ["nodemon"], function () {
    bs.init({
        files: "src/views/**",
        open: "local",
        notify: false,                  //不显示在浏览器中的任何通知。
        browser: "google chrome",       //默认在chrome中打开页面
        proxy: "localhost:3000",        //代理的主机地址
        port: 3100,                      //代理的端口
        ui: false
    });
    //监听文件变化
    gulp.watch('src/assets/style/**', ["build-css"]);
    gulp.watch('src/assets/script/**', ['build-js']).on("change", bs.reload);
});

//清除目标文件夹
gulp.task('clean', function () {
    return gulp.src(['src/assets/css/**', "src/assets/js/**"])
        .pipe(clean());
});

//执行默认任务
gulp.task('default', function(){
    runSequence("clean", "build-css", "build-js");
});

//开发
gulp.task('dev', function(){
    runSequence("build-css", "build-js", "browser-sync");
});

