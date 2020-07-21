var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var equip_base = require("../../../../config/gameCfg/equip_base.json")
var equip_level = require("../../../../config/gameCfg/equip_level.json")
var async = require("async")
var equipHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//穿戴装备
equipHandler.prototype.wearEquip = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  let oriId = session.get("oriId")
  let eId = Number(msg.eId)
  let hId = msg.hId
  if(!eId || !equip_base[eId]){
    next(null,{flag : false,err : "eId error "+eId})
    return
  }
  let part = equip_base[eId]["part"]
  let self = this
  async.waterfall([
    function(cb) {
      self.areaManager.areaMap[areaId].getBagItem(uid,eId,function(value) {
        if(value < 1)
          cb("没有这件装备")
        else
          cb()
      })
    },
    function(cb) {
      self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
        if(!flag){
          cb("英雄不存在")
          return
        }
        cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      //卸下原装备
      if(heroInfo["equip_"+part]){
        var oldeId = equip_level[heroInfo["equip_"+part]]["part_"+part]
        self.areaManager.areaMap[areaId].changeItem({uid : uid,itemId : oldeId,value : 1})
      }
      //扣除装备
      self.areaManager.areaMap[areaId].changeItem({uid : uid,itemId : eId,value : -1})
      //穿戴装备
      var lv = equip_base[eId]["lv"]
      heroInfo["equip_"+part] = lv
      self.heroDao.setHeroInfo(oriId,uid,hId,"equip_"+part,lv)
      self.areaManager.areaMap[areaId].taskUpdate(uid,"wear_equip",1,lv)
      next(null,{flag : true,heroInfo : heroInfo})
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//卸下装备
equipHandler.prototype.unwearEquip = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  let oriId = session.get("oriId")
  let hId = msg.hId
  let part = msg.part
  let self = this
  async.waterfall([
    function(cb) {
      self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
        if(!flag){
          cb("英雄不存在")
          return
        }
        cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      //卸下原装备
      if(heroInfo["equip_"+part]){
        var oldeId = equip_level[heroInfo["equip_"+part]]["part_"+part]
        self.areaManager.areaMap[areaId].changeItem({uid : uid,itemId : oldeId,value : 1})
        self.heroDao.delHeroInfo(areaId,uid,hId,"equip_"+part)
        delete heroInfo["equip_"+part]
        next(null,{flag : true,heroInfo : heroInfo,eId : heroInfo["equip_"+part]})
      }else{
        cb("该部位没有装备")
      }
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//出售装备
equipHandler.prototype.sellEquip = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = Number(msg.eId)
  var count = Number(msg.count)
  if(!eId || !equip_base[eId]){
    next(null,{flag : false,err : "eId error "+eId})
    return
  }
  if(!Number.isInteger(count) || count < 1){
    next(null,{flag : false,err : "count error "+count})
    return
  }
  var self = this
  self.areaManager.areaMap[areaId].consumeItems(uid,eId+":"+count,1,function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : 201,value : equip_base[eId]["sell_prize"] * count},function(flag,data) {
      next(null,{flag : true,value : data})
    })
  })
}
//合成装备
equipHandler.prototype.compoundEquip = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var eId = Number(msg.eId)
  var count = Number(msg.count)
  if(!eId || !equip_base[eId]){
    next(null,{flag : false,err : "eId error "+eId})
    return
  }
  if(!Number.isInteger(count) || count < 1){
    next(null,{flag : false,err : "count error "+count})
    return
  }
  var self = this
  var pc = "201:"+count*equip_base[eId]["compound_pc"]+"&"+eId+":"+count*3
  self.areaManager.areaMap[areaId].consumeItems(uid,pc,1,function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.areaManager.areaMap[areaId].taskUpdate(uid,"equip_compound",count)
    self.areaManager.areaMap[areaId].changeItem({uid : uid,itemId : equip_base[eId]["next"],value : count},function(flag,data) {
      next(null,{flag : true,eId : equip_base[eId]["next"],value : data})
    })
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