var bearcat = require("bearcat")
var uuid = require("uuid")
var areaRemote = function(app) {
	this.app = app
	this.areaManager = this.app.get("areaManager")
}
//充值回调
areaRemote.prototype.finish_recharge = function(areaId,uid,pay_id,cb) {
	var self = this
	if(self.areaManager.areaMap[areaId]){
		self.areaManager.areaMap[areaId].finish_recharge(uid,pay_id,function(flag,err) {
			if(!flag){
				console.error("finish_recharge "+err)
				var info = {
					err : err,
					areaId : areaId,
					uid : uid,
					pay_id : pay_id,
					time : (new Date()).toLocaleDateString()
				}
				self.redisDao.db.rpush("finish_recharge_faild",JSON.stringify(info))
			}
		})
	}else{
		console.error("finish_recharge "+err)
		var info = {
			err : "服务器不存在",
			uid : uid,
			areaId : areaId,
			pay_id : pay_id,
			pay_id : pay_id,
			time : (new Date()).toLocaleDateString()
		}
		self.redisDao.db.rpush("finish_recharge_faild",JSON.stringify(info))
	}
	cb()
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
areaRemote.prototype.userLogin = function(uid,areaId,oriId,cid,cb) {
	this.areaManager.userLogin(uid,areaId,oriId,cid,cb)
}
//玩家离开
areaRemote.prototype.userLeave = function(uid,cid,cb) {
	this.areaManager.userLeave(uid,cid)
	cb()
}
//踢出玩家
areaRemote.prototype.kickUser = function(uid,cb) {
	if(this.areaManager.connectorMap[uid]){
		this.app.rpc.connector.connectorRemote.kickUser.toServer(this.areaManager.connectorMap[uid],uid,null)
	}
	if(cb)
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
//设置全服邮件
areaRemote.prototype.setAreaMail = function(areaId,title,text,atts,time,cb) {
	if(this.areaManager.areaMap[areaId]){
		this.areaManager.areaMap[areaId].setAreaMail(title,text,atts,time,cb)
	}else{
		cb(false)
	}
}
//获取全服邮件
areaRemote.prototype.getAreaMailList = function(areaId,cb) {
	if(this.areaManager.areaMap[areaId]){
		this.areaManager.areaMap[areaId].getAreaMailList(cb)
	}else{
		cb(false)
	}
}
//删除全服邮件
areaRemote.prototype.deleteAreaMailList = function(areaId,id,cb) {
	if(this.areaManager.areaMap[areaId]){
		this.areaManager.areaMap[areaId].deleteAreaMailList(id,cb)
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
		}],
		props : [{
			name : "playerDao",
			ref : "playerDao"
		}]
	})
}