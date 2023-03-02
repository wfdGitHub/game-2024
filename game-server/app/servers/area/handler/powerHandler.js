var bearcat = require("bearcat")
var async = require("async")
var beauty_gift = require("../../../../config/gameCfg/beauty_gift.json")
var beauty_ad = require("../../../../config/gameCfg/beauty_ad.json")
var beauty_base = require("../../../../config/gameCfg/beauty_base.json")
var beauty_event = require("../../../../config/gameCfg/beauty_event.json")
var beauty_result = require("../../../../config/gameCfg/beauty_result.json")
var beauty_cfg = require("../../../../config/gameCfg/beauty_cfg.json")
var result_weight = {}
for(var i in beauty_result){
  result_weight[i] = [0]
  for(var j = 1; j <= 4;j++){
    result_weight[i][j] = result_weight[i][j-1] + beauty_result[i]["att_"+j]
  }
}
const actionTime = beauty_cfg["actionTime"]["value"]
const actionMax = beauty_cfg["actionMax"]["value"]
var powerHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//获取主动技能数据
powerHandler.prototype.getPowerData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getPowerData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升星
powerHandler.prototype.upPowerStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerStar(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升级
powerHandler.prototype.upPowerLv = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerLv(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能升阶
powerHandler.prototype.upPowerAd = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].upPowerAd(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置上阵技能
powerHandler.prototype.setPowerFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var list = msg.list
  this.areaManager.areaMap[areaId].setPowerFight(uid,list,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//主动技能重生
powerHandler.prototype.resetPower = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var powerId = msg.powerId
  this.areaManager.areaMap[areaId].resetPower(uid,powerId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置释放偏好
powerHandler.prototype.setManualModel = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var type = msg.type
  this.areaManager.areaMap[areaId].setManualModel(uid,type,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取红颜技能
powerHandler.prototype.getBeautyData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getBeautyData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//红颜技能升星
powerHandler.prototype.upBeautStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  this.areaManager.areaMap[areaId].upBeautStar(uid,beautId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//红颜技能升阶
powerHandler.prototype.upBeautAd = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  this.areaManager.areaMap[areaId].upBeautAd(uid,beautId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//红颜送礼
powerHandler.prototype.giveBeautGift = function(msg, session, next) {
  var self = this
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  var itemId = msg.itemId
  var count = msg.count
  if(!Number.isInteger(count) || count <= 0){
    next(null,{flag : false,err : "count error "+count})
    return
  }
  if(!beauty_base[beautId]){
    next(null,{flag : false,err : "红颜不存在"})
    return
  }
  if(!beauty_gift[itemId]){
    next(null,{flag : false,err : "礼物不存在"})
    return
  }
  var nature = beauty_base[beautId]["nature"]
  var value = beauty_gift[itemId]["nature_"+nature] * count
  self.areaManager.areaMap[areaId].consumeItems(uid,itemId+":"+count,1,"送礼"+beautId,function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.areaManager.areaMap[areaId].updateSprintRank("gift_rank",uid,value)
    self.areaManager.areaMap[areaId].incrbyBeautInfo(uid,beautId,"opinion",value)
    self.areaManager.areaMap[areaId].taskUpdate(uid,"beauty_opinion",value)
    var beautInfo = self.areaManager.areaMap[areaId].getBeautyInfo(uid,beautId)
    next(null,{flag : true,value : value,beautInfo:beautInfo})
  })
}
//红颜出游
powerHandler.prototype.beginBeautTour = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  var action = 0
  var self = this
  async.waterfall([
    function(cb) {
      self.redisDao.db.hmget("player:user:"+uid+":beaut",[beautId+"_star","action","event"],function(err,list) {
        var star =  Number(list[0]) || 0
        action = Number(list[1]) || 0
        var event = list[2]
        if(!star){
          cb("红颜未激活")
          return
        }
        cb()
      })
    },
    function(cb) {
      //消耗行动力
      var diff = Date.now() - action
      if(diff < actionTime){
        cb("行动值不足")
        return
      }
      if(diff > actionMax * actionTime)
        action = Date.now() - actionMax * actionTime
      action += actionTime
      self.redisDao.db.hset("player:user:"+uid+":beaut","action",action)
      cb()
    },
    function(cb) {
      var result = "att5_"+(Math.floor(Math.random() * 6) + 1)
      var rand = Math.floor(Math.random() * result_weight[result][4])
      var index = 1
      for(var i = 1;i <= 4;i++){
        if(rand < result_weight[result][i]){
          index = i
          break
        }
      }
      var beautInfo = self.areaManager.areaMap[areaId].getBeautyInfo(uid,beautId)
      var attName = "att"+index
      var attValue = Math.floor(Math.random() * (beauty_result[result]["att_max"] - beauty_result[result]["att_min"]) + beauty_result[result]["att_min"])
      if(beautInfo[attName] + attValue > beauty_ad[beautInfo.ad]["att"]){
        attValue = beauty_ad[beautInfo.ad]["att"] - beautInfo[attName]
        if(attValue < 0)
          attValue = 0
      }
      var opinion = Math.floor(Math.random() * (beauty_result[result]["opinion_max"] - beauty_result[result]["opinion_min"]) + beauty_result[result]["opinion_min"])
      var awardList = self.areaManager.areaMap[areaId].openChestAward(uid,beauty_result[result]["chest"])
      self.areaManager.areaMap[areaId].incrbyBeautInfo(uid,beautId,attName,attValue)
      self.areaManager.areaMap[areaId].incrbyBeautInfo(uid,beautId,"opinion",opinion)
      self.redisDao.db.hdel("player:user:"+uid+":beaut","event")
      var otherAward = self.areaManager.areaMap[areaId].openChestStrNoItem(beauty_result[result]["chest"])
      otherAward = otherAward.concat(self.areaManager.areaMap[areaId].openChestStrNoItem(beauty_result[result]["chest"]))
      next(null,{flag:true,attName:attName,attValue:attValue,opinion:opinion,beautInfo:beautInfo,awardList:awardList,otherAward:otherAward,action:action})
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//红颜出游结果
powerHandler.prototype.resultBeautTour = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var self = this
  var event = 0
  var result = msg.result
  var beautId = msg.beautId
  if(!result_weight[result]){
    next(null,{flag : false,err:"result error "+result})
    return
  }
  var beautInfo = self.areaManager.areaMap[areaId].getBeautyInfo(uid,beautId)
  if(!beautInfo){
    cb(false,"红颜未激活 ")
    return
  }
  async.waterfall([
    function(cb) {
      self.redisDao.db.hget("player:user:"+uid+":beaut","event",function(err,data) {
        event = data
        if(!event){
          cb("未处于出游状态")
          return
        }
        cb()
      })
    },

  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//红颜上阵
powerHandler.prototype.setBeautFight = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  this.areaManager.areaMap[areaId].setBeautFight(uid,beautId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//增加行动力
powerHandler.prototype.addTourAction = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var self = this
  self.areaManager.areaMap[areaId].consumeItems(uid,beauty_cfg["actionItem"]["value"]+":1",1,"出游体力",function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.redisDao.db.hincrby("player:user:"+uid+":beaut","action",-actionTime * 5,function(err,data) {
       next(null,{flag : true,action : data})
    })
  })
}
//增加属性值
powerHandler.prototype.addBeautyAtt = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var beautId = msg.beautId
  var att = msg.att
  var count = msg.count
  if(!beauty_cfg["attItem"+att]){
    next(null,{flag : false,err : "att error "+att})
    return
  }
  if(!Number.isInteger(count) || count < 1){
    next(null,{flag : false,err : "count error "+count})
    return
  }
  var self = this
  var beautInfo = self.areaManager.areaMap[areaId].getBeautyInfo(uid,beautId)
  var attName = "att"+att
  if(beautInfo[attName] + count > beauty_ad[beautInfo.ad]["att"]){
    next(null,{flag : false,err : "超出属性上限"+(beautInfo[attName] + count)+"/"+beauty_ad[beautInfo.ad]["att"]})
    return
  }
  self.areaManager.areaMap[areaId].consumeItems(uid,beauty_cfg["attItem"+att]["value"]+":"+count,1,"出游体力",function(flag,err) {
    if(!flag){
      next(null,{flag : false,err : err})
      return
    }
    self.areaManager.areaMap[areaId].incrbyBeautInfo(uid,beautId,attName,count)
    beautInfo = self.areaManager.areaMap[areaId].getBeautyInfo(uid,beautId)
    next(null,{flag : true,beautInfo : beautInfo})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "powerHandler",
  	func : powerHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "redisDao",
      ref : "redisDao"
    }]
  })
};