//法宝系统
var bearcat = require("bearcat")
var async = require("async")
var artifact_level = require("../../../../config/gameCfg/artifact_level.json")
var artifact_talent = require("../../../../config/gameCfg/artifact_talent.json")
var items = require("../../../../config/gameCfg/item.json")
var artifactHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//穿戴法宝
artifactHandler.prototype.wearArtifact = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  let oriId = session.get("oriId")
  let hId = msg.hId
  let aId = 0
  let self = this
  async.waterfall([
    function(cb) {
      self.heroDao.getHeroOne(oriId,uid,hId,function(flag,heroInfo) {
        if(!flag){
          cb("英雄不存在")
          return
        }
        if(heroInfo.star < 6){
          cb("英雄星级不够")
          return
        }
        if(!artifact_talent[heroInfo.id]){
          cb("该英雄没有法宝")
          return
        }
        aId = artifact_talent[heroInfo.id]["artifact"]
        if(heroInfo.artifact != undefined){
          cb("已穿戴法宝")
          return
        }
        cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      self.areaManager.areaMap[areaId].getBagItem(uid,aId,function(value) {
        if(value < 1)
          cb("没有该英雄专属法宝:"+aId)
        else
          cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      //扣除法宝
      self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : aId,value : -1})
      //穿戴法宝
      heroInfo["artifact"] = 0
      self.heroDao.setHeroInfo(oriId,uid,hId,"artifact",0)
      next(null,{flag : true,heroInfo : heroInfo})
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//法宝升级
artifactHandler.prototype.upgradeArtifact = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  let oriId = session.get("oriId")
  let hId = msg.hId
  let self = this
  async.waterfall([
    function(cb) {
      self.heroDao.getHeroOne(oriId,uid,hId,function(flag,heroInfo) {
        if(!flag){
          cb("英雄不存在")
          return
        }
        if(heroInfo.star < 6){
          cb("英雄星级不够")
          return
        }
        if(heroInfo.artifact === undefined){
          cb("未穿戴法宝")
          return
        }
        cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      //判断物品数量
      let aId = artifact_talent[heroInfo.id]["artifact"]
      let lv = heroInfo.artifact
      if(!artifact_level[lv] || !artifact_level[lv+1]){
          cb("已不能升级")
          return
      }
      let needNum = artifact_level[lv]["artifact_num"]
      let coin = artifact_level[lv]["coin"]
      self.areaManager.areaMap[areaId].getBagItemList(uid,[201,aId,1000150],function(list) {
        if(list[0] < coin || (list[1] + list[2]) < needNum){
          cb("资源不足")
          return
        }
        let str = "201:"+coin
        if(needNum){
          if(list[1] >= needNum)
            str += "&"+aId+":"+needNum
          else if(list[1])
            str += "&"+aId+":"+list[1]+"&1000150:"+(needNum-list[1])
          else
            str += "&1000150:"+needNum
        }
        self.areaManager.areaMap[areaId].consumeItems(uid,str,1,function(flag,err) {
          if(!flag){
            next(null,{flag : false,err : err})
            return
          }
          cb(null,heroInfo)
        })
      })
    },
    function(heroInfo,cb) {
      heroInfo["artifact"] += 1
      self.heroDao.incrbyHeroInfo(oriId,uid,hId,"artifact",1)
      self.areaManager.areaMap[areaId].taskUpdate(uid,"artifactLv",1,heroInfo["artifact"])
      next(null,{flag : true,heroInfo : heroInfo})
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//出售法宝
artifactHandler.prototype.sellArtifact = function(msg, session, next) {
  let uid = session.uid
  let areaId = session.get("areaId")
  let aId = Number(msg.aId)
  let count = Number(msg.count)
  if(!aId || !items[aId] || items[aId]["type"] != "art"){
    next(null,{flag : false,err : "aId error "+aId})
    return
  }
  if(!Number.isInteger(count) || count < 1){
    next(null,{flag : false,err : "count error "+count})
    return
  }
  let self = this
  self.areaManager.areaMap[areaId].consumeItems(uid,aId+":"+count,1,function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : 207,value : 400 * count},function(flag,data) {
      next(null,{flag : true,value : data})
    })
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "artifactHandler",
  	func : artifactHandler,
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