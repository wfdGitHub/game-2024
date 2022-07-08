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
  var ids = msg.ids
  var self = this
  self.areaManager.areaMap[areaId].sellHufu(uid,ids,function(flag,data) {
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
  var ids = msg.ids
  var self = this
  self.areaManager.areaMap[areaId].sellHorse(uid,ids,function(flag,data) {
    if(!flag){
      next(null,{flag : flag,err : data})
    }else{
      next(null,{flag : flag,awardList : data})
    }
  })
}
//战鼓列表
hufuHandler.prototype.getDrumList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getDrumList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机战鼓
hufuHandler.prototype.gainRandDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandDrum(uid,lv)
  next(null,{flag:true,data:data})
}
//穿戴战鼓
hufuHandler.prototype.wearDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearDrum(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下战鼓
hufuHandler.prototype.unwearDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearDrum(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成战鼓
hufuHandler.prototype.compoundDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundDrum(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练战鼓
hufuHandler.prototype.washDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washDrum(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售战鼓
hufuHandler.prototype.sellDrum = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var ids = msg.ids
  var self = this
  self.areaManager.areaMap[areaId].sellDrum(uid,ids,function(flag,data) {
    if(!flag){
      next(null,{flag : flag,err : data})
    }else{
      next(null,{flag : flag,awardList : data})
    }
  })
}
//军旗列表
hufuHandler.prototype.getBannerList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getBannerList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机军旗
hufuHandler.prototype.gainRandBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandBanner(uid,lv)
  next(null,{flag:true,data:data})
}
//穿戴军旗
hufuHandler.prototype.wearBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearBanner(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下军旗
hufuHandler.prototype.unwearBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearBanner(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成军旗
hufuHandler.prototype.compoundBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundBanner(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练军旗
hufuHandler.prototype.washBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washBanner(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售军旗
hufuHandler.prototype.sellBanner = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var ids = msg.ids
  var self = this
  self.areaManager.areaMap[areaId].sellBanner(uid,ids,function(flag,data) {
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
//战鼓列表
hufuHandler.prototype.getDrumList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getDrumList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机战鼓
hufuHandler.prototype.gainRandDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandDrum(uid,lv)
  next(null,{flag:true,data:data})
}
//穿戴战鼓
hufuHandler.prototype.wearDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearDrum(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下战鼓
hufuHandler.prototype.unwearDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearDrum(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成战鼓
hufuHandler.prototype.compoundDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundDrum(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练战鼓
hufuHandler.prototype.washDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washDrum(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售战鼓
hufuHandler.prototype.sellDrum = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var self = this
  self.areaManager.areaMap[areaId].sellDrum(uid,id,function(flag,data) {
    if(!flag){
      next(null,{flag : flag,err : data})
    }else{
      next(null,{flag : flag,awardList : data})
    }
  })
}
//军旗列表
hufuHandler.prototype.getBannerList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getBannerList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机军旗
hufuHandler.prototype.gainRandBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandBanner(uid,lv)
  next(null,{flag:true,data:data})
}
//穿戴军旗
hufuHandler.prototype.wearBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearBanner(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下军旗
hufuHandler.prototype.unwearBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearBanner(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成军旗
hufuHandler.prototype.compoundBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundBanner(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练军旗
hufuHandler.prototype.washBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washBanner(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售军旗
hufuHandler.prototype.sellBanner = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var self = this
  self.areaManager.areaMap[areaId].sellBanner(uid,id,function(flag,data) {
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
//战鼓列表
hufuHandler.prototype.getDrumList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getDrumList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机战鼓
hufuHandler.prototype.gainRandDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandDrum(uid,lv)
  next(null,{flag:true,data:data})
}
//穿戴战鼓
hufuHandler.prototype.wearDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearDrum(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下战鼓
hufuHandler.prototype.unwearDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearDrum(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成战鼓
hufuHandler.prototype.compoundDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundDrum(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练战鼓
hufuHandler.prototype.washDrum = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washDrum(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售战鼓
hufuHandler.prototype.sellDrum = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var self = this
  self.areaManager.areaMap[areaId].sellDrum(uid,id,function(flag,data) {
    if(!flag){
      next(null,{flag : flag,err : data})
    }else{
      next(null,{flag : flag,awardList : data})
    }
  })
}
//军旗列表
hufuHandler.prototype.getBannerList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  this.areaManager.areaMap[areaId].getBannerList(uid,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//生成随机军旗
hufuHandler.prototype.gainRandBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var lv = msg.lv
  var data = this.areaManager.areaMap[areaId].gainRandBanner(uid,lv)
  next(null,{flag:true,data:data})
}
//穿戴军旗
hufuHandler.prototype.wearBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var id = msg.id
  this.areaManager.areaMap[areaId].wearBanner(uid,hId,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//卸下军旗
hufuHandler.prototype.unwearBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].unwearBanner(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//合成军旗
hufuHandler.prototype.compoundBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var ids = msg.ids
  var lv = msg.lv
  this.areaManager.areaMap[areaId].compoundBanner(uid,ids,lv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练军旗
hufuHandler.prototype.washBanner = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var id = msg.id
  this.areaManager.areaMap[areaId].washBanner(uid,id,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//出售军旗
hufuHandler.prototype.sellBanner = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var self = this
  self.areaManager.areaMap[areaId].sellBanner(uid,id,function(flag,data) {
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