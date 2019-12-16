var bearcat = require("bearcat")

var heroHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//增加英雄背包栏
heroHandler.prototype.addHeroAmount = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.addHeroAmount(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取英雄背包栏数量
heroHandler.prototype.getHeroAmount = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.getHeroAmount(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获得英雄
heroHandler.prototype.gainHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var ad = msg.ad
  var lv = msg.lv
  this.heroDao.gainHero(areaId,uid,{id : id,ad : ad,lv : lv},function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//删除英雄
heroHandler.prototype.removeHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.heroDao.removeHero(areaId,uid,hId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//修改英雄属性
heroHandler.prototype.incrbyHeroInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var name = msg.name
  var value = msg.value
  this.heroDao.incrbyHeroInfo(areaId,uid,hId,name,value,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取英雄列表
heroHandler.prototype.getHeros = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.getHeros(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取英雄图鉴
heroHandler.prototype.getHeroArchive = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.getHeroArchive(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置出场阵容
heroHandler.prototype.setFightTeam = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hIds = msg.hIds
  //参数判断
  if(!hIds instanceof Array){
    next(null,{flag : false,data : "必须传数组"})
    return
  }
  if(hIds.length != 6){
    next(null,{flag : false,data : "数组长度错误"})
    return
  }
  var heroNum = 0
  //判断重复
  for(var i = 0;i < hIds.length;i++){
    if(hIds[i] == null)
      continue
    heroNum++
    for(var j = i + 1;j < hIds.length;j++){
      if(hIds[j] == null)
        continue
      if(hIds[i] == hIds[j]){
        next(null,{flag : false,data : "不能有重复的hId"})
        return
      }
    }
  }
  if(heroNum == 0){
    next(null,{flag : false,data : "至少要有一个上阵英雄"})
    return
  }
  this.heroDao.setFightTeam(areaId,uid,hIds,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取出场阵容
heroHandler.prototype.getFightTeam = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.getFightTeam(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "heroHandler",
  	func : heroHandler,
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