//神兵系统
var bearcat = require("bearcat")
var async = require("async")
var artifact_level = require("../../../../config/gameCfg/artifact_level.json")
var artifact_talent = require("../../../../config/gameCfg/artifact_talent.json")
var lord_lv = require("../../../../config/gameCfg/lord_lv.json")
var items = require("../../../../config/gameCfg/item.json")
var artifactHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//神兵升级
artifactHandler.prototype.upgradeArtifact = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
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
      //判断物品数量
      var lv = heroInfo.artifact || 0
      var lordLv = self.areaManager.areaMap[areaId].getLordLv(uid)
      if(lv >= heroInfo.lv){
        cb("等级限制"+lv+"/"+lord_lv[lordLv]["artifact"])
        return
      }
      if(!artifact_level[lv] || !artifact_level[lv+1]){
          cb("已不能升级")
          return
      }
      var needNum = artifact_level[lv]["artifact_num"]
      var coin = artifact_level[lv]["coin"]
      var str = "1000150:"+needNum
      if(coin)
        str += "201:"+coin
      self.areaManager.areaMap[areaId].consumeItems(uid,str,1,"神兵升级",function(flag,err) {
        if(!flag){
          next(null,{flag : false,err : err})
          return
        }
        cb(null,heroInfo)
      })
    },
    function(heroInfo,cb) {
      heroInfo["artifact"] += 1
      self.heroDao.incrbyHeroInfo(areaId,uid,hId,"artifact",1)
      // self.areaManager.areaMap[areaId].taskUpdate(uid,"artifactLv",1,heroInfo["artifact"])
      next(null,{flag : true,heroInfo : heroInfo})
    }
  ],function(err) {
    next(null,{flag : false,err : err})
  })
}
//卸下神兵
artifactHandler.prototype.unlordArtifact = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag:false,err:"英雄不存在"})
      return
    }
    if(!heroInfo["artifact"]){
      next(null,{flag:false,err:"未装备神兵"})
      return
    }
    //神兵返还
    var awardList = self.areaManager.areaMap[areaId].addItemStr(uid,artifact_level[heroInfo["artifact"]].pr,1,"卸下神兵")
    self.heroDao.delHeroInfo(areaId,uid,hId,"artifact")
    next(null,{flag:true,awardList:awardList})
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