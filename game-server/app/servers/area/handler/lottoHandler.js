var bearcat = require("bearcat")
//抽奖系统
var lottoHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取抽奖数据
lottoHandler.prototype.getLottoData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getLottoData(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//转盘免费抽奖
lottoHandler.prototype.lottoByFree = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].lottoByFree(uid,type,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//转盘元宝抽奖
lottoHandler.prototype.lottoByGold = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  var count = msg.count
  this.areaManager.areaMap[areaId].lottoByGold(uid,type,count,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//转盘道具抽奖
lottoHandler.prototype.lottoByItem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  var count = msg.count
  this.areaManager.areaMap[areaId].lottoByItem(uid,type,count,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//获得转盘稀有道具记录
lottoHandler.prototype.getLottoRecord = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].getLottoRecord(type,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "lottoHandler",
  	func : lottoHandler,
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