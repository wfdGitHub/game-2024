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
  var paStr = recruit_base[type].pa
  var pcStr = recruit_base[type].pc
  self.heroDao.getHeroAmount(areaId,uid,function(flag,info) {
      if(info.cur + count > info.max){
        next(null,{flag : false,data : "武将背包已满"})
        return
      }
      self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,count,function(flag,err) {
        if(!flag){
          next(null,{flag : false,err : err})
          return
        }
        //招募英雄
        let weights = JSON.parse(recruit_base[type]["weights"])
        let allWeight = 0
        for(let i in weights){
          weights[i] += allWeight
          allWeight = Number(weights[i])
        }
        var heroInfos = []
        for(let num = 0;num < count;num++){
          let rand = Math.random() * allWeight
          for(let i in weights){
            if(rand < weights[i]){
              let heroList = JSON.parse(recruit_list[i].heroList)
              let heroId = heroList[Math.floor(heroList.length * Math.random())]
              let heroInfo = self.heroDao.gainHero(areaId,uid,{id : heroId})
              heroInfos.push(heroInfo)
              break
            }
          }
        }
        if(paStr)
          self.areaManager.areaMap[areaId].addItemStr(uid,paStr,count)
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