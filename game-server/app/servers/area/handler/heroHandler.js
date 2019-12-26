var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var advanced_base = require("../../../../config/gameCfg/advanced_base.json")
var star_base = require("../../../../config/gameCfg/star_base.json")
var lv_cfg = require("../../../../config/gameCfg/lv_cfg.json")
var heroHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//增加英雄背包栏
heroHandler.prototype.addHeroAmount = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.addHeroAmount(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取英雄背包栏数量
heroHandler.prototype.getHeroAmount = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.getHeroAmount(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获得英雄
heroHandler.prototype.gainHero = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var id = msg.id
  var ad = msg.ad
  var lv = msg.lv
  var self = this
  self.heroDao.getHeroAmount(areaId,uid,function(flag,info) {
      if(info.cur >= info.max){
        next(null,{flag : false,data : "武将背包已满"})
        return
      }
      self.heroDao.gainHero(areaId,uid,{id : id,ad : ad,lv : lv},function(flag,data) {
        next(null,{flag : flag,data : data})
      })
  })
}
//分解英雄
heroHandler.prototype.removeHeros = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hIds = msg.hIds
  var self = this
  self.heroDao.getHeroList(areaId,uid,hIds,function(flag,heros) {
    console.log("heros",heros)
    for(var i in heros){
      if(!heros[i]){
        next(null,{flag : false,err : "武将不存在"+i})
        return
      }
    }
    self.heroDao.removeHeroList(areaId,uid,hIds,function(flag,err) {
      if(flag){
        self.heroDao.heroPrAll(areaId,uid,heros,function(flag,awardList) {
          next(null,{flag : true,awardList : awardList})
        })
      }else{
        next(null,{flag : false})
      }
    })
  })
}
//英雄升级 升阶与星级取最低等级限制
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
  self.heroDao.getHeroOne(areaId,uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    let star_limit = star_base[heroInfo.star].lev_limit || 0
    let ad_limit = advanced_base[heroInfo.ad].lev_limit || 0
    let lev_limit = star_limit < ad_limit ? star_limit : ad_limit
    if(aimLv <= heroInfo.lv || aimLv > lev_limit){
      next(null,{flag : false,err : "等级限制"})
      return
    }
    var strList = []
    for(var i = heroInfo.lv;i < aimLv;i++){
      strList.push(lv_cfg[i].pc)
    }
    var pcStr = self.areaManager.areaMap[areaId].mergepcstr(strList)
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,function(flag,err) {
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
//英雄升阶  受星级与等级限制
heroHandler.prototype.upgraAdvance = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var self = this
  self.heroDao.getHeroOne(areaId,uid,hId,function(flag,heroInfo) {
    if(!flag){
      next(null,{flag : false,err : "英雄不存在"})
      return
    }
    var aimAd = heroInfo.ad + 1
    if(!advanced_base[aimAd]){
      next(null,{flag : false,err : "没有下一阶"})
      return
    }
    if(heroInfo.lv != advanced_base[heroInfo.ad].lev_limit){
      next(null,{flag : false,err : "等级限制"})
      return
    }
    if(aimAd > star_base[heroInfo.star].stage_limit){
      next(null,{flag : false,err : "星级限制"})
      return
    }
    var pcStr = advanced_base[heroInfo.ad].pc
    self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,function(flag,err) {
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
//英雄升星   有最大星级限制
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
    if(typeof(hIds[i]) != "string" || !hIds[i]){
      next(null,{flag : false,data : "英雄hId必须是string"})
      return
    }
    if(hIdmap[hIds[i]]){
      next(null,{flag : false,data : "英雄hId不能重复"})
      return
    }
    hIdmap[hIds[i]] = true
  }
  var self = this
  self.heroDao.getHeroList(areaId,uid,hIds,function(flag,data) {
    if(data){
      let targetHero = data.pop()
      hIds.pop()
      let star = targetHero.star
      let pc_hero = star_base[star].pc_hero
      if(!targetHero){
        next(null,{flag : false,data : "目标武将不存在"})
        return
      }
      if(targetHero.star == heros[targetHero.id].max_star){
        next(null,{flag : false,data : "已达到最大星级"})
        return
      }
      //材料武将检测
      if(pc_hero){
        pc_hero = JSON.parse(pc_hero)
        if(pc_hero.length !== data.length){
          next(null,{flag : false,data : "材料武将数量错误"})
          return
        }
        for(var i = 0;i < pc_hero.length;i++){
          if(!data[i] || !heros[targetHero.id]){
            next(null,{flag : false,data : "材料武将不存在"+hIds[i]})
            return
          }
          if(heros[targetHero.id].combat){
            next(null,{flag : false,data : "材料武将已出战"+hIds[i]})
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
        let pcStr = star_base[star].pc
        if(pcStr){
          self.areaManager.areaMap[areaId].consumeItems(uid,pcStr,1,function(flag,err) {
            if(!flag){
              next(null,{flag : false,err : err})
              return
            }
            self.heroDao.removeHeroList(areaId,uid,hIds,function(flag,err) {
                if(err)
                  console.error(err)
                self.heroDao.heroPrlvadnad(areaId,uid,data,function(flag,awardList) {
                  self.heroDao.incrbyHeroInfo(areaId,uid,target,"star",1,function(flag,star) {
                    next(null,{flag : flag,awardList : awardList,star : star})
                  })
                })
            })
          })
        }else{
            self.heroDao.removeHeroList(areaId,uid,hIds,function(flag,err) {
                if(err)
                  console.error(err)
                self.heroDao.heroPrlvadnad(areaId,uid,data,function(flag,awardList) {
                  self.heroDao.incrbyHeroInfo(areaId,uid,target,"star",1,function(flag,star) {
                    next(null,{flag : flag,awardList : awardList,star : star})
                  })
                })
            })
        }
      }
    }else{
      next(null,{flag : false,data : "材料武将错误"})
    }
  })
}
//修改英雄属性
heroHandler.prototype.incrbyHeroInfo = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  var hId = msg.hId
  var name = msg.name
  var value = msg.value
  this.heroDao.incrbyHeroInfo(areaId,uid,hId,name,value,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取英雄列表
heroHandler.prototype.getHeros = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.getHeros(areaId,uid,function(flag,data) {
    next(null,{flag : flag,data : data})
  })
}
//获取英雄图鉴
heroHandler.prototype.getHeroArchive = function(msg, session, next) {
  var uid = session.uid
  var areaId = session.get("areaId")
  this.heroDao.getHeroArchive(areaId,uid,function(flag,data) {
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
  var areaId = session.get("areaId")
  this.heroDao.getFightTeam(areaId,uid,function(flag,data) {
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
    }]
  })
};