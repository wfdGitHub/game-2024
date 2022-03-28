var bearcat = require("bearcat")
var hufuHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//护符列表
hufuHandler.prototype.getHufuList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getHufuList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机护符
hufuHandler.prototype.gainRandHufu = function(msg, session, next) {
  // var areaId = session.get("areaId")
  // var uid = session.uid
  // var lv = msg.lv
  // var data = this.areaManager.areaMap[areaId].gainRandHufu(uid,lv)
  // next(null,{flag:true,data:data})
  next(null,{flag:false})
}
//生成指定护符  lv s1 s2
hufuHandler.prototype.gainHufu = function(msg, session, next) {
  // var areaId = session.get("areaId")
  // var uid = session.uid
  // var info = msg.info
  // var data = this.areaManager.areaMap[areaId].gainHufu(uid,info)
  // next(null,{flag:true,data:data})
  next(null,{flag:false})
}
//穿戴护符
hufuHandler.prototype.wearHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearHufu(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下护符
hufuHandler.prototype.unwearHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearHufu(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成护符
hufuHandler.prototype.compoundHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundHufu(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练护符
hufuHandler.prototype.resetHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].resetHufu(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练石洗练
hufuHandler.prototype.washHufu = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washHufu(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售护符
hufuHandler.prototype.sellHufu = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var self = this
  self.areaManager.areaMap[areaId].sellHufu(uid,id,function(flag,data) {
    if(!flag){
      next(null,{flag : flag,err : data})
    }else{
      next(null,{flag : flag,awardList : data})
    }
  })
}

//战马列表
hufuHandler.prototype.getHorseList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getHorseList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机战马
hufuHandler.prototype.gainRandHorse = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandHorse(uid,lv)
  next(null,{flag:true,data:data})
}
//穿戴战马
hufuHandler.prototype.wearHorse = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearHorse(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下战马
hufuHandler.prototype.unwearHorse = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearHorse(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成战马
hufuHandler.prototype.compoundHorse = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundHorse(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练战马
hufuHandler.prototype.resetHorse = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].resetHorse(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练石洗练
hufuHandler.prototype.washHorse = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washHorse(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售战马
hufuHandler.prototype.sellHorse = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var self = this
  self.areaManager.areaMap[areaId].sellHorse(uid,id,function(flag,data) {
    if(!flag){
      next(null,{flag : flag,err : data})
    }else{
      next(null,{flag : flag,awardList : data})
    }
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "hufuHandler",
  	func : hufuHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};