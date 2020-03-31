var bearcat = require("bearcat")
var areaRemote = function(app) {
	this.app = app
	this.areaManager = this.app.get("areaManager")
}
//创建新服务器
areaRemote.prototype.loadArea = function(areaId,cb) {
	this.areaManager.loadArea(areaId)
	cb()
}
//关闭服务器
areaRemote.prototype.removeArea = function(areaId,cb) {
	this.areaManager.removeArea(areaId)
	cb()
}
//注册账号
areaRemote.prototype.register = function(otps,cb) {
	this.areaManager.areaMap[otps.areaId].register(otps,cb)
}
//玩家加入
areaRemote.prototype.userLogin = function(uid,areaId,cid,cb) {
	this.areaManager.userLogin(uid,areaId,cid,cb)
}

//玩家离开
areaRemote.prototype.userLeave = function(uid,cid,cb) {
	this.areaManager.userLeave(uid,cid)
	cb()
}
//获取服务器信息
areaRemote.prototype.getAreaServerInfos = function(cb) {
	var list = this.areaManager.getAreaServerInfos()
	cb(list)
}
//获取服务器内玩家信息
areaRemote.prototype.getAreaPlayers = function(areaId,cb) {
	if(this.areaManager.areaMap[areaId]){
		var list = this.areaManager.areaMap[areaId].getAreaPlayers()
		cb(true,list)
	}else{
		cb(false)
	}
}
//消耗道具
areaRemote.prototype.consumeItems = function(uid,areaId,str,rate,cb) {
	console.log("consumeItems",uid,areaId,str,rate)
	if(this.areaManager.areaMap[areaId]){
		this.areaManager.areaMap[areaId].consumeItems(uid,str,rate,cb)
	}else{
		cb(false)
	}
}
//物品奖励
areaRemote.prototype.addItemStr = function(uid,areaId,str,rate,cb) {
	if(this.areaManager.areaMap[areaId]){
		var awardList = this.areaManager.areaMap[areaId].addItemStr(uid,str,rate)
		cb(true,awardList)
	}else{
		cb(false)
	}
}
//宝箱奖励
areaRemote.prototype.openChestAward = function(uid,areaId,chestId,rate,cb) {
	console.log("openChestAward",uid,areaId,chestId,rate)
	if(this.areaManager.areaMap[areaId]){
		var awardList = this.areaManager.areaMap[areaId].openChestAward(uid,chestId,rate)
		cb(true,awardList)
	}else{
		cb(false)
	}
}
//发送邮件
areaRemote.prototype.sendMail = function(uid,areaId,title,text,atts,cb) {
	if(this.areaManager.areaMap[areaId]){
		this.areaManager.areaMap[areaId].sendMail(uid,title,text,atts,cb)
	}else{
		cb(false)
	}
}
module.exports = function(app) {
	return bearcat.getBean({
		id : "areaRemote",
		func : areaRemote,
		args : [{
			name : "app",
			value : app
		}]
	})
}