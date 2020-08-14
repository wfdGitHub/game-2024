var bearcat = require("bearcat")
//逐鹿之战
var zhuluHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
}
//获取逐鹿之战数据
zhuluHandler.prototype.getZhuluData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getZhuluData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//选择格子
zhuluHandler.prototype.chooseGrid = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var choose = msg.choose
  this.areaManager.areaMap[areaId].chooseGrid(uid,choose,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//获取逐鹿战斗数据
zhuluHandler.prototype.getZhuluFightData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getZhuluFightData(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//执行格子
zhuluHandler.prototype.executeGrid = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var arg = msg.arg
  this.areaManager.areaMap[areaId].executeGrid(uid,arg,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//放弃格子
zhuluHandler.prototype.giveupGrid = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].giveupGrid(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}

//设置出场阵容
zhuluHandler.prototype.setZhuluTeam = function(msg, session, next) {
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
  this.areaManager.areaMap[areaId].setZhuluTeam(uid,hIds,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//选择战利品
zhuluHandler.prototype.chooseSpoils = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  this.areaManager.areaMap[areaId].chooseSpoils(uid,index,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}
//开启宝箱
zhuluHandler.prototype.openZhuluBox = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].openZhuluBox(uid,function(flag,msg) {
    next(null,{flag : flag,msg : msg})
  })
}

module.exports = function(app) {
  return bearcat.getBean({
  	id : "zhuluHandler",
  	func : zhuluHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};