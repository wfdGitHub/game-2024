var express = require('express');
var server = express()
var redis = require("redis")
var daoConfig = require("../game-server/config/daoConfig.json")
var mysql = require("./mysql/mysql.js")
var mysqlDao = function() {}
mysqlDao.db = mysql.init()
var RDS_PORT = daoConfig.redis.port
var RDS_HOST = daoConfig.redis.host
var RDS_PWD = daoConfig.redis.pwd
var RDS_OPTS = {auth_pass : RDS_PWD}
var redisDao = function() {}
redisDao.multi = function(list,cb) {
 	multi = this.db.multi(list).exec(function (err, replies) {
 		cb(err,replies)
 	})
}
redisDao.db = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS)
var notify = ""
var serverDB = require("./serverDB.js")
redisDao.db.on("ready",function(res) {
	redisDao.db.get("game:notify",function(err,data) {
		if(!err && data)
			notify = data
		console.log("web redis ready")
	})
})
server.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method' )
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
	res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
  	next();
});
server.use(express.static(__dirname + '/public'));
// console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");
server.use(express.json());
server.use(express.urlencoded({extended:true}));
server.get("/notify",function(req,res) {
	res.send(notify)
})
server.changeNotify = function(data) {
	notify = data
}
server.get("/updateNotify",function(req,res) {
	redisDao.db.get("game:notify",function(err,data) {
		if(!err && data)
			notify = data
	})
	res.send("ok")
})
server.listen(3001);
serverDB.init(server,mysqlDao,redisDao)

process.on('uncaughtException', function (err) {
  console.error(' !!! Caught exception: ' + err.stack);
});