var bearcat = require("bearcat")
var checkpointsCfg = require("../../../../config/gameCfg/checkpoints.json")
var fightHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//模拟战斗
fightHandler.prototype.mockFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var fightInfo = this.areaManager.areaMap[areaId].getFightInfo(uid)
  if(fightInfo){
    var atkTeam = fightInfo.team
    var defTeam = atkTeam
    var seededNum = fightInfo.seededNum
    var result = this.areaManager.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
    next(null,{flag : true,result : result})
  }else{
    next(null,{flag : false,result : "未准备"})
  }
}
//获取BOSS关卡挑战信息
fightHandler.prototype.getCheckpointsInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  let info = this.areaManager.areaMap[areaId].getCheckpointsInfo(uid)
  next(null,{flag : true,msg : info})
}
//准备战斗 获取战斗属性
fightHandler.prototype.readyFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var fightInfo = this.areaManager.areaMap[areaId].readyFight(uid,function(flag,data) {
    next(null,{flag : flag,fightInfo : data})
  })
}
//挑战BOSS关卡
fightHandler.prototype.challengeCheckpoints = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var verify = msg.verify
  this.areaManager.areaMap[areaId].challengeCheckpoints(uid,verify,function(flag,result) {
    next(null,{flag : flag,result : result})
  })
}
//领取章节宝箱
fightHandler.prototype.gainChapterAwardBox = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var chapterId = msg.chapterId
  this.areaManager.areaMap[areaId].gainChapterAwardBox(uid,chapterId,function(flag,result) {
    next(null,{flag : flag,result : result})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "fightHandler",
  	func : fightHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};