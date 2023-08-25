var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var hero_ad = require("../../../../config/gameCfg/hero_ad.json")
var officer = require("../../../../config/gameCfg/officer.json")
var default_cfg = require("../../../../config/gameCfg/default_cfg.json")
var star_base = require("../../../../config/gameCfg/star_base.json")
var lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
var hufu_skill = require("../../../../config/gameCfg/hufu_skill.json")
var hufu_lv = require("../../../../config/gameCfg/hufu_lv.json")
var lord_lv = require("../../../../config/gameCfg/lord_lv.json")
var hufu_map = {}
for(var i in hufu_skill){
  for(var j = 1;j<= 5;j++){
    hufu_map[hufu_skill[i]["lv"+j]] = {"id":i,"lv":j}
  }
}
var heroHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};

//英雄分解
heroHandler.prototype.heroRecycle = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hIds = msg.hIds
  this.areaManager.areaMap[areaId].heroRecycle(uid,hIds,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//英雄打书
heroHandler.prototype.heroPS = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var itemId = msg.itemId
  this.areaManager.areaMap[areaId].heroPS(uid,hId,itemId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//英雄洗练
heroHandler.prototype.heroWash = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var item = msg.item
  this.areaManager.areaMap[areaId].heroWash(uid,hId,item,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//洗练保存
heroHandler.prototype.heroWashSave = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].heroWashSave(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//英雄升级
heroHandler.prototype.heroUPLv = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var aimLv = msg.aimLv
  this.areaManager.areaMap[areaId].heroUPLv(uid,hId,aimLv,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//英雄进化 已进化不能当材料
heroHandler.prototype.heroUPEvo = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  var hIds = msg.hIds
  this.areaManager.areaMap[areaId].heroUPEvo(uid,hId,hIds,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//英雄晋升 受主角等级限制
heroHandler.prototype.heroUPExalt = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = session.uid
  var hId = msg.hId
  this.areaManager.areaMap[areaId].heroUPExalt(uid,hId,function(flag,data) {
    next(null,{flag:flag,data:data})
  })
}
//增加英雄背包栏
heroHandler.prototype.addHeroAmount = function(msg, session, next) {
  next(null,{flag : false})
  return
  // var uid = session.uid
  // this.heroDao.addHeroAmount(uid,function(flag,data) {
  //   next(null,{flag : flag,data : data})
  // })
}
//获取英雄背包栏数量
heroHandler.prototype.getHeroAmount = function(msg, session, next) {
  var uid = session.uid
  this.heroDao.getHeroAmount(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获得英雄  测试功能
heroHandler.prototype.gainHero = function(msg, session, next) {
  var limit = session.get("limit")
  if(limit < 20){
    next(null,{flag : false})
    return
  }
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var ad = msg.ad
  var lv = msg.lv
  var star = msg.star
  var self = this
  self.heroDao.getHeroAmount(uid,function(flag,info) {
      if(info.cur >= info.max){
        next(null,{flag : false,data : "英雄背包已满"})
        return
      }
      self.heroDao.gainHero(areaId,uid,{id : id,ad : ad,lv : lv,star : star},function(flag,data) {
        next(null,{flag : flag,data : data})
      })
  })
}
//英雄重生
heroHandler.prototype.resetHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    if(heroInfo.lv == 1 && heroInfo.ad == 0){
      next(null,{flag : false,err : "当前状态不能重置"})
      return
    }
    if(heroInfo.combat){
      next(null,{flag : false,err : "英雄已出战"})
      return
    }
    self.areaManager.areaMap[areaId].consumeItems(uid,default_cfg["hero_reset"]["value"],1,"英雄重生",function(flag,err) {
      if(!flag){
        next(null,{flag : false,err : err})
        return
      }
      self.heroDao.heroReset(areaId,uid,heroInfo,function(flag,awardList) {
          var info = {
            "lv":1,
            "ad":0,
            "tr_lv":0,
            "tr_maxHP":0,
            "tr_atk":0,
            "tr_phyDef":0,
            "tr_magDef":0,
            "et1":0,
            "et2":0,
            "et3":0,
            "et4":0
          }
          self.heroDao.setHMHeroInfo(areaId,uid,hId,info)
          self.heroDao.delHeroInfo(areaId,uid,hId,"artifact")
          next(null,{flag : true,awardList : awardList,lv:info.lv,ad:info.ad})
      })
    })
  })
}
//分解英雄
heroHandler.prototype.removeHeros = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hIds = msg.hIds
  var self = this
  var hIdmap = {}
  for(var i = 0;i < hIds.length;i++){
    if(hIdmap[hIds[i]]){
      next(null,{flag : false,data : "英雄hId不能重复"})
      return
    }
    hIdmap[hIds[i]] = true
  }
  self.heroDao.getHeroList(uid,hIds,function(flag,herolist) {
    for(var i in herolist){
      if(self.heroDao.heroLockCheck(herolist[i])){
        next(null,{flag:false,err:self.heroDao.heroLockCheck(herolist[i])})
        return
      }
    }
    self.heroDao.removeHeroList(areaId,uid,hIds,function(flag,err) {
      if(flag){
        self.heroDao.heroPrAll(areaId,uid,herolist,hIds,function(flag,awardList) {
          next(null,{flag : true,awardList : awardList})
        },"分解英雄")
      }else{
        next(null,{flag : false})
      }
    })
  })
}
//英雄战法栏解锁
heroHandler.prototype.unlockZhanfaGrid = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var index = msg.index
  var target = msg.target
  var hIds = msg.hIds
  var self = this
  var key = "zf_"+index
  if(index !== 2 && index !== 3){
    next(null,{flag : false,err : "index error "+index})
    return
  }
  var count = index - 1
  if(!(hIds instanceof Array) || hIds.length != count){
    next(null,{flag : false,data : "必须传数组"})
    return
  }
  hIds.push(target)
  var hIdmap = {}
  for(var i = 0;i < hIds.length;i++){
    if(hIdmap[hIds[i]]){
      next(null,{flag : false,data : "英雄hId不能重复"})
      return
    }
    hIdmap[hIds[i]] = true
  }
  self.heroDao.getHeroList(uid,hIds,function(flag,data) {
      if(!flag || !data){
        next(null,{flag : false,data : "材料英雄错误"})
        return
      }
      var targetHero = data.pop()
      hIds.pop()
      if(!targetHero){
        next(null,{flag : false,data : "目标英雄不存在"})
        return
      }
      if(targetHero.star < 11){
        next(null,{flag : false,data : "英雄未觉醒"})
        return
      }
      if(targetHero[key]){
        next(null,{flag : false,data : "该战法栏已解锁"})
        return
      }
      //材料英雄检测
      for(var i = 0;i < data.length;i++){
        if(self.heroDao.heroLockCheck(data[i])){
          next(null,{flag : false,err:self.heroDao.heroLockCheck(data[i])})
          return
        }
        if(data[i].star != 10){
          next(null,{flag : false,data : "必须为10星英雄"+hIds[i]})
          return
        }
      }
      self.heroDao.removeHeroList(areaId,uid,hIds,function(flag,err) {
          if(err)
            console.error(err)
          self.heroDao.heroPrlvadnad(areaId,uid,data,hIds,function(flag,awardList) {
            self.heroDao.setHeroInfo(areaId,uid,target,key,1,function(flag,data) {
              next(null,{flag : flag,hId:target,key:key,awardList:awardList})
            })
          },"战法栏解锁")
      })
  })
}
//锁定英雄
heroHandler.prototype.lockHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag || !heroInfo){
        next(null,{flag : false,data : "hId not find"})
        return
    }
    self.redisDao.db.hset("player:user:"+uid+":heros:"+hId,"lock",1)
    next(null,{flag : true})
  })
}
//解锁英雄
heroHandler.prototype.unlockHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag || !heroInfo){
        next(null,{flag : false,data : "hId not find"})
        return
    }
    self.redisDao.db.hdel("player:user:"+uid+":heros:"+hId,"lock")
    next(null,{flag : true})
  })
}
//修改英雄属性
heroHandler.prototype.incrbyHeroInfo = function(msg, session, next) {
  next(null,{flag : false})
  // var uid = session.uid
  // var areaId = session.get("areaId")
  // var hId = msg.hId
  // var name = msg.name
  // var value = msg.value
  // this.heroDao.incrbyHeroInfo(areaId,uid,hId,name,value,function(flag,data) {
  //   next(null,{flag : flag,data : data})
  // })
}
//获取英雄列表
heroHandler.prototype.getHeros = function(msg, session, next) {
  var uid = session.uid
  this.heroDao.getHeros(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//设置出场阵容
heroHandler.prototype.setFightTeam = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hIds = msg.hIds
  //参数判断
  if(!hIds instanceof Array){
    next(null,{flag : false,data : "必须传数组"})
    return
  }
  if(hIds.length != 6){
    next(null,{flag : false,data : "数组长度错误"})
    return
  }
  var heroNum = 0
  //判断重复
  for(var i = 0;i < hIds.length;i++){
    if(hIds[i] == null)
      continue
    heroNum++
    for(var j = i + 1;j < hIds.length;j++){
      if(hIds[j] == null)
        continue
      if(hIds[i] == hIds[j]){
        next(null,{flag : false,data : "不能有重复的hId"})
        return
      }
    }
  }
  if(heroNum == 0){
    next(null,{flag : false,data : "至少要有一个上阵英雄"})
    return
  }
  this.heroDao.setFightTeam(areaId,uid,hIds,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取出场阵容
heroHandler.prototype.getFightTeam = function(msg, session, next) {
  var uid = session.uid
  this.heroDao.getFightTeam(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取英雄排名表
heroHandler.prototype.getHeroRankList = function(msg, session, next) {
  var areaId = session.get("areaId")
  var heroId = msg.heroId
  this.areaManager.areaMap[areaId].getHeroRankList(heroId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取单个英雄排名
heroHandler.prototype.getHeroRankOne = function(msg, session, next) {
  var areaId = session.get("areaId")
  var uid = msg.uid
  var hId = msg.hId
  var heroId = msg.heroId
  this.areaManager.areaMap[areaId].getHeroRankOne(uid,hId,heroId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
module.exports = function(app) {
  return bearcat.getBean({
  	id : "heroHandler",
  	func : heroHandler,
  	args : [{
  		name : "app",
  		value : app
  	}],
    props : [{
      name : "heroDao",
      ref : "heroDao"
    },{
      name : "redisDao",
      ref : "redisDao"
    }]
  })
};