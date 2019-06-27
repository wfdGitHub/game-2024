var bearcat = require("bearcat")
var loginHandler = function(app) {
  this.app = app;
  this.areaDeploy = this.app.get('areaDeploy')
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
// 	var uid = session.get("uid")
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
//获取角色数据
loginHandler.prototype.getPlayerInfo = function(msg, session, next) {
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
	var uid = session.get("uid")
	var otps = {areaId : areaId,uid : uid,name : name,sex : sex}
    this.app.rpc.area.areaRemote.register.toServer(serverId,otps,function(flag,data) {
		if(flag){
	        next(null,{flag : true,msg : data})
		}else{
			next(null,{flag : false,err : data})
		}
	})
}
//登录游戏
loginHandler.prototype.loginArea = function(msg, session, next) {
	var areaId = msg.areaId
	var uid = session.get("uid")
	if(session.get("areaId")){
		next(null,{flag : false,err : "已登录"})
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
    this.app.rpc.area.areaRemote.userLogin.toServer(serverId,uid,areaId,this.app.serverId,function(playerInfo) {
		if(playerInfo){
	        session.set("areaId",areaId)
	        session.push("areaId")
	        session.set("serverId",serverId)
	        session.push("serverId")
	        next(null,{flag : true,msg : playerInfo})
		}else{
			next(null,{flag : false,msg : "未注册角色"})
		}
	})
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
	}]
  })
};