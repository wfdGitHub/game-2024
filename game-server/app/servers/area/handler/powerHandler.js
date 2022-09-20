var bearcat = require("bearcat")
var beauty_gift = require("../../../../config/gameCfg/beauty_gift.json")
var beauty_base = require("../../../../config/gameCfg/beauty_base.json")
var powerHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取主动技能数据
powerHandler.prototype.getPowerData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getPowerData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升星
powerHandler.prototype.upPowerStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerStar(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升级
powerHandler.prototype.upPowerLv = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerLv(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升阶
powerHandler.prototype.upPowerAd = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerAd(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置上阵技能
powerHandler.prototype.setPowerFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var list = msg.list
  this.areaManager.areaMap[areaId].setPowerFight(uid,list,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能重生
powerHandler.prototype.resetPower = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].resetPower(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置释放偏好
powerHandler.prototype.setManualModel = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].setManualModel(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}

//获取红颜技能
powerHandler.prototype.getBeautyData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getBeautyData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//红颜技能升星
powerHandler.prototype.upBeautStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  this.areaManager.areaMap[areaId].upBeautStar(uid,beautId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//红颜技能升阶
powerHandler.prototype.upBeautAd = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  this.areaManager.areaMap[areaId].upBeautAd(uid,beautId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//红颜送礼
powerHandler.prototype.giveBeautGift = function(msg, session, next) {
  var self = this
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  var itemId = msg.itemId
  var count = msg.count
  if(!Number.isInteger(count) || count <= 0){
    next(null,{flag : false,err : "count error "+count})
    return
  }
  if(!beauty_base[beautId]){
    next(null,{flag : false,err : "红颜不存在"})
    return
  }
  if(!beauty_gift[itemId]){
    next(null,{flag : false,err : "礼物不存在"})
    return
  }
  var nature = beauty_base[beautId]["nature"]
  var value = beauty_gift[itemId]["nature_"+nature] * count
  self.areaManager.areaMap[areaId].consumeItems(uid,itemId+":"+count,1,"送礼"+beautId,function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    var beautInfo = self.areaManager.areaMap[areaId].getBeautyInfo(uid,beautId)
    var oldValue = beautInfo.opinion
    beautInfo.opinion += value
    self.areaManager.areaMap[areaId].setBeautInfo(uid,beautId,"opinion",beautInfo.opinion)
    next(null,{flag : true,curValue : value,oldValue : oldValue,beautInfo:beautInfo})
  })
}
//红颜互动

//红颜上阵
powerHandler.prototype.setBeautFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  this.areaManager.areaMap[areaId].setBeautFight(uid,beautId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "powerHandler",
  	func : powerHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};