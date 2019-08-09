var bearcat = require("bearcat")
var partnerHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//激活伙伴
partnerHandler.prototype.activatePartner = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  this.areaManager.areaMap[areaId].activatePartner(uid,characterId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取已获得转生被动技能列表
partnerHandler.prototype.getLearnPassiveList = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  var samsara = msg.samsara
  this.areaManager.areaMap[areaId].getLearnPassiveList(uid,characterId,samsara,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//重置转生技能
partnerHandler.prototype.resetLearnPassive = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  var samsara = msg.samsara
  this.areaManager.areaMap[areaId].resetLearnPassive(uid,characterId,samsara,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//学习转生被动技能
partnerHandler.prototype.learnPassive = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  var samsara = msg.samsara
  var index = msg.index
  this.areaManager.areaMap[areaId].learnPassive(uid,characterId,samsara,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "partnerHandler",
  	func : partnerHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};