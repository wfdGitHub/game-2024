// var bearcat = require("bearcat")
// var async = require("async")
// var stone_base = require("../../../../config/gameCfg/stone_base.json")
// var stone_skill = require("../../../../config/gameCfg/stone_skill.json")
// var stone_cfg = require("../../../../config/gameCfg/stone_cfg.json")
// var stoneHandler = function(app) {
//   this.app = app;
// 	this.areaManager = this.app.get("areaManager")
// };
// //穿戴宝石
// stoneHandler.prototype.wearStone = function(msg,session,next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var itemId = Number(msg.itemId)
//   var hId = msg.hId
//   var pos = msg.pos
//   if(!stone_cfg["pos_"+pos]){
//     next(null,{flag:false,err:"pos error "+pos})
//     return
//   }
//   this.areaManager.areaMap[areaId].wearStone(uid,hId,itemId,pos,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //卸下宝石
// stoneHandler.prototype.unwearStone = function(msg,session,next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var hId = msg.hId
//   var pos = msg.pos
//   if(!stone_cfg["pos_"+pos]){
//     next(null,{flag:false,err:"pos error "+pos})
//     return
//   }
//   this.areaManager.areaMap[areaId].unwearStone(uid,hId,pos,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //升级宝石
// stoneHandler.prototype.upStone = function(msg,session,next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var items = msg.items
//   var hId = msg.hId
//   var pos = msg.pos
//   if(!stone_cfg["pos_"+pos]){
//     next(null,{flag:false,err:"pos error "+pos})
//     return
//   }
//   this.areaManager.areaMap[areaId].upStone(uid,hId,pos,items,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //获取矿坑数据
// stoneHandler.prototype.getPitData = function(msg,session,next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   this.areaManager.areaMap[areaId].getPitData(uid,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //挖矿
// stoneHandler.prototype.usePickaxe = function(msg,session,next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var pos = msg.pos
//   var pId = msg.pId
//   this.areaManager.areaMap[areaId].usePickaxe(uid,pos,pId,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //加速
// stoneHandler.prototype.speedPit = function(msg,session,next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var pos = msg.pos
//   this.areaManager.areaMap[areaId].speedPit(uid,pos,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// //获取挖矿收益
// stoneHandler.prototype.gainPitAward = function(msg,session,next) {
//   var uid = session.uid
//   var areaId = session.get("areaId")
//   var pos = msg.pos
//   this.areaManager.areaMap[areaId].gainPitAward(uid,pos,function(flag,msg) {
//     next(null,{flag : flag,msg : msg})
//   })
// }
// module.exports = function(app) {
//   return bearcat.getBean({
//   	id : "stoneHandler",
//   	func : stoneHandler,
//   	args : [{
//   		name : "app",
//   		value : app
//   	}],
//     props : [{
//       name : "heroDao",
//       ref : "heroDao"
//     }]
//   })
// };