var bearcat = require("bearcat")
var areaLoginHandler = function(app) {
  this.app = app;
  this.areaManager = this.app.get("areaManager")
}
//获取角色数据
areaLoginHandler.prototype.getPlayerInfo = function(msg, session, next) {
	var areaId = msg.areaId
	if(!areaId){
		next(null,{flag : false,err : "areaId error"})
		return
	}
	var uid = session.get("uid")
	this.playerDao.getPlayerInfo({areaId : areaId,uid : uid},function(playerInfo) {
		next(null,{flag : true,msg : playerInfo})
	})
}
//创建角色
areaLoginHandler.prototype.register = function(msg, session, next) {
	var areaId = msg.areaId
	var name = msg.name
	var sex = msg.sex
	if(!areaId){
		next(null,{flag : false,err : "areaId error"})
		return
	}
	var uid = session.get("uid")
	var self = this
	var otps = {areaId : areaId,uid : uid,name : name,sex : sex}
	self.playerDao.getPlayerInfo(otps,function(playerInfo) {
		if(playerInfo){
			next(null,{flag : false,err : "账号已存在"})
		}else{
			self.playerDao.createPlayer(otps,function(playerInfo) {
				next(null,{flag : true,msg : playerInfo})
			})
		}
	})
}
//登录游戏
areaLoginHandler.prototype.loginArea = function(msg, session, next) {
	var areaId = msg.areaId
	var cid = session.frontendId
	var uid = session.get("uid")
	if(session.get("areaId")){
		next(null,{flag : false,err : "已登录"})
		return
	}
	if(!areaId){
		next(null,{flag : false,err : "areaId error"})
		return
	}
	this.areaManager.userLogin(uid,areaId,cid,function(playerInfo) {
		if(playerInfo){
	        session.set("areaId",areaId)
	        session.push("areaId")
	        session.set("playerInfo",playerInfo)
	        session.push("playerInfo")
	        next(null,{flag : true,msg : playerInfo})
		}else{
			next(null,{flag : false,msg : "未注册角色"})
		}
	})
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "areaLoginHandler",
  	func : areaLoginHandler,
	args : [{
		name : "app",
		value : app
	}],
	props : [{
		name : "playerDao",
		ref : "playerDao"
	}]
  })
};