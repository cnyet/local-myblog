var gulp = require("gulp"),                                 //gulp基础库
    jshint = require("gulp-jshint"),                        //审查js代码
    uglify = require("gulp-uglify"),                        //压缩js代码
    stylelish = require("jshint-stylish"),                  //js错误信息高亮显示
    csslint = require("gulp-csslint"),                      //审查css代码
    less = require("gulp-less"),                            //将less编译成css
    minifycss = require("gulp-minify-css"),                 //压缩css文件
    minifyhtml = require("gulp-minify-html"),               //压缩html文件
    imagemin = require("gulp-imagemin"),                    //压缩图片
    header = require("gulp-header"),                        //用来在压缩后的JS、CSS文件中添加头部注释
    spritesmith = require("gulp.spritesmith"),              //合并sprite小图片，生成单独的css和一张大图
    spriter = require("gulp-css-spriter"),                  //将sprite图合并生成样式文件
    base64 = require("gulp-css-base64"),                    //把小图片的URL替换为Base64编码图片
    concat = require("gulp-concat"),                        //文件合并
    rename = require("gulp-rename"),                        //文件重命名
    rev = require("gulp-rev"),                              //加MD5版本号生成无缓存文件
    md5 = require('gulp-md5-plus'),                         //给页面引用的js,css,图片引用路径加MD5
    revReplace = require("gulp-rev-replace"),               //重写加了MD5的文件名
    clean = require("gulp-clean"),                          //清除文件
    revCollector = require("gulp-rev-collector"),           //根据map文件替换页面引用文件
    util = require("gulp-util"),                            //提供很多常用函数
    usemin = require("gulp-usemin"),                        //文件合并到指定的目录，将样式和脚本直接嵌入到页面中，移除部分文件，为文件执行各种任务
    useref = require("gulp-useref"),                        //合并html中引入的静态文件
    fileinclude = require("gulp-file-include"),             //在html中引入模板文件
    runSequence = require("run-sequence"),                  //串行依次执行任务
    filter = require("gulp-filter"),                        //把stream里的文件根据一定的规则进行筛选过滤
    gulpOpen = require('gulp-open'),                        //自动在浏览器打开页面
    print = require("gulp-print"),                          //打印出stream里面的所有文件名
    plumber = require("gulp-plumber"),                      //一旦pipe中的某一steam报错了，保证下面的steam还继续执行
    inject = require("gulp-inject"),                        //指定需要插入html引用文件的列表
    connect = require("gulp-connect"),                      //web服务器
    webpack = require("webpack"),                           //webpack基础库
    webpackConfig = require('./webpack.config.js');         //引入webpack的配置文件

var host = {
    path: "dist/",
    port: 3000,
    html: "index.html"
};
//配置打开的浏览器，mac chrome: "Google chrome"
var browser = os.platform() === "linux" ? "Google chrome" : (
    os.platform() === "darwin" ? "Google chrome" : (
        os.platform() === "win32" ? "chrome" : "firefox"
    )
);
var pkg = require("./package.json"),
    //添加注释信息到自己编辑的文件头部
    info = ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @author <%= pkg.author %>',
        ' * @version v<%= pkg.version %>',
        ' */',
        ''
    ].join('\n');
//将图片拷贝到目标目录
gulp.task("copy:images", function () {
    return gulp.src("src/images/**/*")
        .pipe(gulp.dest("dist/images"));
});
//在html文件中引入include文件
gulp.task("includefile", function () {
    var options = {
        removeComments: true,                   //清除html注释
        collapseBooleanAttributes: true,        //省略布尔属性值
        collapseWhitespace: false,              //压缩页面
        removeEmptyAttributes: true,            //删除所有空格作为属性值
        removeScriptTypeAttributes: true,       //删除script的type属性
        removeStyleTypeAttributes: true,        //删除link的type属性
        minifyJS: true,                         //压缩页面js
        minifyCSS: true                         //压缩页面css
    };
    return gulp.src("src/*.html")
        .pipe(fileinclude({
            prefix: "@@",
            basepath: "@file"
        }))
        .pipe(minifyhtml(options))
        .pipe(gulp.dest("dist/"))
});
//压缩合并样式文件，包括先把less文件编译成css和引入的第三方css
gulp.task("cssmin", function () {
    var cssFilter = filter("**/default.css", {restore: true}),
        lessFilter = filter("**/main.less", {restore: true});
    return gulp.src(["src/css/**"])
        .pipe(lessFilter)
        .pipe(less())
        .pipe(concat("style.css"))
        .pipe(minifycss())
        .pipe(lessFilter.restore)
        .pipe(cssFilter)
        .pipe(minifycss())
        .pipe(cssFilter.restore)
        .pipe(gulp.dest("dist/css"));
});
//雪碧图操作，先拷贝图片合并压缩css
gulp.task("sprite", ["copy:images", "cssmin"], function () {
    var timestamp = +new Date();
    return gulp.src("dist/css/default.css")
        .pipe(spriter({
            //生成sprite的位置
            spriteSheet: "dist/images/spritesheet" + timestamp + ".png",
            //修改样式文件引用图片地址路径
            pathToSpriteSheetFromCSS: "../images/spritesheet" +timestamp + ".png",
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(base64())
        .pipe(gulp.dest("dist/css"));
});
var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);
//引用webpack对js进行操作
gulp.task("build-js", ['fileinclude'], function(callback) {
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-js", err);
        gutil.log("[webpack:build-js]", stats.toString({
            colors: true
        }));
        callback();
    });
});
//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('md5:js', ['build-js'], function () {
    gulp.src('dist/js/*.js')
        .pipe(md5(10, 'dist/*.html'))
        .pipe(gulp.dest('dist/js'));
});
//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', ['sprite'], function () {
    return gulp.src('dist/css/*.css')
        .pipe(md5(10, 'dist/*.html'))
        .pipe(gulp.dest('dist/css'));
});
//清除文件
gulp.task('clean', function () {
    return gulp.src(['dist'])
        .pipe(clean())
});
//监听文件变化
gulp.task('watch', function () {
    return gulp.watch('src/**/*', ['cssmin', 'build-js', 'includefile']);
});
//定义web服务器
gulp.task('connect', function () {
    console.log('connect------------');
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true
    });
});
//自动在浏览器发开页面
gulp.task('open', function () {
    return gulp.src('')
        .pipe(gulpOpen({
            app: browser,
            uri: 'http://localhost:3000/'
        }));
});

//发布
gulp.task('default', ['connect', 'includefile', 'md5:css', 'md5:js', 'open']);

//开发
gulp.task('dev', ['connect', 'copy:images', 'includefile', 'cssmin', 'build-js', 'watch', 'open']);
