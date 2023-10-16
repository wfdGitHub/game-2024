var bearcat = require("bearcat")
var async = require("async")
var fabaoHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取数据
fabaoHandler.prototype.getFabaoData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getFabaoData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝加点
fabaoHandler.prototype.slotPointFabao = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].slotPointFabao(uid,msg.fId,msg.slots,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝加点-穿戴
fabaoHandler.prototype.slotPointFabaoByHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].slotPointFabaoByHero(uid,msg.hId,msg.index,msg.slots,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝穿戴
fabaoHandler.prototype.wearFabao = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].wearFabao(uid,msg.hId,msg.fId,msg.index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝卸下
fabaoHandler.prototype.unWearFabao = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].unWearFabao(uid,msg.hId,msg.index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝洗练
fabaoHandler.prototype.washFabao = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].washFabao(uid,msg.fId1,msg.fId2,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝洗练保存
fabaoHandler.prototype.saveWashFabao = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].saveWashFabao(uid,msg.fId,msg.select,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝升级
fabaoHandler.prototype.upFabao = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].upFabao(uid,msg.fId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝分解
fabaoHandler.prototype.recycleFabao = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].recycleFabao(uid,msg.fIds,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝重生
fabaoHandler.prototype.resetFabaoLv = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].resetFabaoLv(uid,msg.fId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝洗练-穿戴
fabaoHandler.prototype.washFabaoByHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].washFabaoByHero(uid,msg.hId,msg.index,msg.fId2,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝洗练保存-穿戴
fabaoHandler.prototype.saveWashFabaoByHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].saveWashFabaoByHero(uid,msg.hId,msg.index,msg.select,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝升级-穿戴
fabaoHandler.prototype.upFabaoByHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].upFabaoByHero(uid,msg.hId,msg.index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//法宝重生-穿戴
fabaoHandler.prototype.resetFabaoLvByHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].resetFabaoLvByHero(uid,msg.hId,msg.index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "fabaoHandler",
  	func : fabaoHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "heroDao",
      ref : "heroDao"
    }]
  })
};