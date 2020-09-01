var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var recruit_base = require("../../../../config/gameCfg/recruit_base.json")
var recruit_list = require("../../../../config/gameCfg/recruit_list.json")
var recruitHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//招募英雄
recruitHandler.prototype.recruitHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  var count = msg.count
  if(!recruit_base[type]){
    next(null,{flag:false,err:"类型错误"+type})
    return
  }
  if(!Number.isInteger(count)){
    next(null,{flag:false,err:"count必须是整数"+count})
    return
  }
  var self = this
  var pcStr = recruit_base[type].pc
  if(!pcStr){
    next(null,{flag:false,err:"pcStr error"+pcStr})
    return
  }
  self.heroDao.getHeroAmount(uid,function(flag,info) {
      if(info.cur + count > info.max){
        next(null,{flag : false,data : "武将背包已满"})
        return
      }
      self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,count,function(flag,err) {
        if(!flag){
          next(null,{flag : false,err : err})
          return
        }
        var paStr = recruit_base[type].pa
        if(paStr)
          self.areaManager.areaMap[areaId].addItemStr(uid,paStr,count)
        var heroInfos
        switch(type){
          case "normal":
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit_normal",count)
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit",count)
            heroInfos = self.heroDao.randHero(areaId,uid,type,count)
          break
          case "great":
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit_great",count)
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit",count)
            heroInfos = self.heroDao.randHeroLuck(areaId,uid,type,count)
          break
          case "camp_1":
          case "camp_2":
          case "camp_3":
          case "camp_4":
            heroInfos = self.heroDao.randHero(areaId,uid,type,count)
            self.areaManager.areaMap[areaId].taskUpdate(uid,"general",count)
          break
        }
        var typeName = recruit_base[type]["name"]
        var name = session.get("name")
        for(var i = 0;i < heroInfos.length;i++){
          if(heroInfos[i].star >= 5){
            var notify = {
              type : "sysChat",
              text : "恭喜玩家"+name+"在"+typeName+"中获得五星英雄"+heros[heroInfos[i]["id"]]["name"]+"【我也要招募】"
            }
            self.areaManager.areaMap[areaId].sendAllUser(notify)
          }
        }
        next(null,{flag : true,heroInfos : heroInfos})
      })
  })
}
//获取主题招募数据
recruitHandler.prototype.getTopicRecruitData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getTopicRecruitData(uid,function(flag,data) {
    next(null,{flag : true,data : data})
  })
}
//主题招募一次
recruitHandler.prototype.topicRecruitOnce = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var self = this
  self.heroDao.getHeroAmount(uid,function(flag,info) {
      if(info.cur + 1 > info.max){
        next(null,{flag : false,data : "武将背包已满"})
        return
      }
      self.areaManager.areaMap[areaId].topicRecruitOnce(uid,function(flag,heroInfos) {
        next(null,{flag : true,heroInfos : heroInfos})
      })
  })
}
//主题招募十次
recruitHandler.prototype.topicRecruitMultiple = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var self = this
  self.heroDao.getHeroAmount(uid,function(flag,info) {
      if(info.cur + 10 > info.max){
        next(null,{flag : false,data : "武将背包已满"})
        return
      }
      self.areaManager.areaMap[areaId].topicRecruitMultiple(uid,function(flag,heroInfos) {
        next(null,{flag : true,heroInfos : heroInfos})
      })
  })
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