var express = require('express');
var server = express()
var redis = require("redis")
var daoConfig = require("../game-server/config/daoConfig.json")
var RDS_PORT = daoConfig.redis.port
var RDS_HOST = daoConfig.redis.host
var RDS_PWD = daoConfig.redis.pwd
var RDS_OPTS = {auth_pass : RDS_PWD}
var db = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS)
var notify = ""
db.on("ready",function(res) {
	db.get("game:notify",function(err,data) {
		if(!err && data)
			notify = data
		console.log("web redis ready")
	})
})
server.all('*', function (req, res, next) {
	console.log("entry all")
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});
server.use(express.static(__dirname + '/public'));
console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");
server.use(express.json());
server.use(express.urlencoded({extended:true}));
server.get("/notify",function(req,res) {
	console.log("entry notify")
	res.send(notify)
})
server.get("/updateNotify",function(req,res) {
	console.log("entry updateNotify")
	db.get("game:notify",function(err,data) {
		if(!err && data)
			notify = data
	})
	res.send("ok")
})
server.listen(3001);
process.on('uncaughtException', function (err) {
  console.error(' !!! Caught exception: ' + err.stack);
});