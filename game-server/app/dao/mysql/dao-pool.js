var _poolModule = require('generic-pool');  
var mysql = require('mysql');  
/* 
 * Create mysql connection pool. 
 */  
var createMysqlPool = function () {  
    const factory = {  
        create: function () {
            return new Promise(function (resolve, reject) {  
  
                var client = mysql.createConnection({  
					host: "127.0.0.1",
					user: "zhulu",
					password: "ERt6Mcsmbpx24S2j",
					database: "zhulu" ,
                    port: "3306",
                    useConnectionPooling: true
                });  
                client.on('error', function () {  
                    client.connect();  
                });  
                client.connect(function (error) {  
                    if (error) {  
                        console.log('sql connect error');  
                    }  
                    resolve(client)  
                });  
  
            })  
        },  
        destroy: function (client) {  
            return new Promise(function (resolve) {  
                client.on('end', function () {  
                    resolve()  
                })  
                client.end()  
            })  
        }  
    }
    var opts = {
        max: 100, // maximum size of the pool  
        min: 10, // minimum size of the pool  
        idleTimeoutMillis: 600000,
        evictionRunIntervalMillis : 60000,
        // 如果 设置为 true 的话，就是使用 console.log 打印日志，当然你可以传递一个 function 最为作为日志记录handler  
        log: true
    }
    return _poolModule.createPool(factory, opts);  
};  
exports.createMysqlPool = createMysqlPool;  