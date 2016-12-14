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
    rev = require("gulp-rev"),                              //加MD5版本号生成无缓存文件
    md5 = require('gulp-md5-plus'),                         //给页面引用的js,css,图片引用路径加MD5
    revReplace = require("gulp-rev-replace"),               //重写加了MD5的文件名
    clean = require("gulp-clean"),                          //清除文件
    revCollector = require("gulp-rev-collector"),           //根据map文件替换页面引用文件
    gutil = require("gulp-util"),                            //提供很多常用函数
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

var path = require("path"),
    server = require("./server"),
    route = require(__dirname);
var host = {
    path: "dist/assets/",
    port: 3000,
    html: "index.html"
};
//配置打开的浏览器，mac chrome: "Google chrome"
var browser = os.platform() === "linux" ? "Google chrome" : (
    os.platform() === "darwin" ? "Google chrome" : (
        os.platform() === "win32" ? "chrome" : "firefox"
    )
);
var options = {
    removeComments: true,                   //清除html注释
    collapseBooleanAttributes: true,        //省略布尔属性值
    collapseWhitespace: true,               //压缩HTML
    preserveLineBreaks: true,               //每行保持一个换行符
    removeEmptyAttributes: true,            //删除所有空格作为属性值
    removeScriptTypeAttributes: true,       //删除script的type属性
    removeStyleTypeAttributes: true,        //删除link的type属性
    minifyJS: true,                         //压缩页面js
    minifyCSS: true                         //压缩页面css
};
//将图片拷贝到目标目录
gulp.task("copy:images", function () {
    return gulp.src("src/assets/images/**/*", {base: "src"})
        .pipe(gulp.dest("dist/"));
});
//拷贝其他文件到目标文件夹
gulp.task("copy:file", function () {
    return gulp.src(["src/controllers/**/*", "src/modules/**/*"], {base: "src"})
        .pipe(gulp.dest("dist/"));
});
//将字体拷贝到目标文件夹
gulp.task("copy:fonts", function () {
    return gulp.src(["bower_components/font-awesome/fonts/**"])
        .pipe(gulp.dest("dist/assets/fonts/"));
});
//编译首页css
gulp.task("useref", function () {
    var cssFilter = filter("**/components.min.css", {restore: true}),
        lessFilter = filter("**/style.min.css", {restore: true}),
        cssOptions = {
            keepSpecialComments: 0              //删除所有注释
        };
    return gulp.src("src/assets/index.html")
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(useref())
        .pipe(cssFilter)
        .pipe(minifycss(cssOptions))
        .pipe(cssFilter.restore)
        .pipe(lessFilter)
        .pipe(less())
        .pipe(minifycss(cssOptions))
        .pipe(lessFilter.restore)
        .pipe(htmlmin(options))
        .pipe(gulp.dest("dist/assets/"));
});
//在html文件中引入include文件
gulp.task("includefile", ["useref"], function () {
    var source = gulp.src(["dist/assets/css/*.css"], {read: false}),
        injectOp = {
            ignorePath: "/dist/assets/",
            removeTags: true,
            addRootSlash: false
        };
    return gulp.src(["src/assets/*.html", "!src/assets/index.html"], {base: "src"})
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(inject(source, injectOp))
        .pipe(usemin())
        .pipe(htmlmin(options))
        .pipe(gulp.dest("dist/"))
        .pipe(connect.reload());
});
//雪碧图操作，先拷贝图片合并压缩css
gulp.task("sprite", ["copy:images", "useref"], function () {
    var timestamp = +new Date();
    return gulp.src("dist/assets/css/style.min.css")
        .pipe(spriter({
            //生成sprite的位置
            spriteSheet: "dist/assets/images/spritesheet" + timestamp + ".png",
            //修改样式文件引用图片地址路径
            pathToSpriteSheetFromCSS: "../images/spritesheet" +timestamp + ".png",
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(base64())
        .pipe(gulp.dest("dist/assets/css"));
});
var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);
//引用webpack对js进行操作
gulp.task("build-js", ['includefile'], function(callback) {
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
    gulp.src('dist/assets/js/*.js')
        .pipe(md5(10, 'dist/assets/*.html'))
        .pipe(gulp.dest('dist/assets/js'));
});
//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', ['sprite'], function () {
    return gulp.src('dist/assets/css/*.css')
        .pipe(md5(10, 'dist/assets/*.html'))
        .pipe(gulp.dest('dist/assets/css'));
});
//清除文件
gulp.task('clean', function () {
    return gulp.src(['dist'])
        .pipe(clean())
});
//压缩合并样式文件，包括先把less文件编译成css和引入的第三方css
gulp.task("cssmin", function () {
    var options = {
        keepSpecialComments: 0              //删除所有注释
    };
    gulp.src(["src/assets/css/dedault.css"])
        .pipe(minifycss(options))
        .pipe(rename("components.min.css"))
        .pipe(gulp.dest("dist/assets/css"))
        .pipe(connect.reload());
    gulp.src(["src/assets/css/main.less"])
        .pipe(less())
        .pipe(plumber())
        .pipe(csslint())
        .pipe(minifycss(options))
        .pipe(rename("style.min.css"))
        .pipe(plumber.stop())
        .pipe(gulp.dest("dist/assets/css"))
        .pipe(connect.reload());
});
//监听文件变化
gulp.task('watch', function () {
    gulp.watch('src/assets/css/**', ["cssmin"]);
    gulp.watch('src/assets/js/**', ['build-js']);
    gulp.watch('src/assets/*.html', ['includefile']);
    gulp.watch('src/assets/include/**', ['includefile']);
});
//定义web服务器
gulp.task('connect', function () {
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true
    });

    console.log('========服务器已启动=======');
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
gulp.task('default', function () {
    runSequence("clean", 'connect', 'copy:images', "useref", ['includefile', 'sprite', 'md5:css', 'build-js', 'md5:js'], "copy:fonts", "copy:file", "open");
});

//开发
gulp.task('dev', function(){
    runSequence("clean", "connect", 'copy:images', "useref", ['includefile', 'build-js'], "copy:fonts", "copy:file", 'watch', 'open');
});

//启动服务
gulp.task("start", function(){
    runSequence("connect", "watch", "open");
});
