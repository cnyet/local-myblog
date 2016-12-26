/*
* 首页数据模型
*/
var mysql = require("mysql"),
    dbConfig = require("../config/database"),
    pool = mysql.createPool(dbConfig);              //创建数据库连接池

module.exports = {
    showUser: function (req, res, callBack) {
        pool.getConnection(function (err, connection) {
            //定义查询
            var sql = "select name from t_user where id = 1";
            connection.query(sql, function (err, result) {
                result = JSON.stringify(result);
                callBack(err, result);
                //释放链接
                connection.release();
            })
        })
    }
};

