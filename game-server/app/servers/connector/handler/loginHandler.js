var bearcat = require("bearcat")
var loginHandler = function(app) {
  this.app = app;
  this.areaDeploy = this.app.get('areaDeploy')
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
	this.app.rpc.area.areaRemote.userLogin(session,uid,areaId,function(playerInfo) {
		console.log("playerInfo ",playerInfo)
		if(!playerInfo){
			next(null,{flag : false,err : "登陆失败"})
			return
		}
		session.set("serverId",serverId)
		session.set("areaId",areaId)
		session.push("serverId")
		session.push("areaId")
		next(null,{flag : true,msg : "登陆成功"})
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