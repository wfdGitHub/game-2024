var bearcat = require("bearcat")
var async = require("async")
var normalHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//激活礼包码
normalHandler.prototype.verifyCDKey = function(msg, session, next) {
  var self = this
  var uid = session.uid
  var areaId = session.get("areaId")
  var name = session.get("name")
  var key = msg.key
  if(typeof(key) != "string"){
    next(null,{"err":"参数错误"})
    return
  }
  self.CDKeyDao.verifyCDKey(key,uid,areaId,name,function(flag,str) {
    if(!flag){
      next(null,{flag:false,data:str})
    }else{
      var awardList = self.areaManager.areaMap[areaId].addItemStr(uid,str)
      next(null,{flag : true,awardList : awardList})
    }
  })
}
//获取背包
normalHandler.prototype.getBagList = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getBagList(uid,function(data) {
    next(null,{flag : true,data : data || {}})
  })
}
//使用物品
normalHandler.prototype.useItem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].useItem(uid,msg,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取playerData
normalHandler.prototype.getPlayerData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getPlayerDataAll(uid,function(data) {
    next(null,{flag : true,data : data})
  })
}
//在线领取挂机奖励
normalHandler.prototype.getOnhookAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getOnhookAward(uid,1,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//快速挂机奖励
normalHandler.prototype.getQuickOnhookAward = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getQuickOnhookAward(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//角色进阶
normalHandler.prototype.characterAdvanced = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  this.areaManager.areaMap[areaId].characterAdvanced(uid,characterId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//角色转生
normalHandler.prototype.characterSamsara = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var characterId = msg.characterId
  this.areaManager.areaMap[areaId].characterSamsara(uid,characterId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置头像
normalHandler.prototype.changeHead = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].changeHead(uid,msg.id,function(flag,data) {
    if(flag){
        session.set("head",msg.id)
        session.push("head",function() {
          next(null,{flag : true,data : data})
        })
      }else{
        next(null,{flag : false,data : data})
      }
  })
}
//增加物品  测试功能
normalHandler.prototype.addItem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var limit = session.get("limit")
  var itemId = msg.itemId
  var value = msg.value
  if(limit >= 10){
    this.areaManager.areaMap[areaId].addItem({uid : uid,itemId : itemId,value : value},function(flag,data) {
      next(null,{flag : flag,data : data})
    })
  }else{
    next(null,{flag : false})
  }
}
//增加物品str  测试功能
normalHandler.prototype.addItemStr = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var str = msg.str
  var rate = msg.rate
  var awardList = this.areaManager.areaMap[areaId].addItemStr(uid,str,rate)
  next(null,{flag : true,awardList : awardList})
  // next(null,{flag : false})
}
//开启宝箱  测试功能
normalHandler.prototype.openChestStr = function(msg, session, next) {
  // var uid = session.uid
  // var areaId = session.get("areaId")
  // var str = msg.str
  // var str = this.areaManager.areaMap[areaId].openChestStr(uid,str)
  // next(null,{flag : true,str : str})
  next(null,{flag : false})
}
//获取商城数据
normalHandler.prototype.getShopData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getShopData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//购买商城物品
normalHandler.prototype.buyShop = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var shopId = msg.shopId
  var count = msg.count
  this.areaManager.areaMap[areaId].buyShop(uid,shopId,count,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//直接购买物品
normalHandler.prototype.buyItem = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var itemId = msg.itemId
  var count = msg.count
  this.areaManager.areaMap[areaId].buyItem(uid,itemId,count,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//连入跨服服务器
normalHandler.prototype.loginCross = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var crossUid = areaId+"|"+uid+"|"+this.app.serverId
  this.areaManager.areaMap[areaId].loginCross(uid,crossUid,function(flag,data) {
    if(flag){
      session.set("crossUid",crossUid)
      session.push("crossUid",function() {
        next(null,{flag : flag,data : data})
      })
    }
  })
}
//同步指引进度
normalHandler.prototype.syncGuide = function(msg, session, next) {
  var uid = session.uid
  var guideInfo = msg.guideInfo
  this.playerDao.setPlayerInfo({uid : uid,key : "guideInfo",value : guideInfo})
  next()
}
//玩家改名
normalHandler.prototype.changeName = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var oriId = session.get("oriId")
  var name = msg.name
  var self = this
  async.waterfall([
    function(cb) {
      self.redisDao.db.hexists("area:area"+oriId+":nameMap",name,function(err,data) {
        if(data){
          cb("名称已存在")
        }else{
          cb()
        }
      })
    },
    function(cb) {
      self.areaManager.areaMap[areaId].consumeItems(uid,"1000500:1",1,function(flag,err) {
        if(flag){
          cb()
        }else{
          self.areaManager.areaMap[areaId].consumeItems(uid,"202:500",1,function(flag,err) {
            if(flag){
              cb()
            }else{
              cb("元宝不足")
            }
          })
        }
      })
    },
    function() {
      self.redisDao.db.hget("player:user:"+uid+":playerInfo","name",function(err,data) {
        self.redisDao.db.hdel("area:area"+oriId+":nameMap",data)
        self.redisDao.db.hset("area:area"+oriId+":nameMap",name,uid)
        self.playerDao.setPlayerInfo({uid : uid,key : "name",value : name})
        session.set("name",name)
        session.push("name",function() {
          next(null,{flag:true})
        })
      })
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "normalHandler",
  	func : normalHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "playerDao",
      ref : "playerDao"
    },{
      name : "redisDao",
      ref : "redisDao"
    },{
      name : "CDKeyDao",
      ref : "CDKeyDao"
    }]
  })
};