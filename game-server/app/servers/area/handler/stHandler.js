//寻宝
var bearcat = require("bearcat")
var stHandler = function(app) {
  	this.app = app;
	this.areaManager = this.app.get("areaManager")
};
// //获得寻宝数据
// stHandler.prototype.getSTData = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].getSTData(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //获取寻宝记录
// stHandler.prototype.getSTRecord = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].getSTRecord(function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //普通寻宝单次
// stHandler.prototype.normalSTSeek = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].normalSTSeek(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //普通寻宝十五次
// stHandler.prototype.normalSTMultiple = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].normalSTMultiple(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //免费刷新普通寻宝
// stHandler.prototype.normalSTFreeRefresh = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].normalSTFreeRefresh(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //付费刷新普通寻宝
// stHandler.prototype.normalSTBuyRefresh = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].normalSTBuyRefresh(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //领取普通寻宝幸运宝箱
// stHandler.prototype.gainSTNormalBox = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var boxId = msg.boxId
//   this.areaManager.areaMap[areaId].gainSTNormalBox(uid,boxId,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //高级寻宝单次
// stHandler.prototype.highSTSeek = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].highSTSeek(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //高级寻宝十五次
// stHandler.prototype.highSTMultiple = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].highSTMultiple(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //免费刷新高级寻宝
// stHandler.prototype.highSTFreeRefresh = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].highSTFreeRefresh(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //付费刷新高级寻宝
// stHandler.prototype.highSTBuyRefresh = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].highSTBuyRefresh(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //领取高级寻宝幸运宝箱
// stHandler.prototype.gainSTHighBox = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var boxId = msg.boxId
//   this.areaManager.areaMap[areaId].gainSTHighBox(uid,boxId,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //欧皇转盘
// stHandler.prototype.ohLotto = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var count = msg.count
//   if(!count || !Number.isInteger(count) || count <= 0 || count > 100){
//     next(null,{flag : false,msg : "count error"})
//     return
//   }
//   this.areaManager.areaMap[areaId].ohLotto(uid,count,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //兵法转盘
// stHandler.prototype.bfLotto = function(msg, session, next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var count = msg.count
//   if(!count || !Number.isInteger(count) || count <= 0 || count > 100){
//     next(null,{flag : false,msg : "count error"})
//     return
//   }
//   this.areaManager.areaMap[areaId].bfLotto(uid,count,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
module.exports = function(app) {
  return bearcat.getBean({
  	id : "stHandler",
  	func : stHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};