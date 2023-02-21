var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var hero_ad = require("../../../../config/gameCfg/hero_ad.json")
var officer = require("../../../../config/gameCfg/officer.json")
var default_cfg = require("../../../../config/gameCfg/default_cfg.json")
var star_base = require("../../../../config/gameCfg/star_base.json")
var evolutionCfg = require("../../../../config/gameCfg/evolution.json")
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
    if(heroInfo.coexist){
      next(null,{flag : false,err : "该英雄共鸣中"})
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
      if(!herolist[i]){
        next(null,{flag : false,err : "英雄不存在"+i})
        return
      }
      if(herolist[i].coexist){
        next(null,{flag : false,err : "该英雄共鸣中"})
        return
      }
      if(herolist[i].combat){
        next(null,{flag : false,err : "英雄已出战"+i+","+hIds[i]+",combat:"+herolist[i].combat})
        return
      }
      if((herolist[i].zf_1 && herolist[i].zf_1 != 1) || (herolist[i].zf_2 && herolist[i].zf_2 != 1) || (herolist[i].zf_3 && herolist[i].zf_3 != 1)){
        next(null,{flag : false,err : "英雄已穿戴战法"+i+","+hIds[i]})
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
        if(!data[i] || !data[i].id){
          next(null,{flag : false,data : "英雄不存在"+hIds[i]})
          return
        }
        if(data[i].coexist){
          next(null,{flag : false,err : "该英雄共鸣中"})
          return
        }
        if(data[i].combat){
          next(null,{flag : false,data : "英雄已出战"+hIds[i]})
          return
        }
        if(data[i].star != 10){
          next(null,{flag : false,data : "必须为10星英雄"+hIds[i]})
          return
        }
        if((data[i].zf_1 && data[i].zf_1 != 1) || (data[i].zf_2 && data[i].zf_2 != 1) || (data[i].zf_3 && data[i].zf_3 != 1)){
          next(null,{flag : false,err : "英雄已穿戴战法"+hIds[i]})
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
//英雄升级 受阶级限制
heroHandler.prototype.upgradeLevel = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var aimLv = msg.aimLv
  if(!Number.isInteger(aimLv) || !lv_cfg[aimLv]){
    next(null,{flag : false,err : "aimLv error "+aimLv})
    return
  }
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    if(heroInfo.coexist){
      next(null,{flag : false,err : "该英雄共鸣中"})
      return
    }
    var lv = hero_ad[heroInfo.ad].lv || 0
    if(aimLv <= heroInfo.lv || aimLv > lv){
      next(null,{flag : false,err : "等级限制"})
      return
    }
    var strList = []
    for(var i = heroInfo.lv;i < aimLv;i++){
      strList.push(lv_cfg[i].pc)
    }
    var pcStr = self.areaManager.areaMap[areaId].mergepcstr(strList)
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"英雄升级",function(flag,err) {
      if(!flag){
        next(null,{flag : false,err : err})
        return
      }
      self.heroDao.incrbyHeroInfo(areaId,uid,hId,"lv",aimLv - heroInfo.lv,function(flag,data) {
        next(null,{flag : flag,data : data})
      })  
    })
  })
}
//英雄升阶  受玩家等级限制
heroHandler.prototype.upgraAdvance = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    if(heroInfo.coexist){
      next(null,{flag : false,err : "该英雄共鸣中"})
      return
    }
    var aimAd = heroInfo.ad + 1
    if(!hero_ad[aimAd]){
      next(null,{flag : false,err : "没有下一阶"})
      return
    }
    var lv = self.areaManager.areaMap[areaId].getLordLv(uid)
    if(aimAd > lord_lv[lv]["ad"]){
      next(null,{flag : false,err : "等级限制"+heroInfo.ad+"/"+lord_lv[lv]["ad"]})
      return
    }
    var pcStr = hero_ad[heroInfo.ad].pc
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"英雄升阶",function(flag,err) {
      if(!flag){
        next(null,{flag : false,err : err})
        return
      }
      self.heroDao.incrbyHeroInfo(areaId,uid,hId,"ad",1,function(flag,data) {
        next(null,{flag : flag,data : data})
      })
    })
  })
}
//英雄升星   受玩家等级限制
heroHandler.prototype.upgradeStar = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var target = msg.target
  var hIds = msg.hIds
  if(!hIds instanceof Array){
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
  var self = this
  self.heroDao.getHeroList(uid,hIds,function(flag,data) {
    if(data){
      var targetHero = data.pop()
      hIds.pop()
      var star = targetHero.star
      var pc_hero = star_base[star].pc_hero
      if(!targetHero){
        next(null,{flag : false,data : "目标英雄不存在"})
        return
      }
      if(targetHero.star == heros[targetHero.id].max_star){
        next(null,{flag : false,data : "已达到最大星级"})
        return
      }
      var lv = self.areaManager.areaMap[areaId].getLordLv(uid)
      if(star >= lord_lv[lv]["star"]){
        next(null,{flag : false,err : "等级限制"+star+"/"+lord_lv[lv]["star"]})
        return
      }
      //材料英雄检测
      if(pc_hero){
        pc_hero = JSON.parse(pc_hero)
        if(pc_hero.length !== data.length){
          next(null,{flag : false,data : "材料英雄数量错误"})
          return
        }
        for(var i = 0;i < pc_hero.length;i++){
          if(!data[i] || !data[i].id){
            next(null,{flag : false,data : "英雄不存在"+hIds[i]})
            return
          }
          if(data[i].combat){
            next(null,{flag : false,data : "英雄已出战"+hIds[i]})
            return
          }
          if(data[i].coexist){
            next(null,{flag : false,err : "该英雄共鸣中"})
            return
          }
          if((data[i].zf_1 && data[i].zf_1 != 1) || (data[i].zf_2 && data[i].zf_2 != 1) || (data[i].zf_3 && data[i].zf_3 != 1)){
            next(null,{flag : false,err : "英雄已穿戴战法"+hIds[i]})
            return
          }
          switch(pc_hero[i][0]){
            case "self":
              if(!(data[i].id == targetHero.id && data[i].star == heros[targetHero.id].min_star)){
                next(null,{flag : false,data : pc_hero[i][0]+"材料错误 index:"+i+" id:"+data[i].id+" star:"+data[i].star})
                return
              }
            break
            case "realm_point":
              if(!(data[i].id == heros[targetHero.id].point_hero && data[i].star == 5)){
                next(null,{flag : false,data : pc_hero[i][0]+"材料错误 index:"+i+" id:"+data[i].id+" star:"+data[i].star})
                return
              }
            break
            case "realm_rand":
              if(!(heros[data[i].id].realm == heros[targetHero.id].realm && data[i].star == pc_hero[i][1])){
                next(null,{flag : false,data : pc_hero[i][0]+"材料错误 index:"+i+" id:"+data[i].id+" star:"+data[i].star})
                return
              }
            break
            case "rand":
              if(!(data[i].star == pc_hero[i][1])){
                next(null,{flag : false,data : pc_hero[i][0]+"材料错误 index:"+i+" id:"+data[i].id+" star:"+data[i].star})
                return
              }
            break
          }
        }
        var pcStr = star_base[star].pc
        var name = session.get("name")
        var heroName = heros[targetHero.id]["name"]
        if(pcStr){
          self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"英雄升星",function(flag,err) {
            if(!flag){
              next(null,{flag : false,err : err})
              return
            }
            self.heroDao.removeHeroList(areaId,uid,hIds,function(flag,err) {
                if(err)
                  console.error(err)
                self.heroDao.heroPrlvadnad(areaId,uid,data,hIds,function(flag,awardList) {
                  self.heroDao.incrbyHeroInfo(areaId,uid,target,"star",1,function(flag,star) {
                    next(null,{flag : flag,awardList : awardList,star : star})
                  })
                },"升星材料")
            })
          })
        }else{
            self.heroDao.removeHeroList(areaId,uid,hIds,function(flag,err) {
                if(err)
                  console.error(err)
                self.heroDao.heroPrlvadnad(areaId,uid,data,hIds,function(flag,awardList) {
                  self.heroDao.incrbyHeroInfo(areaId,uid,target,"star",1,function(flag,star) {
                    next(null,{flag : flag,awardList : awardList,star : star})
                  })
                },"升星材料")
            })
        }
      }
    }else{
      next(null,{flag : false,data : "材料英雄错误"})
    }
  })
}
//英雄进化
heroHandler.prototype.upgraEvolution = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    var aimEvo = (heroInfo.evo || 0) + 1
    if(!evolutionCfg[aimEvo]){
      next(null,{flag : false,err : "没有下一级"})
      return
    }
    var olv = self.areaManager.areaMap[areaId].getLordAtt(uid,"officer")
    if(aimEvo > officer[olv]["officer"]){
      next(null,{flag : false,err : "爵位限制"})
      return
    }
    var pcStr = evolutionCfg[aimEvo].pc
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"英雄进化",function(flag,err) {
      if(!flag){
        next(null,{flag : false,err : err})
        return
      }
      self.heroDao.incrbyHeroInfo(areaId,uid,hId,"evo",1,function(flag,data) {
        next(null,{flag : flag,data : data})
      })
    })
  })
}
//直升六星
heroHandler.prototype.upgradeStarSimple = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    if(heroInfo.star == heros[heroInfo.id].max_star){
      next(null,{flag : false,data : "已达到最大星级"})
      return
    }
    if(heroInfo.star !== 5){
      next(null,{flag : false,data : "必须为五星英雄"})
      return
    }
    var pcStr = "1000190:1"
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"直升六星",function(flag,err) {
      if(!flag){
        next(null,{flag : false,err : err})
        return
      }
      self.heroDao.incrbyHeroInfo(areaId,uid,hId,"star",1,function(flag,star) {
        if(flag){
            var name = session.get("name")
            var heroName = heros[heroInfo.id]["name"]
            // var notify = {
            //   type : "sysChat",
            //   text : "恭喜"+name+"合成出6星英雄"+heroName+",实力大涨名动八荒"
            // }
            // self.areaManager.areaMap[areaId].sendAllUser(notify)
        }
        next(null,{flag : flag,star : star})
      })
    })
  })
}
//英雄重置
heroHandler.prototype.replaceHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.areaManager.areaMap[areaId].getPlayerData(uid,"replaceHero",function(data) {
    if(data){
      next(null,{flag : false,err : "请先保存或取消当前重置"})
      return
    }
    self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
      if(!flag){
        next(null,{flag : false,err : "英雄不存在"})
        return
      }
      if(heroInfo.coexist){
        next(null,{flag : false,err : "该英雄共鸣中"})
        return
      }
      if(heroInfo.combat){
        next(null,{flag : false,data : "英雄已上阵"})
        return
      }
      if(heroInfo.star !== 5){
        next(null,{flag : false,data : "必须为五星英雄"})
        return
      }
      if(heroInfo.skin){
        next(null,{flag : false,data : "重置的英雄必须为初始形象"})
        return
      }
      var pcStr = "1000180:1"
      self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"英雄重置",function(flag,err) {
        if(!flag){
          next(null,{flag : false,err : err})
          return
        }
        var heroId = self.heroDao.randHeroIdButId("camp_"+heros[heroInfo.id].realm,heroInfo.id)
        self.areaManager.areaMap[areaId].setPlayerData(uid,"replaceHero",hId)
        self.areaManager.areaMap[areaId].setPlayerData(uid,"replacePick",heroId)
        next(null,{flag : flag,replaceHero : hId,replacePick:heroId})
      })
    })
  })
}
//保存重置
heroHandler.prototype.saveReplace = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var self = this
  self.areaManager.areaMap[areaId].getPlayerData(uid,"replaceHero",function(hId) {
    if(!hId){
        next(null,{flag : false,data : "数据不存在"+hId})
        return
    }
    self.areaManager.areaMap[areaId].getPlayerData(uid,"replacePick",function(heroId) {
      if(!heroId){
          next(null,{flag : false,data : "数据不存在"+heroId})
          return
      }
      self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
          if(heroInfo.coexist){
            next(null,{flag : false,err : "该英雄共鸣中"})
            return
          }
          if(heroInfo.combat){
            next(null,{flag : false,data : "英雄已上阵"})
            return
          }
          if(heroInfo.star !== 5){
            next(null,{flag : false,data : "必须为五星英雄"})
            return
          }
          if(heroInfo.skin){
            next(null,{flag : false,data : "重置的英雄必须为初始形象"})
            return
          }
          self.heroDao.setHeroInfo(areaId,uid,hId,"id",heroId,function(flag,data) {
            if(flag){
              self.areaManager.areaMap[areaId].delPlayerData(uid,"replaceHero")
              self.areaManager.areaMap[areaId].delPlayerData(uid,"replacePick")
              self.heroDao.updateHeroArchive(areaId,uid,heroId,5)
            }
            next(null,{flag : flag,hId:hId,heroId:heroId})
          })
        })
    })
  })
}
//取消重置
heroHandler.prototype.cancelReplace = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].delPlayerData(uid,"replaceHero")
  this.areaManager.areaMap[areaId].delPlayerData(uid,"replacePick")
  next(null,{flag : true})
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
//获取英雄图鉴
heroHandler.prototype.getHeroArchive = function(msg, session, next) {
  var uid = session.uid
  this.heroDao.getHeroArchive(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获得已激活图鉴
heroHandler.prototype.getHeroBook = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getHeroBook(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//激活图鉴
heroHandler.prototype.activateHeroBook = function(msg, session, next) {
  var uid = session.uid
  var id = msg.id
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].activateHeroBook(uid,id,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//升级图鉴
heroHandler.prototype.upgradeHeroBook = function(msg, session, next) {
  var uid = session.uid
  var id = msg.id
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].upgradeHeroBook(uid,id,function(flag,data) {
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
//升级符石
heroHandler.prototype.upHeroFS = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var slot = msg.slot
  var id = msg.id
  var lv = 1
  var self = this
  if(!Number.isInteger(slot) || slot < 1 || slot > 4){
    next(null,{flag : false,err : "slot error "+slot})
    return
  }
  if(!hufu_skill[id]){
    next(null,{flag : false,err : "id error "+id})
    return
  }
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    if(heroInfo.star < 15+slot){
      next(null,{flag : false,err : "星级限制"})
      return
    }
    var key = "fs"+slot
    if(heroInfo[key]){
      id = hufu_map[heroInfo[key]]["id"]
      lv = hufu_map[heroInfo[key]]["lv"] + 1
    }
    var pcStr = ""
    if(lv > 5){
      next(null,{flag : false,err : "已满级"})
      return
    }if(lv == 5){
      pcStr = "2000080:1"
    }else{
      pcStr = id+":"+hufu_lv[lv]["base"]
    }
    if(hufu_lv[lv]["pc"])
      pcStr += "&2000060:"+hufu_lv[lv]["pc"]
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"升级符石"+id,function(flag,err) {
      if(!flag){
        next(null,{flag : false,err : err})
        return
      }
      self.heroDao.setHeroInfo(areaId,uid,hId,key,hufu_skill[id]["lv"+lv],function(flag,data) {
        next(null,{flag : flag,data : hufu_skill[id]["lv"+lv]})
      })
    })
  })
}
//卸下符石
heroHandler.prototype.unHeroFS = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var slot = msg.slot
  var lv = 1
  var self = this
  if(!Number.isInteger(slot) || slot < 1 || slot > 4){
    next(null,{flag : false,err : "slot error "+slot})
    return
  }
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    var key = "fs"+slot
    if(heroInfo[key]){
      lv = hufu_map[heroInfo[key]]["lv"]
    }else{
      next(null,{flag : false,err : "未装备"})
      return
    }
    var str = "2000060:"+hufu_lv[lv]["pr"]
    var awardList = self.areaManager.areaMap[areaId].addItemStr(uid,str,1,"卸下符石"+lv)
    self.heroDao.delHeroInfo(areaId,uid,hId,key,function(flag,data) {
      next(null,{flag : flag,awardList : awardList})
    })
  })
}
//激活专属符石
heroHandler.prototype.actHeroOnlyFS = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    if(heroInfo.star < 20){
      next(null,{flag : false,err : "星级限制"})
      return
    }
    var key = "fs5"
    if(heroInfo[key]){      
      next(null,{flag : false,err : "已激活"})
      return
    }
    var pcStr = "2000100:1"
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,"激活专属符石"+hId,function(flag,err) {
      if(!flag){
        next(null,{flag : false,err : err})
        return
      }
      self.heroDao.setHeroInfo(areaId,uid,hId,key,1,function(flag,data) {
        next(null,{flag : flag,data : data})
      })  
    })
  })
}
//英雄培养属性
heroHandler.prototype.heroTrainAtt = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var value = msg.value
  if(!Number.isInteger(value)){
    next(null,{flag : false,err : "value error "+value})
    return
  }
  this.areaManager.areaMap[areaId].heroTrainAtt(uid,hId,value,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//英雄培养突破
heroHandler.prototype.heroTrainLv = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  this.areaManager.areaMap[areaId].heroTrainLv(uid,hId,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//英雄装备强化
heroHandler.prototype.heroEquipStrengthen = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var slot = msg.slot
  this.areaManager.areaMap[areaId].heroEquipStrengthen(uid,hId,slot,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取共鸣英雄数据
heroHandler.prototype.getCoexistData = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.areaManager.areaMap[areaId].getCoexistData(uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//放置共鸣英雄
heroHandler.prototype.setCoexistHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var index = msg.index
  this.areaManager.areaMap[areaId].setCoexistHero(uid,hId,index,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//取出共鸣英雄
heroHandler.prototype.cleanCoexistHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var index = msg.index
  this.areaManager.areaMap[areaId].cleanCoexistHero(uid,hId,index,function(flag,data) {
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