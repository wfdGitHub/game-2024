var bearcat = require("bearcat")

var adminArea = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//发放物品
adminArea.prototype.sendItem = function(msg, session, next) {
  var limit = session.get("limit")
  if(!limit || limit < 10){
    next(null,{flag : false})
    return
  }
  var itemId = msg.itemId
  var value = msg.value
  var target = msg.target
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].addItem({uid : target,itemId : itemId,value : value,reason : "管理员发放"},function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//改变英雄星级
adminArea.prototype.changeStar = function(msg, session, next) {
  var limit = session.get("limit")
  if(!limit || limit < 10){
    next(null,{flag : false})
    return
  }
  var areaId = session.get("areaId")
  var hId = msg.hId
  var value = Number(msg.value) || 0
  var uid = msg.uid || session.uid
  this.heroDao.incrbyHeroInfo(areaId,uid,hId,"star",value,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//改变英雄阶级
adminArea.prototype.changeAdvance = function(msg, session, next) {
  var limit = session.get("limit")
  if(!limit || limit < 10){
    next(null,{flag : false})
    return
  }
  var areaId = session.get("areaId")
  var hId = msg.hId
  var value = Number(msg.value) || 0
  var uid = msg.uid || session.uid
  this.heroDao.incrbyHeroInfo(areaId,uid,hId,"ad",value,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//改变英雄等级
adminArea.prototype.changeLevel = function(msg, session, next) {
  var limit = session.get("limit")
  if(!limit || limit < 10){
    next(null,{flag : false})
    return
  }
  var areaId = session.get("areaId")
  var hId = msg.hId
  var value = Number(msg.value) || 0
  var uid = msg.uid || session.uid
  this.heroDao.incrbyHeroInfo(areaId,uid,hId,"lv",value,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "adminArea",
  	func : adminArea,
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