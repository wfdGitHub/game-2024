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
loginHandler.prototype.chooseArea = function(msg, session, next) {
	if(session.get("areaId")){
		next(null,{flag : false,err : "已登录游戏服务器"})
		return
	}
	var uid = session.get("uid")
	if(!uid){
		next(null,{flag : false,err : "玩家未登录"})
		return
	}
	var areaId = msg.areaId
	var serverId = this.areaDeploy.getServer(areaId)
	if(serverId){
		session.set("serverId",serverId)
		session.push("serverId")
		next(null,{flag : true})
	}else{
		next(null,{flag : false,err : "服务器不存在"})
	}
}
//获取当前所在服务器
loginHandler.prototype.getLocationAreaId = function(msg, session, next) {
	var areaId = session.get("areaId")
	if(areaId){
		next(null,{flag : true,msg : areaId})
	}else{
		next(null,{flag : false})
	}
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