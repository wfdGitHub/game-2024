var bearcat = require("bearcat")
var adminHanlder = function(app) {
	this.app = app
	this.areaDeploy = this.app.get("areaDeploy")
}
//激活管理员模式
adminHanlder.prototype.activatePrivileges = function(msg, session, next) {
	var uid = session.get("uid")
	this.accountDao.getAccountData({uid : uid,name : "limit"},function(flag,limit) {
		limit = parseInt(limit)
		if(limit >= 10){
			session.set("limit",limit)
			session.push("limit")
			next(null,{flag : true,limit : limit})
		}else{
			next(null,{flag : false})
		}
	})
}
//创建新服务器
adminHanlder.prototype.openArea = function(msg, session, next) {
	console.log("openArea")
	this.areaDeploy.openArea({areaName : "服务器"})
	next(null)
}
//获取服务器信息
adminHanlder.prototype.getAreaServerInfos = function(msg, session, next) {
	var list = {}
	var count = 0
	var servrList = this.app.getServersByType('area')
	for(var i = 0;i < servrList.length;i++){
	    this.app.rpc.area.areaRemote.getAreaServerInfos.toServer(servrList[i].id,function(infos) {
	    	count++
	    	list = Object.assign(list,infos)
	    	if(count == servrList.length){
	    		next(null,{flag : true,list : list})
	    	}
		})
	}
}
module.exports = function(app) {
	return bearcat.getBean({
		id : "adminHanlder",
		func : adminHanlder,
		args : [{
			name : "app",
			value : app
		}],
		props : [{
			name : "accountDao",
			ref : "accountDao"
		}]
	})
}