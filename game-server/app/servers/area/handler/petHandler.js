var bearcat = require("bearcat")
var petHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//增加宠物栏
petHandler.prototype.addPetAmount = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].addPetAmount(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//玩家获得宠物
petHandler.prototype.obtainPet = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  this.areaManager.areaMap[areaId].obtainPet(uid,characterId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//移除宠物
petHandler.prototype.removePet = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].removePet(uid,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置出战宠物
petHandler.prototype.setFightPet = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].setFightPet(uid,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//宠物休息
petHandler.prototype.petRest = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].petRest(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取玩家信息
petHandler.prototype.getPlayerInfo = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  next(null,{flag : true,data : this.areaManager.areaMap[areaId].players[uid]})
}
//宠物转生
petHandler.prototype.petSamsara = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].petSamsara(uid,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//宠物进阶
petHandler.prototype.petAdvanced = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].petAdvanced(uid,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取宠物图鉴
petHandler.prototype.getPetArchive = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getPetArchive(uid,function(data) {
    next(null,{flag : true,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "petHandler",
  	func : petHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};