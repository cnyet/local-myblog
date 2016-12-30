/**
 * 日志配置
 */
var path = require("path"),
    log4js = require("log4js");

log4js.configure({
    appenders: [
        {
            type: 'console'             //用于跟express配合输出web请求url日志的
        },
        // 定义一个日志记录器
        {
            type: 'dateFile',                       // 日志文件类型，可以使用日期作为文件名的占位符
            filename: path.resolve(__dirname, '../logs/logInfo'),        // 日志文件名，可以设置相对路径或绝对路径
            pattern: "-yyyy-MM-dd.log",             // 占位符，紧跟在filename后面
            maxLogSize: 1024,
            alwaysIncludePattern: true,             // 文件名是否始终包含占位符
            backups: 4                              //日志备份数量，大于该数则自动删除
            //category: 'normal' //这个破玩儿，加上就写不到文件中去了
        }
    ],
    replaceConsole: true
});

log4js.setGlobalLogLevel(log4js.levels.INFO);

exports.setLogLevel = function(level){
    log4js.setGlobalLogLevel(level || log4js.levels.DEBUG);
};

exports.getLogger = function(file){
    return log4js.getLogger(file || "dateFileLog");
};