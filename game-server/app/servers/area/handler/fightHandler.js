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
//挑战BOSS关卡
fightHandler.prototype.challengeCheckpoints = function(msg, session, next) {
  var uid = session.get("uid")
  var areaId = session.get("areaId")
  var playerInfo = session.get("playerInfo")
  var seededNum = msg.seededNum || Date.now()
  var readList = msg.readList || []
  var otps = {
    characters : playerInfo.characters,
    seededNum : msg.seededNum || Date.now(),
    readList : msg.readList || []
  }
  console.log(otps)
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