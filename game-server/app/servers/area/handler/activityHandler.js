var bearcat = require("bearcat")
//逐鹿之战
var activityHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//申请支付
activityHandler.prototype.apply_recharge = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var unionid = session.get("unionid")
  var pay_id = msg.pay_id
  this.areaManager.areaMap[areaId].apply_recharge(uid,unionid,pay_id,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//申请支付测试接口
activityHandler.prototype.test_recharge = function(msg, session, next) {
  next(null,{flag : false})
  return
  var uid = session.uid
  var areaId = session.get("areaId")
  var pay_id = msg.pay_id
  this.areaManager.areaMap[areaId].finish_recharge(uid,pay_id,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//征税
activityHandler.prototype.revenueCoin = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].revenueCoin(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//挑战魔物入侵
activityHandler.prototype.challengeInvade = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].challengeInvade(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//领取充值天数礼包
activityHandler.prototype.gainRPayDaysAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].gainRPayDaysAward(uid,id,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取每日免费礼包
activityHandler.prototype.gainFreeDayAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].gainFreeDayAward(uid,id,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取每日首充礼包
activityHandler.prototype.gainRechargeDayAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].gainRechargeDayAward(uid,id,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//领取每周累充奖励
activityHandler.prototype.gainRechargeWeekAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  this.areaManager.areaMap[areaId].gainRechargeWeekAward(uid,id,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取新服BOSS数据
activityHandler.prototype.getAreaChallengeData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getAreaChallengeData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//挑战试炼
activityHandler.prototype.areaTrial = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  if(!msg.verifys || !Array.isArray(msg.verifys) || msg.verifys.length != 6){
    next(null,{flag:false,err:"verifys error"})
    return
  }
  this.areaManager.areaMap[areaId].areaTrial(uid,msg.verifys,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//挑战新服BOSS
activityHandler.prototype.areaChallenge = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].areaChallenge(uid,msg.verify,function(flag,msg) {
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
// //购买限时礼包
// activityHandler.prototype.buyLimitGift = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var id = msg.id
//   this.areaManager.areaMap[areaId].buyLimitGift(uid,id,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
//购买每日礼包
// activityHandler.prototype.buyAwardBagday = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var index = msg.index
//   this.areaManager.areaMap[areaId].buyAwardBagday(uid,index,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
//获取每周礼包与每月礼包购买记录
activityHandler.prototype.getWeekAndMonthRecord = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getWeekAndMonthRecord(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
// //购买每周礼包
// activityHandler.prototype.buyAwardBagWeek = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var index = msg.index
//   this.areaManager.areaMap[areaId].buyAwardBagWeek(uid,index,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
//购买每月礼包
// activityHandler.prototype.buyAwardBagMonth = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var index = msg.index
//   this.areaManager.areaMap[areaId].buyAwardBagMonth(uid,index,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
//领取首充礼包
activityHandler.prototype.gainFirstRechargeAward = function(msg, session, next) {
  var uid = session.uid
  var index = msg.index
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gainFirstRechargeAward(uid,index,function(flag,msg) {
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
// //激活等级基金
// activityHandler.prototype.activateLvFund = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].activateLvFund(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
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
// //激活专属月卡
// activityHandler.prototype.activateHighCard = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].activateHighCard(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
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
  this.areaManager.areaMap[areaId].getSprintRank(function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取已结算排行榜
activityHandler.prototype.getSprintSettleRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var rankType = msg.rankType
  this.areaManager.areaMap[areaId].getSprintSettleRank(rankType,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取总排行榜
activityHandler.prototype.getTotalRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var rankType = msg.rankType
  this.areaManager.areaMap[areaId].getTotalRank(rankType,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取排名第一排行榜
activityHandler.prototype.getfirstRankUserList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getfirstRankUserList(function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取宗族第一排行榜
activityHandler.prototype.getFirstGuildRank = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getFirstGuildRank(function(flag,msg) {
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
//领取功能开启活动奖励
activityHandler.prototype.gainSysOpenAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainSysOpenAward(uid,index,function(flag,msg) {
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