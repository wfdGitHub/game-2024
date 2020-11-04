//公会
var bearcat = require("bearcat")
var guildHandler = function(app) {
  	this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//创建公会
guildHandler.prototype.createGuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var name = msg.name
  this.areaManager.areaMap[areaId].createGuild(uid,name,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//解散公会
guildHandler.prototype.dissolveGuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].dissolveGuild(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取我的公会信息
guildHandler.prototype.getMyGuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getMyGuild(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置公告
guildHandler.prototype.setGuildNotify = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var notify = msg.notify
  this.areaManager.areaMap[areaId].setGuildNotify(uid,notify,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取公会成员
guildHandler.prototype.getMyGuildUsers = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getMyGuildUsers(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取公会列表
guildHandler.prototype.getGuildList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getGuildList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//申请加入公会
guildHandler.prototype.applyJoinGuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var guildId = msg.guildId
  this.areaManager.areaMap[areaId].applyJoinGuild(uid,guildId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获得申请列表
guildHandler.prototype.getGuildApplyList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getGuildApplyList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//同意申请
guildHandler.prototype.agreeGuildApply = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var targetUid = msg.targetUid
  this.areaManager.areaMap[areaId].agreeGuildApply(uid,targetUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//拒绝申请
guildHandler.prototype.refuseGuildApply = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var targetUid = msg.targetUid
  this.areaManager.areaMap[areaId].refuseGuildApply(uid,targetUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//退出公会
guildHandler.prototype.quitGuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].quitGuild(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置成副会长
guildHandler.prototype.setGuildDeputy = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var targetUid = msg.targetUid
  this.areaManager.areaMap[areaId].setGuildDeputy(uid,targetUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置成普通成员
guildHandler.prototype.setGuildNormal = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var targetUid = msg.targetUid
  this.areaManager.areaMap[areaId].setGuildNormal(uid,targetUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置成会长
guildHandler.prototype.setGuildLead = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var targetUid = msg.targetUid
  this.areaManager.areaMap[areaId].setGuildLead(uid,targetUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取公会日志
guildHandler.prototype.getGuildLog = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getGuildLog(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//请离玩家
guildHandler.prototype.kickGuildNormal = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var targetUid = msg.targetUid
  this.areaManager.areaMap[areaId].kickGuildNormal(uid,targetUid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//签到
guildHandler.prototype.signInGuild = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var sign = msg.sign
  this.areaManager.areaMap[areaId].signInGuild(uid,sign,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//升级公会技能
guildHandler.prototype.upGuildSkill = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var career = msg.career
  this.areaManager.areaMap[areaId].upGuildSkill(uid,career,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获取公会排行榜
guildHandler.prototype.getGuildRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getGuildRank(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//设置审核状态
guildHandler.prototype.setGuildAudit = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var audit = msg.audit
  var lv_limit = msg.lv_limit
  this.areaManager.areaMap[areaId].setGuildAudit(uid,audit,lv_limit,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "guildHandler",
  	func : guildHandler,
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