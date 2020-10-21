var bearcat = require("bearcat")
//牧野之战 3V3
var muyeHandler = function(app) {
  this.app = app;
	this.crossManager = this.app.get("crossManager")
};
//赛季结算
muyeHandler.prototype.settleMuye = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.settleMuye()
  next(null,{flag:true})
}
//获取历史挑战记录
muyeHandler.prototype.getMuyeRecord = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getMuyeRecord(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取我的数据
muyeHandler.prototype.getMuyeData = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.getMuyeData(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//点赞
muyeHandler.prototype.muyeLike = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var index = msg.index
  this.crossManager.muyeLike(crossUid,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//领取宝箱
muyeHandler.prototype.gainMuyeBox = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var index = msg.index
  this.crossManager.gainMuyeBox(crossUid,index,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置阵容
muyeHandler.prototype.muyeSetFightTeams = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  var hIds = msg.hIds
  this.crossManager.muyeSetFightTeams(crossUid,hIds,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//匹配战斗
muyeHandler.prototype.matchMuye = function(msg, session, next) {
  var crossUid = session.get("crossUid")
  this.crossManager.matchMuye(crossUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "muyeHandler",
  	func : muyeHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};