var bearcat = require("bearcat")
var manorHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//打造物品
manorHandler.prototype.manorMakeItem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorMakeItem(uid,msg.type,msg.index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//收取打造物品
manorHandler.prototype.manorGainMake = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorGainMake(uid,msg.type,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//加速打造
manorHandler.prototype.manorMakeFinish = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorMakeFinish(uid,msg.type,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取家园数据
manorHandler.prototype.manorData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorData(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//建设升级建筑
manorHandler.prototype.manorBuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var bId = msg.bId
  this.areaManager.areaMap[areaId].manorBuild(uid,bId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取收益
manorHandler.prototype.manorReap = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorReap(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//驯养马匹
manorHandler.prototype.manorStartHorse = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorStartHorse(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//购买军令
manorHandler.prototype.manorBuyAction = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorBuyAction(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//挑战首领
manorHandler.prototype.manorBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorBoss(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//挑战山贼
manorHandler.prototype.manorMon = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var monId = msg.monId
  this.areaManager.areaMap[areaId].manorMon(uid,monId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取特殊地点数据
manorHandler.prototype.manorCityInfos = function(msg, session, next) {
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorCityInfos(function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//占领特殊地点
manorHandler.prototype.manorOccupyCity = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var land = msg.land
  this.areaManager.areaMap[areaId].manorOccupyCity(uid,land,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//放弃地点
manorHandler.prototype.manorGiveUp = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var grid = msg.grid
  this.areaManager.areaMap[areaId].manorGiveUp(uid,grid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//搜寻玩家
manorHandler.prototype.manorFindUser = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorFindUser(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//占领玩家
manorHandler.prototype.manorOccupyUser = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var target = msg.target
  this.areaManager.areaMap[areaId].manorOccupyUser(uid,target,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//反击
manorHandler.prototype.manorRevolt = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorRevolt(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//查看战报
manorHandler.prototype.manorRerord = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].manorRerord(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "manorHandler",
  	func : manorHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : []
  })
};