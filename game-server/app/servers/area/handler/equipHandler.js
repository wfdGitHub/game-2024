var bearcat = require("bearcat")
var equipHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//穿戴装备
equipHandler.prototype.dressedEquip = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var wId = msg.wId
  this.areaManager.areaMap[areaId].dressedEquip(uid,wId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//卸下装备
equipHandler.prototype.takeofEquip = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].takeofEquip(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//强化装备
equipHandler.prototype.equipIntensify = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].equipIntensify(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取装备池列表
equipHandler.prototype.getEquipList = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getEquipList(uid,function(data) {
    next(null,{flag : true,data : data || {}})
  })
}
//获取可穿戴列表
equipHandler.prototype.getWearableList = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getWearableList(uid,function(data) {
    next(null,{flag : true,data : data || {}})
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
//兑换装备
equipHandler.prototype.buyEquip = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var eId = msg.eId
  var samsara = msg.samsara
  this.areaManager.areaMap[areaId].buyEquip(uid,eId,samsara,function(flag) {
    next(null,{flag : flag})
  })
}
//转换可穿戴装备
equipHandler.prototype.changeWearable = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var eId = msg.eId
  var samsara = msg.samsara
  var quality = msg.quality
  this.areaManager.areaMap[areaId].changeWearable(uid,eId,samsara,quality,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//可穿戴转换回装备池
equipHandler.prototype.changeEquip = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var wId = msg.wId
  this.areaManager.areaMap[areaId].changeEquip(uid,wId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//可穿戴装备洗练
equipHandler.prototype.wearableWash = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var wId = msg.wId
  var locks = msg.locks
  this.areaManager.areaMap[areaId].wearableWash(uid,wId,locks,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//已穿戴装备洗练
equipHandler.prototype.dressedWash = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var eId = msg.eId
  var locks = msg.locks
  this.areaManager.areaMap[areaId].dressedWash(uid,eId,locks,function(flag,data) {
    next(null,{flag : flag,data : data})
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