var boyNames = require("../../../../config/sysCfg/boy.json")
var girlNames = require("../../../../config/sysCfg/girl.json")
var bearcat = require("bearcat")
var loginHandler = function(app) {
  this.app = app;
  this.areaDeploy = this.app.get('areaDeploy')
  this.sessionService = this.app.get('sessionService')
  this.connectorManager = this.app.get('connectorManager')
  this.boyNameNum = boyNames.length
  this.girlNameNum = girlNames.length
}
//获取服务器列表
loginHandler.prototype.getAreaList = function(msg, session, next) {
	var index = msg.index
	if(index){
		next(null,{flag : true,areaList : this.areaDeploy.areaList.slice(index-10,index),index : index-10})
	}else{
		next(null,{flag : true,areaList : this.areaDeploy.areaList.slice(-10),index : -10})
	}
}
//选择服务器
// loginHandler.prototype.chooseArea = function(msg, session, next) {
// 	if(session.get("areaId")){
// 		next(null,{flag : false,err : "已登录游戏服务器"})
// 		return
// 	}
// 	var uid = session.uid
// 	if(!uid){
// 		next(null,{flag : false,err : "玩家未登录"})
// 		return
// 	}
// 	var areaId = msg.areaId
// 	var serverId = this.areaDeploy.getServer(areaId)
// 	if(serverId){
// 		session.set("serverId",serverId)
// 		session.push("serverId")
// 		next(null,{flag : true})
// 	}else{
// 		next(null,{flag : false,err : "服务器不存在"})
// 	}
// }
//获取当前所在服务器
loginHandler.prototype.getLocationAreaId = function(msg, session, next) {
	var areaId = session.get("areaId")
	if(areaId){
		next(null,{flag : true,msg : areaId})
	}else{
		next(null,{flag : false})
	}
}
//获取角色列表
loginHandler.prototype.getPlayerList = function(msg, session, next) {
	var accId = session.get("accId")
	if(!accId){
		next(null,{flag : false,err : "未登录账号"})
		return
	}
	this.playerDao.getPlayerList({accId : accId},function(flag,list) {
		next(null,{flag : flag,list : list})
	})
}
//获取角色数据
loginHandler.prototype.getPlayerInfo = function(msg, session, next) {
	var accId = session.get("accId")
	var areaId = msg.areaId
	if(!accId){
		next(null,{flag : false,err : "未登录账号"})
		return
	}
	if(!areaId){
		next(null,{flag : false,err : "areaId error"})
		return
	}
	var self = this
	self.playerDao.getUidByAreaId({accId : accId,areaId : areaId},function(flag,uid) {
		self.playerDao.getPlayerInfo({areaId : areaId,uid : uid},function(playerInfo) {
			if(playerInfo){
				next(null,{flag : true,msg : playerInfo})
			}else{
				next(null,{flag : false})
			}
		})
	})
}
//创建角色
loginHandler.prototype.register = function(msg, session, next) {
	var areaId = msg.areaId
	var name = msg.name
	var sex = msg.sex
	if(!areaId){
		next(null,{flag : false,err : "areaId error"})
		return
	}
    var serverId = this.areaDeploy.getServer(areaId)
    if(!serverId){
        next(null,{flag : false,err : "服务器不存在"})
        return
    }
    if(!Number.isInteger(areaId) || typeof(name) !== "string"){
        next(null,{flag : false,err : "参数错误"})
        return
    }
    name = name.replace(/\s*/g,"");
    if(name.length < 2){
        next(null,{flag : false,err : "该名称已被使用"})
        return
    }
    if(sex !== 1){
    	sex = 2
    }
	var accId = session.get("accId")
	var otps = {areaId : areaId,accId : accId,name : name,sex : sex}
    this.app.rpc.area.areaRemote.register.toServer(serverId,otps,function(flag,data) {
		if(flag){
	        next(null,{flag : true,msg : data})
		}else{
			next(null,{flag : false,err : data})
		}
	})
}
//获取随机姓名
loginHandler.prototype.getRandomName = function(msg, session, next) {
	var sex = msg.sex
	var name = ""
	if(sex == 1){
		//男
		var rand = Math.floor(this.boyNameNum * Math.random())
		name = boyNames[rand]
	}else if(sex == 2){
		//女
		var rand = Math.floor(this.girlNameNum * Math.random())
		name = girlNames[rand]
	}
	next(null,{flag : true,name : name})
}
//登录游戏
loginHandler.prototype.loginArea = function(msg, session, next) {
	var areaId = msg.areaId
	var accId = session.get("accId")
	if(!accId){
		next(null,{flag : false,err : "未登录账号"})
		return
	}
	if(session.get("areaId")){
		next(null,{flag : false,err : "已登录服务器"})
		return
	}
	if(!areaId){
		next(null,{flag : false,err : "areaId error"})
		return
	}
    var serverId = this.areaDeploy.getServer(areaId)
    if(!serverId){
        next(null,{flag : false,err : "服务器不存在"})
        return
    }
    var self = this
    self.playerDao.getUidByAreaId({accId : accId,areaId : areaId},function(flag,uid) {
    	if(!flag){
    		next(null,{flag : false,err : "未注册角色"})
    		return
    	}
		//检查重复登录
		if( !! self.sessionService.getByUid(uid)) {
			self.connectorManager.sendByUid(uid,{type : "kick"})
			var uids = self.sessionService.getByUid(uid)
			for(var i = 0;i < uids.length;i++){
				self.sessionService.kickBySessionId(uids[i].id)
			}
		}
    	session.bind(uid)
    	session.on("closed",onUserLeave.bind(self))
	    self.app.rpc.area.areaRemote.userLogin.toServer(serverId,uid,areaId,self.app.serverId,function(flag,playerInfo) {
	    	console.log("playerInfo",playerInfo)
			if(flag){
		        session.set("areaId",areaId)
		        session.push("areaId")
		        session.set("serverId",serverId)
		        session.push("serverId")
				session.set("nickname",playerInfo.name)
				session.push("nickname")
				session.set("beginTime",Date.now())
				session.push("beginTime")
		        next(null,{flag : flag,msg : playerInfo})
			}else{
				next(null,{flag : flag,msg : playerInfo})
			}
		})
    })
}
var onUserLeave = function(session) {
	var uid = session.uid
	console.log("onUserLeave : "+uid + "  "+this.app.serverId)
	if(uid){
		session.unbind(uid)
		var accId = session.get("accId")
		var beginTime = session.get("beginTime")
		var serverId = session.get("serverId")
		if(accId)
			this.accountDao.updatePlaytime({accId : accId,beginTime : beginTime})
		if(serverId)
			this.app.rpc.area.areaRemote.userLeave.toServer(serverId,uid,this.app.serverId,null)
		this.app.rpc.chat.chatRemote.userLeave(null,uid,this.app.serverId,null)
	}
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "loginHandler",
  	func : loginHandler,
	args : [{
		name : "app",
		value : app
	}],
	props : [{
		name : "playerDao",
		ref : "playerDao"
	},{
      name : "accountDao",
      ref : "accountDao"
    }]
  })
};