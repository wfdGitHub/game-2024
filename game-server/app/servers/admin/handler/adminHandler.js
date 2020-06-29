var bearcat = require("bearcat")
var adminHandler = function(app) {
	this.app = app
	this.areaDeploy = this.app.get("areaDeploy")
	this.serverManager = this.app.get("serverManager")
}
//创建新服务器
adminHandler.prototype.openArea = function(msg, session, next) {
	console.log("openArea")
	this.areaDeploy.openArea(function() {})
	next(null)
}
//暂停服务器
adminHandler.prototype.pauseArea = function(msg, session, next) {
	console.log("pauseArea")
	this.areaDeploy.pauseArea(msg.areaId,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//恢复服务器
adminHandler.prototype.resumeArea = function(msg, session, next) {
	console.log("resumeArea")
	this.areaDeploy.resumeArea(msg.areaId,function(flag,data) {
		next(null,{flag:flag,data:data})
	})
}
//获取服务器信息
adminHandler.prototype.getAreaServerInfos = function(msg, session, next) {
	var count = 0
	var servrList = this.app.getServersByType('area')
	for(var i = 0;i < servrList.length;i++){
	    this.app.rpc.area.areaRemote.getAreaServerInfos.toServer(servrList[i].id,function(infos) {
	    	count++
	    	var list = Object.assign({},infos)
	    	if(count == servrList.length){
	    		next(null,{flag : true,list : list})
	    	}
		})
	}
}
//获取服务器内玩家信息
adminHandler.prototype.getAreaPlayers = function(msg, session, next) {
	var areaId = msg.areaId
	var serverId = this.areaDeploy.getServer(areaId)
    if(!serverId){
        next(null,{flag : false,err : "服务器不存在"})
        return
    }
    this.app.rpc.area.areaRemote.getAreaPlayers.toServer(serverId,areaId,function(flag,list) {
    	next(null,{flag : true,list : list})
	})
}
//添加开服计划
adminHandler.prototype.setOpenPlan = function(msg, session, next) {
	this.serverManager.setOpenPlan(msg.time,function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//删除开服计划
adminHandler.prototype.delOpenPlan = function(msg, session, next) {
	this.serverManager.delOpenPlan(msg.time,function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//获取开服计划表
adminHandler.prototype.getOpenPlan = function(msg, session, next) {
	this.serverManager.getOpenPlan(function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//添加合服计划
adminHandler.prototype.setMergePlan = function(msg, session, next) {
	this.serverManager.setMergePlan(msg.areaList,msg.time,function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//删除合服计划
adminHandler.prototype.delMergePlan = function(msg, session, next) {
	this.serverManager.delMergePlan(msg.time,function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//获取合服计划表
adminHandler.prototype.getMergePlan = function(msg, session, next) {
	this.serverManager.getMergePlan(function(flag,data) {
		next(null,{flag : flag,data : data})
	})
}
//获取服务器列表
adminHandler.prototype.getServerList = function(msg, session, next) {
	next(null,{flag : true,data : this.areaDeploy.getServerList()})
}
//设置全服邮件
adminHandler.prototype.setAreaMail = function(msg, session, next) {
	var areaList = msg.areaList
	var title = msg.title
	var text = msg.text
	var atts = msg.atts
	var time = msg.time
	if(!areaList || typeof(title) != "string" || typeof(text) != "string" || typeof(atts) != "string" || !Number.isInteger(time)){
		next(null,{flag : false,err : "参数错误"})
		return
	}
	var serverIds = []
	for(var i = 0;i < areaList.length;i++){
		var serverId = this.areaDeploy.getServer(areaList[i])
	    if(!serverId){
	        next(null,{flag : false,err : "服务器不存在"+areaList[i]})
	        return
	    }
	    serverIds.push(serverId)
	}
	for(var i = 0;i < serverIds.length;i++){
	    this.app.rpc.area.areaRemote.setAreaMail.toServer(serverIds[i],areaList[i],title,text,atts,time,function(flag,data) {})
	}
	next(null,{flag : true})
}
//获取全服邮件
adminHandler.prototype.getAreaMailList = function(msg, session, next) {
	var areaId = msg.areaId
	var serverId = this.areaDeploy.getServer(areaId)
    if(!serverId){
        next(null,{flag : false,err : "服务器不存在"})
        return
    }
    this.app.rpc.area.areaRemote.getAreaMailList.toServer(serverId,areaId,function(flag,list) {
    	next(null,{flag : true,list : list})
	})
}
//删除全服邮件
adminHandler.prototype.deleteAreaMailList = function(msg, session, next) {
	var areaId = msg.areaId
	var id = msg.id
	var serverId = this.areaDeploy.getServer(areaId)
    if(!serverId){
        next(null,{flag : false,err : "服务器不存在"})
        return
    }
    this.app.rpc.area.areaRemote.deleteAreaMailList.toServer(serverId,areaId,id,function(flag,list) {
    	next(null,{flag : true,list : list})
	})
}
//查询玩家信息
adminHandler.prototype.getPlayerInfo = function(msg, session, next) {
	var uid = msg.uid
	if(!accId){
		next(null,{flag : false,err : "未登录账号"})
		return
	}
	this.playerDao.getPlayerInfo({uid : uid},function(playerInfo) {
		if(playerInfo){
			next(null,{flag : true,msg : playerInfo})
		}else{
			next(null,{flag : false})
		}
	})
}
//发送个人邮件
adminHandler.prototype.adminSendMail = function(msg, session, next) {
	var areaId = msg.areaId
	var uid = msg.uid
	var title = msg.title
	var text = msg.text
	var atts = msg.atts
	var serverId = this.areaDeploy.getServer(areaId)
    if(!serverId){
        next(null,{flag : false,err : "服务器不存在"})
        return
    }
    this.app.rpc.area.areaRemote.sendMail.toServer(serverId,uid,areaId,title,text,atts,function(flag,list) {
    	next(null,{flag : true,list : list})
	})
}
//设置公告
adminHandler.prototype.setNotify = function(msg,session,next) {
	var notify = msg.notify
	this.redisDao.db.set("game:notify",notify)
	next(null,{flag : true})
}
module.exports = function(app) {
	return bearcat.getBean({
		id : "adminHandler",
		func : adminHandler,
		args : [{
			name : "app",
			value : app
		}],
		props : [{
			name : "redisDao",
			ref : "redisDao"
		},{
			name : "accountDao",
			ref : "accountDao"
		},{
			name : "playerDao",
			ref : "playerDao"
		}]
	})
}