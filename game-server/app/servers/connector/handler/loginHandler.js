var bearcat = require("bearcat")
var loginHandler = function(app) {
  this.app = app;
  this.areaDeploy = this.app.get('areaDeploy')
}
//获取服务器列表
loginHandler.prototype.getAreaList = function(msg, session, next) {
	if(msg.type == "all"){
		next(null,{flag : true,areaList : this.areaDeploy.areaList})
	}else{
		next(null,{flag : true,areaList : this.areaDeploy.areaList.slice(-10)})
	}
}
//登录游戏
loginHandler.prototype.loginArea = function(msg, session, next) {
	var areaId = msg.areaId
	if(!areaId || typeof(areaId) != "number"){
		next(null,{flag : false,err : "areaId error : "+areaId})
		return
	}
	var uid = session.get("uid")
	if(!uid){
		next(null,{flag : false,err : "玩家未登录"})
		return
	}
	var serverId = this.areaDeploy.getServer(areaId)
	if(!serverId){
		next(null,{flag : false,err : "服务器不存在"})
		return
	}
	this.app.rpc.area.areaRemote.userLogin.toServer(serverId,uid,areaId,function(playerInfo) {
		if(!playerInfo){
			next(null,{flag : false,err : "登陆失败"})
			return
		}
		session.set("areaId",areaId)
		session.push("areaId")
		session.set("playerInfo",playerInfo)
		session.push("playerInfo")
		next(null,{flag : true,msg : playerInfo})
	})
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "loginHandler",
  	func : loginHandler,
	args : [{
		name : "app",
		value : app
	}]
  })
};