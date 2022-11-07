var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var recruit_base = require("../../../../config/gameCfg/recruit_base.json")
var recruit_list = require("../../../../config/gameCfg/recruit_list.json")
var recruitHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取主题招募数据
recruitHandler.prototype.getTopicRecruitData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getTopicRecruitData(uid,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//道具招募
recruitHandler.prototype.recruitHeroByItem = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var type = msg.type
  var count = msg.count
  this.areaManager.areaMap[areaId].recruitHeroByItem(uid,type,count,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//元宝招募
recruitHandler.prototype.recruitHeroByGold = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var type = msg.type
  var count = msg.count
  this.areaManager.areaMap[areaId].recruitHeroByGold(uid,type,count,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主题招募一次
recruitHandler.prototype.topicRecruitOnce = function(msg, session, next) {
  // var uid = session.uid
  // var areaId = session.get("areaId")
  // var self = this
  // self.heroDao.getHeroAmount(uid,function(flag,info) {
  //     if(info.cur + 1 > info.max){
  //       next(null,{flag : false,data : "武将背包已满"})
  //       return
  //     }
  //     self.areaManager.areaMap[areaId].topicRecruitOnce(uid,function(flag,heroInfos) {
  //       next(null,{flag : true,heroInfos : heroInfos})
  //     })
  // })
  next(null,{flag:false,err:"接口已弃用"})
}
//主题招募十次
recruitHandler.prototype.topicRecruitMultiple = function(msg, session, next) {
  // var uid = session.uid
  // var areaId = session.get("areaId")
  // var self = this
  // self.heroDao.getHeroAmount(uid,function(flag,info) {
  //     if(info.cur + 10 > info.max){
  //       next(null,{flag : false,data : "武将背包已满"})
  //       return
  //     }
  //     self.areaManager.areaMap[areaId].topicRecruitMultiple(uid,function(flag,heroInfos) {
  //       next(null,{flag : true,heroInfos : heroInfos})
  //     })
  // })
  next(null,{flag:false,err:"接口已弃用"})
}
//领取主题招募奖励
recruitHandler.prototype.gainTopicRecruitBoxAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].gainTopicRecruitBoxAward(uid,index,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//获取主题招募英雄任务
recruitHandler.prototype.gainTopicRecruitHeroTask = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var heroId = msg.heroId
  this.areaManager.areaMap[areaId].gainTopicRecruitHeroTask(uid,heroId,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//完成主题招募英雄任务
recruitHandler.prototype.finishTopicRecruitHeroTask = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var heroId = msg.heroId
  var star = msg.star
  this.areaManager.areaMap[areaId].finishTopicRecruitHeroTask(uid,heroId,star,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//提取无限十连英雄
recruitHandler.prototype.extractInfiniteRecruit = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var heroList = msg.heroList
  this.areaManager.areaMap[areaId].extractInfiniteRecruit(uid,heroList,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
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