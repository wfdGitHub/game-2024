var bearcat = require("bearcat")
var checkpointsCfg = require("../../../../config/gameCfg/checkpoints.json")
var charactersCfg = require("../../../../config/gameCfg/characters.json")
var fightHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//模拟战斗
fightHandler.prototype.mockFight = function(msg, session, next) {
  var atkTeam = msg.atkTeam
  var defTeam = msg.defTeam
  var seededNum = msg.seededNum
  var readList = msg.readList
  if(atkTeam instanceof Array && defTeam instanceof Array){
    var result = this.areaManager.fightContorl.fighting(atkTeam,defTeam,seededNum,readList)
    next(null,{flag : true,result : result})
  }else{
    next(null,{flag : false,err : "args error"})
  }
}
//获取BOSS关卡挑战信息
fightHandler.prototype.getCheckpointsInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getCheckpointsInfo(uid,function(data) {
    next(null,{flag : true,msg : data})
  })
}
//准备战斗 获取战斗属性
fightHandler.prototype.readyFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var fightInfo = this.areaManager.areaMap[areaId].readyFight(uid)
  if(fightInfo){
    next(null,{flag : true,fightInfo : fightInfo})
  }else{
    next(null,{flag : false})
  }
}
//挑战BOSS关卡
fightHandler.prototype.challengeCheckpoints = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var otps = {
    seededNum : msg.seededNum || Date.now(),
    readList : msg.readList || [],
    verify : msg.verify
  }
  this.areaManager.areaMap[areaId].challengeCheckpoints(uid,otps,function(flag,result) {
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