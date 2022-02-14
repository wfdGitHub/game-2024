var bearcat = require("bearcat")
//公会PK
var guildPkHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//报名
guildPkHandler.prototype.applyGuildPKRival = function(msg, session, next) {
  var crossUid = session.get("crossUid")
    //测试功能
  if(this.crossManager.players[crossUid]["playerInfo"]["gid"]){
    this.redisDao.db.hset("guild_pk:apply",this.crossManager.players[crossUid]["playerInfo"]["gid"],1)
    next(null,{flag:true})
  }else{
    next(null,{flag:false})
  }
}
//匹配公会
guildPkHandler.prototype.matchGuildPKRival = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.matchGuildPKRival()
  next(null)
}
//结算PK
guildPkHandler.prototype.guildPkSettle = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.guildPkSettle()
  next(null)
}
//获取PK信息
guildPkHandler.prototype.getGuildPKInfo = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getGuildPKInfo(crossUid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取挑战记录
guildPkHandler.prototype.getGuildPKRecord = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var guildId = msg.guildId
  var index = msg.index
  this.crossManager.getGuildPKRecord(crossUid,guildId,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//挑战对手
guildPkHandler.prototype.challengeGuildPk = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var index = msg.index
  var star = msg.star
  this.crossManager.challengeGuildPk(crossUid,index,star,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "guildPkHandler",
  	func : guildPkHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "redisDao",
      ref : "redisDao"
    }]
  })
};