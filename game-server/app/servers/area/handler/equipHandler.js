var bearcat = require("bearcat")
var equipHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取装备列表
equipHandler.prototype.getEquipList = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getEquipList(uid,function(data) {
    next(null,{flag : true,data : data || {}})
  })
}
//获得新装备
equipHandler.prototype.addEquip = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var eId = msg.eId
  var samsara = msg.samsara
  var quality = msg.quality
  this.areaManager.areaMap[areaId].addEquip(uid,eId,samsara,quality,function(flag) {
    next(null,{flag : flag})
  })
}
//批量分解装备
equipHandler.prototype.resolveEquip = function(msg, session, next) {
  var uid = session.get("uid")
  var elist = msg.elist
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].resolveEquip(uid,elist,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "equipHandler",
  	func : equipHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};