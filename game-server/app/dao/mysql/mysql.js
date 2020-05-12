// mysql CRUD  
var sqlclient = module.exports;  
  
var _pool;  
  
var NND = {};  
  
/* 
 * Init sql connection pool 
 */  
NND.init = function () {  
    _pool = require('./dao-pool').createMysqlPool();  
};  
  
/** 
 * Excute sql statement 
 * @param {String} sql Statement The sql need to excute. 
 * @param {Object} args The args for the sql. 
 * @param {fuction} cb Callback function. 
 *  
 */  
NND.query = function (sql, args, cb) {  
    var promise = _pool.acquire();  
    promise.then(function (client) {  
        client.query(sql, args, function (error, results, fields) {  
            if (error) {  
                _pool.destroy(client);  
                cb(error, results);  
            }  
            else {  
                _pool.release(client);  
                cb(error, results);  
            }  
        });  
    }, function () {  
        console.log("reject");  
    }).catch(function (err) {  
        cb(err);  
        console.log(err);  
    });  
};  
  
/** 
 * Close connection pool. 
 */  
NND.shutdown = function () {  
    _pool.drain().then(function () {  
        _pool.clear();  
    });  
};  
  
/** 
 * init database 
 */  
sqlclient.init = function () {  
    if (!!_pool) {  
        return sqlclient;  
    } else {  
        NND.init();  
        sqlclient.insert = NND.query;  
        sqlclient.update = NND.query;  
        sqlclient.delete = NND.query;  
        sqlclient.query = NND.query;  
        return sqlclient;  
    }  
};  
  
/** 
 * shutdown database 
 */  
sqlclient.shutdown = function () {  
    NND.shutdown();  
};  