var express = require('express');
var bodyParser = require('body-parser');
var xml2json=require('xml2json');
app.listen(3000);
var serverManager = function(app) {
	this.app = app
	this.areaDeploy = this.app.get("areaDeploy")
	this.openPlans = {}
	this.mergePlans = {}
	this.areaLock = {}
}
//
serverManager.prototype.init = function() {
	var self = this
	self.redisDao.db.hgetall("serverManager:openPlans",function(err,data) {
		for(var i in data){
			self.openPlans[i] = Number(data[i])
		}
	})
	self.redisDao.db.hgetall("serverManager:mergePlans",function(err,data) {
		for(var i in data){
			self.mergePlans[i] = JSON.parse(data[i])
		}
	})
	setInterval(self.update.bind(self),1000)
	var server = express()
	// server.all('*', function (req, res, next) {
	//   res.header('Access-Control-Allow-Origin', '*');
	//   res.header('Access-Control-Allow-Methods', '*');
	//   next();
	// });
	server.use(bodyParser.urlencoded({
	  extended: true
	}));
	server.post("/pay_order",function(req,res) {
	  req.rawBody = '';//添加接收变量
	  var json={};
	  req.setEncoding('utf8');
	  req.on('data', function(chunk) { 
	    req.rawBody += chunk;
	  });
	  req.on('end', function() {
		json=xml2json.toJson(req.rawBody);
		console.log(json)
		res.send("SUCCESS");
	  }); 
	})
	server.listen(80);
}
//update
serverManager.prototype.update = function() {
	let curTime = Date.now()
	for(var time in this.openPlans){
		if(curTime > Number(time)){
			delete this.openPlans[time]
			this.redisDao.db.hdel("serverManager:openPlans",time)
			this.areaDeploy.openArea()
			return
		}
	}
	for(var time in this.mergePlans){
		if(curTime > Number(time)){
			var areaList = this.mergePlans[time]
			for(var i = 0;i < areaList.length;i++){
				delete this.areaLock[areaList[i]]
			}
			delete this.mergePlans[time]
			this.redisDao.db.hdel("serverManager:mergePlans",time)
			this.areaDeploy.mergeArea(areaList)
			return
		}
	}
}
//添加合服计划
serverManager.prototype.setMergePlan = function(areaList,time,cb) {
	if(!Number.isInteger(time) || time < Date.now() || !Array.isArray(areaList)){
		cb(false,"参数错误")
		return
	}
	for(var i = 0;i < areaList.length;i++){
		if(!this.areaDeploy.serverMap[areaList[i]] || this.areaLock[areaList[i]]){
			cb(false,areaList[i]+"不存在或已在合服计划")
			return
		}
	}
	for(var i = 0;i < areaList.length;i++){
		this.areaLock[areaList[i]] = true
	}
	this.mergePlans[time] = areaList
	this.redisDao.db.hset("serverManager:mergePlans",time,JSON.stringify(areaList))
	cb(true)
}
//删除合服计划
serverManager.prototype.delMergePlan = function(time,cb) {
	if(!this.mergePlans[time]){
		cb(false,"不存在该合服计划")
		return
	}
	var areaList = this.mergePlans[time]
	for(var i = 0;i < areaList.length;i++){
		delete this.areaLock[areaList[i]]
	}
	delete this.mergePlans[time]
	this.redisDao.db.hdel("serverManager:mergePlans",time)
	cb(true)
}
//获取合服计划表
serverManager.prototype.getMergePlan = function(cb) {
	cb(true,this.mergePlans)
}
//添加开服计划
serverManager.prototype.setOpenPlan = function(time,cb) {
	if(!Number.isInteger(time) || time < Date.now()){
		cb(false,"参数错误")
		return
	}
	this.openPlans[time] = 1
	this.redisDao.db.hset("serverManager:openPlans",time,1)
	cb(true)
}
//删除开服计划
serverManager.prototype.delOpenPlan = function(time,cb) {
	if(!this.openPlans[time]){
		cb(false,"不存在该服务器开服计划")
		return
	}
	delete this.openPlans[time]
	this.redisDao.db.hdel("serverManager:openPlans",time)
	cb(true)
}
//获取开服计划表
serverManager.prototype.getOpenPlan = function(cb) {
	cb(true,{openPlans : this.openPlans,areaLock : this.areaLock})
}
module.exports = {
	id : "serverManager",
	func : serverManager,
	scope : "prototype",
	init : "init",
	args : [{
		name : "app",
		type : "Object"
	}],
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}