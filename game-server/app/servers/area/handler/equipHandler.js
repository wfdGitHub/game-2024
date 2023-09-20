var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var equip_level = require("../../../../config/gameCfg/equip_level.json")
var async = require("async")
var equipHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取数据
equipHandler.prototype.getEquipData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getEquipData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//穿戴装备
equipHandler.prototype.wearEquip = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var eId = msg.eId
  this.areaManager.areaMap[areaId].wearEquip(uid,hId,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//卸下装备
equipHandler.prototype.unWearEquip = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var slot = msg.slot
  this.areaManager.areaMap[areaId].unWearEquip(uid,hId,slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//装备打造
equipHandler.prototype.makeEquip = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var lv = msg.lv
  var slot = msg.slot
  var item = msg.item
  this.areaManager.areaMap[areaId].makeEquip(uid,lv,slot,item,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//装备洗练
equipHandler.prototype.washEquip = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  var item = msg.item
  this.areaManager.areaMap[areaId].washEquip(uid,eId,item,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//洗练保存
equipHandler.prototype.saveEquip = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].saveEquip(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//属性转化
equipHandler.prototype.washEquipExtra = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].washEquipExtra(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//属性保存
equipHandler.prototype.saveEquipExtra = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].saveEquipExtra(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//特效转化
equipHandler.prototype.washEquipSpe = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  var index = msg.index
  this.areaManager.areaMap[areaId].washEquipSpe(uid,eId,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//特效保存
equipHandler.prototype.saveEquipSpe = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].saveEquipSpe(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//套装转化
equipHandler.prototype.washEquipSuit = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].washEquipSuit(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//套装保存
equipHandler.prototype.saveEquipSuit = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].saveEquipSuit(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//装备强化
equipHandler.prototype.intensifyEquip = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = msg.eId
  this.areaManager.areaMap[areaId].intensifyEquip(uid,eId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//装备洗练
equipHandler.prototype.washEquipByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var item = msg.item
  this.areaManager.areaMap[areaId].washEquipByHero(uid,hId,msg.slot,item,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//洗练保存
equipHandler.prototype.saveEquipByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].saveEquipByHero(uid,hId,msg.slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//属性转化
equipHandler.prototype.washEquipExtraByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].washEquipExtraByHero(uid,hId,msg.slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//属性保存
equipHandler.prototype.saveEquipExtraByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].saveEquipExtraByHero(uid,hId,msg.slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//特效转化
equipHandler.prototype.washEquipSpeByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var index = msg.index
  this.areaManager.areaMap[areaId].washEquipSpeByHero(uid,hId,msg.slot,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//特效保存
equipHandler.prototype.saveEquipSpeByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].saveEquipSpeByHero(uid,hId,msg.slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//套装转化
equipHandler.prototype.washEquipSuitByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].washEquipSuitByHero(uid,hId,msg.slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//套装保存
equipHandler.prototype.saveEquipSuitByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].saveEquipSuitByHero(uid,hId,msg.slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//装备强化
equipHandler.prototype.intensifyEquipByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].intensifyEquipByHero(uid,hId,msg.slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//分解装备
equipHandler.prototype.recycleEquip = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  var eIds = msg.eIds
  this.areaManager.areaMap[areaId].recycleEquip(uid,eIds,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//装备宝石
equipHandler.prototype.gemWear = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gemWear(uid,msg.hId,msg.slot,msg.g_slot,msg.itemId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//升级宝石
equipHandler.prototype.gemUpByHero = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gemUpByHero(uid,msg.hId,msg.slot,msg.g_slot,msg.gems,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//拆卸宝石
equipHandler.prototype.gemUnWear = function(msg, session, next){
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].gemUnWear(uid,msg.hId,msg.slot,msg.g_slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "equipHandler",
  	func : equipHandler,
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