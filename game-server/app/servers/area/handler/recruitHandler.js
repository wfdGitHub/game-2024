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
  var oriId = session.get("oriId")
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
  self.heroDao.getHeroAmount(oriId,uid,function(flag,info) {
      if(info.cur + count > info.max){
        next(null,{flag : false,data : "武将背包已满"})
        return
      }
      self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,count,function(flag,err) {
        if(!flag){
          next(null,{flag : false,err : err})
          return
        }
        let paStr = recruit_base[type].pa
        if(paStr)
          self.areaManager.areaMap[areaId].addItemStr(uid,paStr,count)
        let heroInfos = self.heroDao.randHero(oriId,uid,type,count)
        switch(type){
          case "normal":
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit_normal",count)
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit",count)
          break
          case "great":
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit_great",count)
            self.areaManager.areaMap[areaId].taskUpdate(uid,"recruit",count)
          break
          case "camp_1":
          case "camp_2":
          case "camp_3":
          case "camp_4":
            self.areaManager.areaMap[areaId].taskUpdate(uid,"general",count)
          break
        }
        next(null,{flag : true,heroInfos : heroInfos})
      })
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