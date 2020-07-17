var bearcat = require("bearcat")
//逐鹿之战
var activityHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获取新服BOSS数据
activityHandler.prototype.getAreaChallengeData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getAreaChallengeData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//挑战新服BOSS
activityHandler.prototype.areaChallenge = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].areaChallenge(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取限时礼包数据
activityHandler.prototype.getLimitGiftData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getLimitGiftData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//购买限时礼包
activityHandler.prototype.buyLimitGift = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].buyLimitGift(uid,id,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//购买每日礼包
activityHandler.prototype.buyAwardBagday = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].buyAwardBagday(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取首充礼包
activityHandler.prototype.gainFirstRechargeAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainFirstRechargeAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取累充奖励
activityHandler.prototype.gainRechargeTotalAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainRechargeTotalAward(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取单充奖励
activityHandler.prototype.gainRechargeOnceAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainRechargeOnceAward(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获得活动数据
activityHandler.prototype.getActivityData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getActivityData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//签到
activityHandler.prototype.gainSignInAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainSignInAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取签到宝箱
activityHandler.prototype.gainSignInBox = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainSignInBox(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//在线奖励
activityHandler.prototype.gainOnlineTimeAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainOnlineTimeAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//模拟充值
activityHandler.prototype.apply_recharge = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].apply_recharge(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取VIP免费礼包
activityHandler.prototype.gainVipAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainVipAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//购买VIP付费礼包
activityHandler.prototype.buyVipAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var vip = msg.vip
  if(vip < 1){
    next(null,{flag : false,msg : "vip error"})
    return
  }
  this.areaManager.areaMap[areaId].buyVipAward(uid,vip,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取等级奖励
activityHandler.prototype.gainActivityLvAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainActivityLvAward(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//激活等级基金
activityHandler.prototype.activateLvFund = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].activateLvFund(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取战力奖励
activityHandler.prototype.gainActivityCeAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainActivityCeAward(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取普通月卡
activityHandler.prototype.gainNormalCardAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainNormalCardAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//激活专属月卡
activityHandler.prototype.activateHighCard = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].activateHighCard(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取专属月卡
activityHandler.prototype.gainHighCardAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainHighCardAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取冲榜活动排行榜
activityHandler.prototype.getAreaRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getAreaRank(function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取冲榜奖励
activityHandler.prototype.gainAreaRankAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainAreaRankAward(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取消耗活动奖励
activityHandler.prototype.gainConsumeTotalAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainConsumeTotalAward(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "activityHandler",
  	func : activityHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};