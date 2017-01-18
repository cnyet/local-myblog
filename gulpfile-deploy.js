/*
* gulp发布版本配置
* gulp --gulpfile ./gulpfile-deploy.js [default|deploy]
*/
var gulp = require("gulp"),                                 //gulp基础库
    plugins = require('gulp-load-plugins')(),               //自动require你在package.json中声明的依赖
    os = require('os'),                                     //获取操作系统对象
    runSequence = require("run-sequence"),                  //串行依次执行任务
    merge = require('merge-stream'),                        //将多个流合并成一个返回
    webpack = require("webpack"),                           //webpack基础库
    webpackConfig = require('./webpack.config');            //引入webpack的配置文件

var host = {
    path: "dist/",
    port: 3100,
    html: "index.html"
};

//设置默认打开的浏览器（mac chrome: "Google chrome"）
var browser = os.platform() === "linux" ? "Google chrome" : (
    os.platform() === "darwin" ? "Google chrome" : (
        os.platform() === "win32" ? "chrome" : "firefox"
    )
);

//拷贝控制文件到目标文件夹
gulp.task("copy:files", function () {
    return gulp.src(["src/controllers/**/*", "src/models/**/*", "src/config/**", "src/util/**", "src/logs/"], {base: "src"})
        .pipe(gulp.dest("dist/"));
});

//拷贝其他文件到目标文件夹
gulp.task("copy:config", function () {
    var packageFilter = plugins.filter("package.json", {restore: true});
    return gulp.src(["./src/index.js", "./package.json", "./README.md"], {base: "./"})
        .pipe(packageFilter)
        .pipe(plugins.jsonEditor(function (json) {
            if (json.devDependencies) {
                //删除开发环境的依赖列表
                delete json.devDependencies;
            }
            return json;
        }))
        .pipe(packageFilter.restore)
        .pipe(gulp.dest("dist/"));
});

//将字体拷贝到目标文件夹
gulp.task("copy:fonts", function () {
    return gulp.src(["bower_components/font-awesome/fonts/**"])
        .pipe(gulp.dest("dist/assets/fonts/"));
});

//将图片拷贝到目标目录
gulp.task("copy:images", function () {
    return gulp.src("src/assets/images/**/*", {base: "src"})
        .pipe(plugins.imagemin())
        .pipe(gulp.dest("dist/"));
});

//压缩合并样式文件，包括先把less文件编译成css和引入的第三方css
gulp.task("build-css", function () {
    var cssFilter = plugins.filter("src/**/default.css", {restore: true}),
        lessFilter = plugins.filter("src/**/main.less", {restore: true}),
        cssOptions = {
            keepSpecialComments: 0              //删除所有注释
        };
    return gulp.src("src/assets/css/*.{css,less}")
        .pipe(cssFilter)
        .pipe(plugins.concat("components.min.css"))
        .pipe(plugins.cleanCss(cssOptions))
        .pipe(cssFilter.restore)
        .pipe(lessFilter)
        .pipe(plugins.less())
        .pipe(plugins.plumber())
        .pipe(plugins.concat("style.min.css"))
        .pipe(plugins.cleanCss(cssOptions))
        .pipe(plugins.plumber.stop())
        .pipe(lessFilter.restore)
        .pipe(gulp.dest("dist/assets/css/"))
        .pipe(plugins.connect.reload());
});

//在html文件中引入include文件
gulp.task("build-html", ["build-css"], function () {
    var source = gulp.src(["dist/assets/css/*.css"], {read: false}),
        injectOp = {
            ignorePath: "/dist/",
            removeTags: true,
            addRootSlash: true
        },
        options = {
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
    return gulp.src(["src/views/**/*.html"], {base: "src"})
        .pipe(plugins.htmlmin(options))
        .pipe(gulp.dest("dist/"))
        .pipe(plugins.connect.reload());
});

//引用webpack对js进行压缩合并
var myDevConfig = Object.create(webpackConfig);
var devCompiler = webpack(myDevConfig);
gulp.task("build-js", ['build-html'], function(callback) {
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-js", err);
        plugins.util.log("[webpack:build-js]", stats.toString({
            colors: true
        }));
        callback();
    });
});

//雪碧图合并，先拷贝图片合并压缩css
gulp.task("sprite", ["copy:images", "build-css"], function () {
    var timestamp = +new Date();
    return gulp.src("dist/assets/css/style.min.css", {base: "src"})
        .pipe(plugins.cssSpriter({
            //生成sprite的位置
            spriteSheet: "dist/assets/images/spritesheet" + timestamp + ".png",
            //修改样式文件引用图片地址路径
            pathToSpriteSheetFromCSS: "../images/spritesheet" +timestamp + ".png",
            spritesmithOptions: {
                padding: 10
            }
        }))
        .pipe(plugins.cssBase64())
        .pipe(gulp.dest("dist"));
});

//css,js文件加MD5，并修改html中的引用路径
gulp.task("md5:files", ["sprite", "build-js"], function () {
    var stream1 = function () {
            return gulp.src('dist/assets/css/*.css')
                .pipe(plugins.md5Plus(10, 'dist/views/*.html'))
                .pipe(gulp.dest('dist/assets/css'));
        },
        stream2 = function () {
            return gulp.src('dist/assets/js/*.js')
                .pipe(plugins.md5Plus(10, 'dist/views/*.html'))
                .pipe(gulp.dest('dist/assets/js'));
        };
     return merge(stream1(), stream2());
});

//清除文件
gulp.task('clean', function () {
    return gulp.src(['dist'])
        .pipe(plugins.clean());
});

//监听文件变化
gulp.task('watch', function () {
    gulp.watch('src/assets/css/**', ["build-css"]);
    gulp.watch('src/assets/js/**', ['build-js']);
    gulp.watch('src/views/*.html', ['build-html']);
    gulp.watch('src/assets/include/**', ['build-html']);
});

//定义web服务器
gulp.task('connect', function () {
    plugins.connect.server({
        root: host.path,
        port: host.port,
        livereload: true
    });
    console.log('========server start=======');
});

//自动在浏览器发开页面
gulp.task('open', function () {
    return gulp.src('')
        .pipe(plugins.open({
            app: browser,
            uri: 'http://localhost:3100/views/'
        }));
});

//执行默认任务
gulp.task("default", function(){
    runSequence("clean", "build-css", 'build-html', 'build-js', 'copy:images', 'sprite', ['copy:fonts', 'copy:config', 'copy:files']);
});

//添加MD5，发布
gulp.task("deploy", function () {
    runSequence("clean", "build-css", 'build-html', 'build-js', 'copy:images', 'sprite', ['copy:fonts', 'copy:config', 'copy:files'], 'md5:files');
});
