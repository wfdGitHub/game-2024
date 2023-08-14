var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var recruit_base = require("../../../../config/gameCfg/recruit_base.json")
var recruit_list = require("../../../../config/gameCfg/recruit_list.json")
var recruitHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取召唤数据
recruitHandler.prototype.getSummonData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getSummonData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}

recruitHandler.prototype.summonHeroNormal = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var sId = msg.sId
  var count = msg.count
  this.areaManager.areaMap[areaId].summonHeroNormal(uid,sId,count,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
recruitHandler.prototype.summonHeroHand = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var sId = msg.sId
  var heroId = msg.heroId
  this.areaManager.areaMap[areaId].summonHeroHand(uid,sId,heroId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
recruitHandler.prototype.setWishHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var sId = msg.sId
  var wishHeros = msg.wishHeros
  this.areaManager.areaMap[areaId].setWishHero(uid,sId,wishHeros,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
// //获取主题招募数据1
// recruitHandler.prototype.getTopicRecruitData = function(msg, session, next) {
//   next(null,{flag : false,data : "已弃用"})
// }
// //道具招募
// recruitHandler.prototype.recruitHeroByItem = function(msg, session, next) {
//   next(null,{flag : false,data : "已弃用"})
// }
// //元宝招募
// recruitHandler.prototype.recruitHeroByGold = function(msg, session, next) {
//   next(null,{flag : false,data : "已弃用"})
// }
// //主题招募一次
// recruitHandler.prototype.topicRecruitOnce = function(msg, session, next) {
//   next(null,{flag:false,err:"接口已弃用"})
// }
// //主题招募十次
// recruitHandler.prototype.topicRecruitMultiple = function(msg, session, next) {
//   next(null,{flag:false,err:"接口已弃用"})
// }
// //领取主题招募奖励
// recruitHandler.prototype.gainTopicRecruitBoxAward = function(msg, session, next) {
//   next(null,{flag : false,data : "已弃用"})
// }
// //获取主题招募英雄任务
// recruitHandler.prototype.gainTopicRecruitHeroTask = function(msg, session, next) {
//   next(null,{flag : false,data : "已弃用"})
// }
// //完成主题招募英雄任务
// recruitHandler.prototype.finishTopicRecruitHeroTask = function(msg, session, next) {
//   next(null,{flag : false,data : "已弃用"})
// }
// //提取无限十连英雄
// recruitHandler.prototype.extractInfiniteRecruit = function(msg, session, next) {
//   next(null,{flag : false,data : "已弃用"})
// }
module.exports = function(app) {
  return bearcat.getBean({
  	id : "recruitHandler",
  	func : recruitHandler,
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