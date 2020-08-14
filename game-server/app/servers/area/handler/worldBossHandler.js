//世界boss
var bearcat = require("bearcat")
var worldBossHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获取世界BOSS数据
worldBossHandler.prototype.getWorldBossData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getWorldBossData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//挑战世界BOSS
worldBossHandler.prototype.challengeWorldBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].challengeWorldBoss(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取排行榜
worldBossHandler.prototype.getWorldBossRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getWorldBossRank(function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//抢夺玩家
worldBossHandler.prototype.robWorldBossPlayer = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  let targetUid = msg.targetUid
  this.areaManager.areaMap[areaId].robWorldBossPlayer(uid,targetUid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
  //获取全服BOSS数据
worldBossHandler.prototype.getAreaBossData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getAreaBossData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
  //挑战全服BOSS
worldBossHandler.prototype.challengeAreaBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].challengeAreaBoss(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
  //购买全服BOSS挑战次数
worldBossHandler.prototype.buyAreaBossCount = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].buyAreaBossCount(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
  //购买全服BOSS伤害增加
worldBossHandler.prototype.buyAreaBossUp = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].buyAreaBossUp(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
  //领取全服BOSS宝箱奖励
worldBossHandler.prototype.gainAreaBossBox = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainAreaBossBox(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
  //获取排行榜
worldBossHandler.prototype.getAreaBossRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getAreaBossRank(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "worldBossHandler",
  	func : worldBossHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};