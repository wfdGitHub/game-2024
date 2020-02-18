var bearcat = require("bearcat")
var async = require("async")
var ace_pack = require("../../../../config/gameCfg/ace_pack.json")
var ace_pack_base = require("../../../../config/gameCfg/ace_pack_base.json")
var limits = {}
for(var i in ace_pack){
  if(ace_pack[i].limits){
    limits[i] = {}
    let tmpLimits = JSON.parse(ace_pack[i].limits)
    for(var j = 0;j < tmpLimits.length;j++)
      limits[i][tmpLimits[j]] = true
  }else{
    limits[i] = false
  }
}
console.log(limits)
var acepackHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//穿戴锦囊
acepackHandler.prototype.wearAcepack = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var aId = Number(msg.aId)
  var hId = msg.hId
  var pos = msg.pos
  if(!aId || !ace_pack[aId]){
    next(null,{flag : false,err : "aId error "+aId})
    return
  }
  if(!pos || !ace_pack_base["pos_"+pos]){
    next(null,{flag : false,err : "pos error "+pos})
    return
  }
  var self = this
  async.waterfall([
    function(cb) {
      self.areaManager.areaMap[areaId].getBagItem(uid,aId,function(value) {
        if(value < 1)
          cb("没有这件锦囊")
        else
          cb()
      })
    },
    function(cb) {
      self.areaManager.areaMap[areaId].getLordLv(uid,function(lordLv) {
        if(lordLv < ace_pack_base["pos_"+pos]["role_lv"])
          cb("主公等级不够，未开放该锦囊格")
        else
          cb()
      })
    },
    function(cb) {
      self.heroDao.getHeroOne(areaId,uid,hId,function(flag,heroInfo) {
        if(!flag){
          cb("英雄不存在")
          return
        }
        if(heroInfo.star < 6){
          cb("英雄星级不够")
          return
        }
        if(limits[aId] && !limits[aId][heroInfo.id]){
          cb("该英雄不能装备这件锦囊")
          return
        }
        cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      //卸下原锦囊
      if(heroInfo["acepack_"+pos]){
        self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : heroInfo["acepack_"+pos],value : 1})
      }
      //扣除锦囊
      self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : aId,value : -1})
      //穿戴锦囊
      heroInfo["acepack_"+pos] = aId
      self.heroDao.setHeroInfo(areaId,uid,hId,"acepack_"+pos,aId)
      next(null,{flag : true,heroInfo : heroInfo})
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//卸下锦囊
acepackHandler.prototype.unwearAcepack = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var pos = msg.pos
  var self = this
  async.waterfall([
    function(cb) {
      self.heroDao.getHeroOne(areaId,uid,hId,function(flag,heroInfo) {
        if(!flag){
          cb("英雄不存在")
          return
        }
        cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      //卸下原装备
      if(heroInfo["acepack_"+pos]){
        var aId = heroInfo["acepack_"+pos]
        self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : aId,value : 1})
        self.heroDao.delHeroInfo(areaId,uid,hId,"acepack_"+pos)
        delete heroInfo["acepack_"+pos]
        next(null,{flag : true,heroInfo : heroInfo,aId : aId})
      }else{
        cb("该位置没有锦囊")
      }
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//出售锦囊
acepackHandler.prototype.sellAcepack = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var aId = Number(msg.aId)
  var count = Number(msg.count)
  if(!aId || !ace_pack[aId]){
    next(null,{flag : false,err : "aId error "+aId})
    return
  }
  if(!Number.isInteger(count) || count < 1){
    next(null,{flag : false,err : "count error "+count})
    return
  }
  var self = this
  self.areaManager.areaMap[areaId].consumeItems(uid,aId+":"+count,1,function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : 206,value : ace_pack[aId]["strategy"] * count},function(flag,data) {
      next(null,{flag : true,value : data})
    })
  })
}
//合成锦囊
acepackHandler.prototype.compoundAcepack = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var aId = Number(msg.aId)
  if(!aId || !ace_pack[aId] || ace_pack[aId]["quality"] != 4){
    next(null,{flag : false,err : "aId error "+aId})
    return
  }
  var needList = {}
  var pc = "201:1000000"
  var num = 0
  for(var i in msg.list){
    if(!ace_pack[i] || ace_pack[i]["quality"] != 3 || !Number.isInteger(msg.list[i]) || msg.list[i] < 1){
      next(null,{flag : false,err : "list error "+msg.list})
      return
    }
    pc += "&"+i+":"+msg.list[i]
    num += msg.list[i]
  }
  if(num !== 3){
      next(null,{flag : false,err : "list num error "+num})
      return
  }
  var self = this
  self.areaManager.areaMap[areaId].consumeItems(uid,pc,1,function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.areaManager.areaMap[areaId].addItem({uid : uid,itemId : aId,value : 1},function(flag,data) {
      next(null,{flag : true,aId : aId,value : 1})
    })
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "acepackHandler",
  	func : acepackHandler,
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