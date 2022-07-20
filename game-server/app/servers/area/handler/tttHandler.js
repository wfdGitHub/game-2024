var bearcat = require("bearcat")
var tttHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获取通天塔数据
tttHandler.prototype.getTTTInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getTTTInfo(uid,function(msg) {
    next(null,{flag : true,msg : msg})
  })
}
//挑战BOSS
tttHandler.prototype.challengeTTTBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].challengeTTTBoss(uid,msg.verify,msg.masterSkills,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//扫荡
tttHandler.prototype.TTTmopup = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var level = msg.level
  this.areaManager.areaMap[areaId].TTTmopup(uid,level,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//挑战阵营塔
tttHandler.prototype.challengeRealmBoss = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var realm = msg.realm
  var heros = msg.heros
  var seededNum = msg.seededNum
  var verify = msg.verify
  var masterSkills = msg.masterSkills
  if(!Number.isInteger(seededNum)){
    next(null,{flag : false,msg : "seededNum error"})
    return
  }
  if(!Array.isArray(heros)){
    next(null,{flag : false,msg : "heros error"})
    return
  }
  if(heros.length >= 7)
    heros = heros.slice(0,6)
  this.areaManager.areaMap[areaId].challengeRealmBoss(uid,realm,heros,seededNum,verify,masterSkills,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//扫荡阵营塔
tttHandler.prototype.realmMopup = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var realm = msg.realm
  this.areaManager.areaMap[areaId].realmMopup(uid,realm,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//升级阵营加成
tttHandler.prototype.upgradCampAtt = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var camp = msg.camp
  this.areaManager.areaMap[areaId].upgradCampAtt(uid,camp,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取通天塔特权奖励
tttHandler.prototype.tttPriAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].tttPriAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "tttHandler",
  	func : tttHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};