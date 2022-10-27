//英雄DB
var uuid = require("uuid")
var herosCfg = require("../../config/gameCfg/heros.json")
var lv_cfg = require("../../config/gameCfg/lv_cfg.json")
var star_base = require("../../config/gameCfg/star_base.json")
var hero_ad = require("../../config/gameCfg/hero_ad.json")
var hero_tr = require("../../config/gameCfg/hero_tr.json")
var recruit_base = require("../../config/gameCfg/recruit_base.json")
var recruit_list = require("../../config/gameCfg/recruit_list.json")
var equip_base = require("../../config/gameCfg/equip_base.json")
var equip_level = require("../../config/gameCfg/equip_level.json")
var equip_st = require("../../config/gameCfg/equip_st.json")
var artifact_level = require("../../config/gameCfg/artifact_level.json")
var artifact_talent = require("../../config/gameCfg/artifact_talent.json")
var stone_base = require("../../config/gameCfg/stone_base.json")
var stone_skill = require("../../config/gameCfg/stone_skill.json")
var stone_cfg = require("../../config/gameCfg/stone_cfg.json")
var default_cfg = require("../../config/gameCfg/default_cfg.json")
var evolutionCfg = require("../../config/gameCfg/evolution.json")
var hufu_skill = require("../../config/gameCfg/hufu_skill.json")
var hufu_lv = require("../../config/gameCfg/hufu_lv.json")
var beauty_base = require("../../config/gameCfg/beauty_base.json")
var train_arg = require("../../config/gameCfg/train_arg.json")
var util = require("../../util/util.js")
var async = require("async")
var first_recruit = default_cfg["first_hero"]["value"]
var baseStone = {
	"1" : 4110,
	"2" : 4210,
	"3" : 4310,
	"4" : 4410
}
for(let i in recruit_base){
	recruit_base[i]["weights"] = JSON.parse(recruit_base[i]["weights"])
	recruit_base[i].allWeight = 0
	for(let j in recruit_base[i]["weights"]){
	  recruit_base[i]["weights"][j] += recruit_base[i].allWeight
	  recruit_base[i].allWeight = Number(recruit_base[i]["weights"][j])
	}
}
for(let i in recruit_list){
	recruit_list[i].heroList = JSON.parse(recruit_list[i].heroList)
}
var hufu_map = {}
for(var i in hufu_skill){
  for(var j = 1;j<= 5;j++){
    hufu_map[hufu_skill[i]["lv"+j]] = {"id":i,"lv":j}
  }
}
var bearcat = require("bearcat")
var heroDao = function() {
}
//增加英雄背包栏
heroDao.prototype.addHeroAmount = function(uid,cb) {
	this.redisDao.db.hincrby("player:user:"+uid+":playerInfo","heroAmount",20,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//获取英雄背包栏数量
heroDao.prototype.getHeroAmount = function(uid,cb) {
	var multiList = []
	multiList.push(["hget","player:user:"+uid+":playerInfo","heroAmount"])
	multiList.push(["hlen","player:user:"+uid+":heroMap"])
	this.redisDao.multi(multiList,function(err,list) {
		if(err){
			console.error("getHeroAmount",err)
		}
		cb(true,{max : Number(list[0]) || 0,cur : Number(list[1]) || 0})
	})
}
//英雄池获得英雄
heroDao.prototype.randHero = function(areaId,uid,type,count) {
	let allWeight = recruit_base[type]["allWeight"]
	let weights = recruit_base[type]["weights"]
    var heroInfos = []
    for(let num = 0;num < count;num++){
  	  var rand = Math.random() * allWeight
      for(var i in weights){
        if(rand < weights[i]){
          var heroList = recruit_list[i].heroList
          var heroId = heroList[Math.floor(heroList.length * Math.random())]
          var heroInfo = this.gainHero(areaId,uid,{id : heroId})
          heroInfos.push(heroInfo)
          break
        }
      }
    }
  	return heroInfos
}
//英雄池获得英雄
heroDao.prototype.randHeroLuck = function(areaId,uid,type,count) {
	var allWeight = recruit_base[type]["allWeight"]
	var weights = Object.assign({},recruit_base[type]["weights"])
  	if(this.areaManager.areaMap[areaId].checkLimitedTime("zhaohuan")){
  		allWeight += 200
  		weights["hero_10"] += 200
  	}
    var heroInfos = []
    var r_luck = 0
    if(this.areaManager.areaMap[areaId] && this.areaManager.areaMap[areaId].players[uid])
    	r_luck = this.areaManager.areaMap[areaId].players[uid]["r_luck"]
    var star4_num = 0
    var star5_num = 0
    for(var num = 0;num < count;num++){
		if(r_luck == -1){
	    	r_luck = Math.floor(Math.random() * 3) + 10
				var heroInfo = this.gainHero(areaId,uid,{id : first_recruit})
				heroInfos.push(heroInfo)
    	}else if(r_luck >= 29){
	      var heroId = this.randHeroId("hero_5")
				var heroInfo = this.gainHero(areaId,uid,{id : heroId})
				heroInfos.push(heroInfo)
    		r_luck = 0
    		star4_num++
    		star5_num++
    	}else if(num == 9 && (star4_num + star5_num) == 0){
	      	var heroId = this.randHeroId("hero_4")
					var heroInfo = this.gainHero(areaId,uid,{id : heroId})
					r_luck++
					star4_num++
					heroInfos.push(heroInfo)
    	}else{
			var rand = Math.random() * allWeight
			for(var i in weights){
				if(rand < weights[i]){
					var heroList = recruit_list[i].heroList
					var heroId = heroList[Math.floor(heroList.length * Math.random())]
					if(star5_num >= 1 && herosCfg[heroId].min_star >= 5){
						heroId = this.randHeroId("hero_4")
					}
					var heroInfo = this.gainHero(areaId,uid,{id : heroId})
					heroInfos.push(heroInfo)
					if(heroInfo.star < 5)
						r_luck++
					if(heroInfo.star == 4)
						star4_num++
					if(heroInfo.star == 5){
						star5_num++
						r_luck = 0
					}
					break
				}
			}
    	}
    }
    this.areaManager.areaMap[areaId].chageLordData(uid,"r_luck",r_luck)
  	return heroInfos
}
//英雄池获得英雄id
heroDao.prototype.randHeroId = function(type) {
	var allWeight = recruit_base[type]["allWeight"]
	var weights = recruit_base[type]["weights"]
	var rand = Math.random() * allWeight
	for(var i in weights){
		if(rand < weights[i]){
		  var heroList = recruit_list[i].heroList
		  var heroId = heroList[Math.floor(heroList.length * Math.random())]
		  return heroId
		}
	}
}
//英雄池获得英雄id
heroDao.prototype.randHeroIdButId = function(type,heroId) {
	var allWeight = recruit_base[type]["allWeight"]
	var weights = recruit_base[type]["weights"]
	var rand = Math.random() * allWeight
	for(var i in weights){
		if(rand < weights[i]){
		  var heroList = recruit_list[i].heroList
		  var index = Math.floor(heroList.length * Math.random())
		  if(heroList[index] == heroId)
		  	index = (index + 1 + Math.floor((heroList.length - 1) * Math.random())) % heroList.length
		  var heroId = heroList[index]
		  return heroId
		}
	}
}
//获得英雄
heroDao.prototype.gainHero = function(areaId,uid,otps,cb) {
	let id = otps.id
	if(!herosCfg[id]){
		console.error("id error by herosCfg",id)
		if(cb)
			cb(false,"id error by herosCfg",id)
		return
	}
	let ad = otps.ad || 0
	let lv = otps.lv || 1
	let star = otps.star || herosCfg[id].min_star
	var hId
	if(!otps.robot)
		hId = this.areaManager.areaMap[areaId].getLordLastid(uid)
	else 
		hId = uuid.v1()
	var heroInfo = {id : id,ad : ad,lv : lv,star : star,evo : 0}
	this.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
	this.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo)
	heroInfo.hId = hId
	if(!otps.robot){
		this.areaManager.areaMap[areaId].taskUpdate(uid,"hero",1,star)
		this.updateHeroArchive(areaId,uid,id,star)
	}
	if(cb)
		cb(true,heroInfo)
	heroInfo.hId = hId
	return heroInfo
}
//升级英雄图鉴
heroDao.prototype.updateHeroArchive = function(areaId,uid,id,star) {
	var self = this
	self.redisDao.db.hget("player:user:"+uid+":heroArchive",id,function(err,data) {
		if(!data || star > data){
			self.redisDao.db.hset("player:user:"+uid+":heroArchive",id,star)
			self.areaManager.areaMap[areaId].checkLimitGiftStar(uid,id,star)
			var notify = {
				type : "updateHeroArchive",
				id : id,
				star : star
			}
			self.areaManager.areaMap[areaId].sendToUser(uid,notify)
			// var name = self.areaManager.areaMap[areaId].getLordAtt(uid,"name")
			// if(name){
	  //     var notify2 = {
	  //       type : "sysChat",
	  //       text : "恭喜!!!"+name+"合成出"+star+"星"+herosCfg[id].name+"英雄，实力暴涨名满三国"
	  //     }
	  //     self.areaManager.areaMap[areaId].sendAllUser(notify2)
			// }
		}
	})
}
//批量删除英雄
heroDao.prototype.removeHeroList = function(areaId,uid,hIds,cb) {
	var self = this
	var multiList = []
	for(var i = 0;i < hIds.length;i++){
		multiList.push(["hdel","player:user:"+uid+":heroMap",hIds[i]])
		multiList.push(["del","player:user:"+uid+":heros:"+hIds[i]])
	}
	self.redisDao.multi(multiList,function(err) {
		if(err){
			cb(false,err)
			return
		}
		self.areaManager.areaMap[areaId].removeCheckCoexist(uid,hIds)
		cb(true)
	})
}
//删除英雄
heroDao.prototype.removeHero = function(areaId,uid,hId,cb) {
	var self = this
	self.getHeroOne(uid,hId,function(flag,heroInfo) {
		if(!flag){
			cb(false,"英雄不存在")
			return
		}
		if(heroInfo.combat){
			cb(false,"英雄已出战")
			return
		}
		self.redisDao.db.hdel("player:user:"+uid+":heroMap",hId,function(err,data) {
			if(err || !data){
				console.error("removeHero ",err,data)
				if(cb)
					cb(false)
				return
			}
			self.redisDao.db.del("player:user:"+uid+":heros:"+hId)
			cb(true,heroInfo)
		})
	})
}
//重生返还资源  返回升级升阶法宝
heroDao.prototype.heroReset = function(areaId,uid,heroInfo,cb) {
	var lv = heroInfo.lv
	var ad = heroInfo.ad
	var artifact = heroInfo.artifact
	var strList = []
	if(lv_cfg[lv] && lv_cfg[lv].pr)
		strList.push(lv_cfg[lv].pr)
	if(hero_ad[ad] && hero_ad[ad].pr)
		strList.push(hero_ad[ad].pr)
	if(artifact !== undefined && artifact_level[artifact])
		strList.push(artifact_level[artifact]["pr"])
	if(hero_tr[heroInfo.tr_lv] && hero_tr[heroInfo.tr_lv]["pr"])
		strList.push(hero_tr[heroInfo.tr_lv]["pr"])
	for(var part = 1;part <= 4;part++)
		if(heroInfo["et"+part])
			strList.push(equip_st[heroInfo["et"+part]]["pr"])
	var str = this.areaManager.areaMap[areaId].mergepcstr(strList)
	var awardList = this.areaManager.areaMap[areaId].addItemStr(uid,str,1,"重生返还")
	if(cb)
		cb(true,awardList)
}
//分解返还资源   返还全部
heroDao.prototype.heroPrAll = function(areaId,uid,heros,hIds,cb) {
	var strList = []
	for(let i = 0;i < heros.length;i++){
		let star = heros[i].star
		if(star_base[star] && star_base[star].pr)
			strList.push(star_base[star].pr)
	}
	var str = this.areaManager.areaMap[areaId].mergepcstr(strList)
	var awardList = this.areaManager.areaMap[areaId].addItemStr(uid,str,1,"分解英雄")
	this.areaManager.areaMap[areaId].taskUpdate(uid,"resolve",heros.length)
	this.heroPrlvadnad(areaId,uid,heros,hIds,function(flag,awardList2) {
	if(cb)
		cb(true,awardList2.concat(awardList))
	})
}
//材料返还资源  返还除升星外(升级  升阶 装备 锦囊 神兵 宝石 护符 战马 战鼓 军旗)
heroDao.prototype.heroPrlvadnad = function(areaId,uid,heros,hIds,cb) {
	var strList = []
	for(var i = 0;i < heros.length;i++){
		var id = heros[i].id
		var lv = heros[i].lv
		var ad = heros[i].ad
		var artifact = heros[i].artifact
		if(lv_cfg[lv] && lv_cfg[lv].pr)
			strList.push(lv_cfg[lv].pr)
		if(hero_ad[ad] && hero_ad[ad].pr)
			strList.push(hero_ad[ad].pr)
		if(hero_tr[heros[i].tr_lv] && hero_tr[heros[i].tr_lv]["pr"])
			strList.push(hero_tr[heros[i].tr_lv]["pr"])
		for(var part = 1;part <= 4;part++){
			if(heros[i]["e"+part]){
				var oldeId = equip_level[heros[i]["e"+part]]["part_"+part]
				strList.push(oldeId+":"+1)
			}
		}
		for(var part = 1;part <= 4;part++)
			if(heros[i]["et"+part])
				strList.push(equip_st[heros[i]["et"+part]]["pr"])
		for(var j = 0;j <= 10;j++){
			if(heros[i]["a"+j])
				strList.push(heros[i]["a"+j]+":1")
		}
		if(artifact !== undefined && artifact_level[artifact]){
			strList.push(artifact_level[artifact]["pr"])
		}
		for(var j = 1;j <= 8;j++){
			var key = "s"+j
			if(heros[i][key]){
				//拆卸宝石
				strList.push(heros[i][key]+":1")
				if(heros[i][key+"v"] && stone_base[heros[i][key]]){
					var num = Math.floor(heros[i][key+"v"] / stone_base[baseStone[j]]["value"])
					strList.push(baseStone[j]+":"+num)
				}
			}
		}
		if(heros[i]["zf_2"])
			strList.push(star_base[10].pr)
		if(heros[i]["zf_3"]){
			strList.push(star_base[10].pr)
			strList.push(star_base[10].pr)
		}
		if(heros[i]["hfLv"]){
			var hufuInfo = {lv:heros[i]["hfLv"]}
			if(heros[i]["hfs1"])
				hufuInfo.s1 = heros[i]["hfs1"]
			if(heros[i]["hfs2"])
				hufuInfo.s2 = heros[i]["hfs2"]
			this.areaManager.areaMap[areaId].gainHufu(uid,hufuInfo)
		}
		if(heros[i]["horse"]){
			var horseInfo = JSON.parse(heros[i]["horse"])
			this.areaManager.areaMap[areaId].gainHorse(uid,horseInfo)
		}
		if(heros[i]["drum"]){
			var drumInfo = JSON.parse(heros[i]["drum"])
			this.areaManager.areaMap[areaId].gainDrum(uid,drumInfo)
		}
		if(heros[i]["banner"]){
			var bannerInfo = JSON.parse(heros[i]["banner"])
			this.areaManager.areaMap[areaId].gainBanner(uid,bannerInfo)
		}
		if(heros[i]["evo"])
			strList.push(evolutionCfg[heros[i]["evo"]].pr)
		for(var j = 1;j <= 4;j++){
			var key = "fs"+j
			if(heros[i][key]){
				//拆卸符石
				var fslv = hufu_map[heros[i][key]]["lv"]
				strList.push("2000060:"+hufu_lv[fslv]["pr"])
			}
		}
		if(heros[i]["fs5"])
			strList.push("2000100:1")
		this.areaManager.areaMap[areaId].remove_heroRank(uid,id,hIds[i])
	}
	if(strList.length){
		var str = this.areaManager.areaMap[areaId].mergepcstr(strList)
		var awardList = this.areaManager.areaMap[areaId].addItemStr(uid,str,1,"材料返还")
		if(cb)
			cb(true,awardList)
	}else{
		if(cb)
			cb(true,[])
	}
}
//修改英雄属性
heroDao.prototype.incrbyHeroInfo = function(areaId,uid,hId,name,value,cb) {
	var self = this
	this.redisDao.db.hincrby("player:user:"+uid+":heros:"+hId,name,value,function(err,data) {
		if(err)
			console.error(err)
		else{
			if(self.areaManager.areaMap[areaId]){
				switch(name){
					case "star":
						self.areaManager.areaMap[areaId].taskUpdate(uid,"hero",1,data)
						self.getHeroInfo(uid,hId,"id",function(id) {
							self.updateHeroArchive(areaId,uid,id,data)
						})
					break
					case "lv":
						self.areaManager.areaMap[areaId].taskUpdate(uid,"heroLv",1,data)
						self.areaManager.areaMap[areaId].checkCoexistMap(uid,hId,data)
						if(self.areaManager.areaMap[areaId].players[uid] && self.areaManager.areaMap[areaId].players[uid]["heroLv"] < data)
							self.areaManager.areaMap[areaId].chageLordData(uid,"heroLv",data)
					break
					case "ad":
						self.areaManager.areaMap[areaId].taskUpdate(uid,"heroAd",1,data)
					break
				}
				self.areaManager.areaMap[areaId].incrbyCEInfo(uid,hId,name,value)
				self.updateHeroCe(areaId,uid,hId)
			}
		}
		if(cb)
			cb(true,data)
	})
}
//设置英雄属性
heroDao.prototype.setHeroInfo = function(areaId,uid,hId,name,value,cb) {
	var self = this
	this.redisDao.db.hset("player:user:"+uid+":heros:"+hId,name,value,function(err,data) {
		if(err){
			console.error(err)
			if(cb)
				cb(false,err)
		}
		else{
			self.areaManager.areaMap[areaId].setCEInfo(uid,hId,name,value)
			self.updateHeroCe(areaId,uid,hId)
			if(cb)
				cb(true,data)
		}
	})
}
heroDao.prototype.setHMHeroInfo = function(areaId,uid,hId,obj,cb) {
	var self = this
	this.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,obj,function(err,data) {
		if(err){
			console.error(err)
			if(cb)
				cb(false,err)
		}else{
			for(var i in obj)
				self.areaManager.areaMap[areaId].setCEInfo(uid,hId,i,obj[i])
			self.areaManager.areaMap[areaId].removeCheckCoexist(uid,[hId])
			self.updateHeroCe(areaId,uid,hId)
			if(cb)
				cb(true,data)
		}
	})
}
//获取英雄属性
heroDao.prototype.getHeroInfo = function(uid,hId,name,cb) {
	this.redisDao.db.hget("player:user:"+uid+":heros:"+hId,name,function(err,data) {
		cb(data)
	})
}
//删除英雄属性
heroDao.prototype.delHeroInfo = function(areaId,uid,hId,name,cb) {
	var self = this
	this.redisDao.db.hdel("player:user:"+uid+":heros:"+hId,name,function(err,data) {
		if(err)
			console.error(err)
		else{
			self.areaManager.areaMap[areaId].delCEInfo(uid,hId,name)
			self.updateHeroCe(areaId,uid,hId)
		}
		if(cb)
			cb(true,data)
	})
}
//获取英雄列表
heroDao.prototype.getHeros = function(uid,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+uid+":heroMap",function(err,data) {
		if(err || !data){
			cb(true,{})
			return
		}
		var multiList = []
		var hIds = []
		for(var hId in data){
			hIds.push(hId)
			multiList.push(["hgetall","player:user:"+uid+":heros:"+hId])
		}
		self.redisDao.multi(multiList,function(err,list) {
			var hash = {}
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
				list[i].hId = hIds[i]
				hash[list[i].hId] = list[i]
			}
			cb(true,hash)
		})
	})
}
//更新英雄战力
heroDao.prototype.updateHeroCe = function(areaId,uid,hId) {
	var self = this
	self.getHeroOne(uid,hId,function(flag,data) {
		if(flag && data){
			var ce = self.areaManager.areaMap[areaId].fightContorl.getTeamCE([data,0,0,0,0,0])
			if(ce >= 200000){
				self.areaManager.areaMap[areaId].update_heroRank(uid,data.id,hId,ce)
			}else{
				self.areaManager.areaMap[areaId].remove_heroRank(uid,data.id,hId)
			}
		}
	})
}
//获取单个英雄
heroDao.prototype.getHeroOne = function(uid,hId,cb) {
	this.redisDao.db.hgetall("player:user:"+uid+":heros:"+hId,function(err,data) {
		if(err || !data){
			cb(false,err)
		}else{
			for(var j in data){
				var tmp = Number(data[j])
				if(tmp == data[j])
					data[j] = tmp
			}
			cb(true,data)
		}
	})
}
//获取指定英雄列表
heroDao.prototype.getHeroList = function(uid,hIds,cb) {
	if(!hIds || !hIds.length){
		cb(true,[])
		return
	}
	var multiList = []
	for(var i = 0;i < hIds.length;i++){
		multiList.push(["hgetall","player:user:"+uid+":heros:"+hIds[i]])
	}
	this.redisDao.multi(multiList,function(err,list) {
		if(err){
			cb(false,err)
			return
		}
		for(var i = 0;i < list.length;i++){
			if(list[i]){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
			}else{
				list[i] = 0
			}
		}
		cb(true,list)
	})
}
//获取不同玩家指定英雄列表
heroDao.prototype.getDiffHeroList = function(uids,hIds,cb) {
	if(!uids || !hIds || !hIds.length || hIds.length != uids.length){
		cb(true,[])
		return
	}
	var multiList = []
	for(var i = 0;i < hIds.length;i++){
		multiList.push(["hgetall","player:user:"+uids[i]+":heros:"+hIds[i]])
	}
	this.redisDao.multi(multiList,function(err,list) {
		if(err){
			cb(false,err)
			return
		}
		for(var i = 0;i < list.length;i++){
			for(var j in list[i]){
				var tmp = Number(list[i][j])
				if(tmp == list[i][j])
					list[i][j] = tmp
			}
		}
		cb(true,list)
	})
}
//批量获取指定英雄列表
heroDao.prototype.getMultiHeroList = function(uids,hIdsList,cb) {
	var self = this
	var multiList = []
	for(var i = 0;i < uids.length;i++){
		var hIds = JSON.parse(hIdsList[i])
		if(!hIds){
			console.log("hIds error ",hIds,uids,hIdsList)
			hIds = [0,0,0,0,0,0]
		}
		for(var j = 0;j < hIds.length;j++)
			multiList.push(["hgetall","player:user:"+uids[i]+":heros:"+hIds[j]])
	}
	var teams = []
	self.redisDao.multi(multiList,function(err,list) {
		if(err){
			cb(false,err)
			return
		}
		for(var i = 0;i < list.length;i++){
			for(var j in list[i]){
				var tmp = Number(list[i][j])
				if(tmp == list[i][j])
					list[i][j] = tmp
			}
		}
		for(var i = 0;i < uids.length;i++){
			teams.push(list.splice(0,6))
		}
		multiList = []
		for(var i = 0;i < uids.length;i++){
			multiList.push(["hmget","player:user:"+uids[i]+":guild",["skill_1","skill_2","skill_3","skill_4"]])
		}
		self.redisDao.multi(multiList,function(err,list) {
			if(err){
				cb(false,err)
				return
			}
			for(var i = 0;i < uids.length;i++){
				var info = {
					"g1" : Number(list[i][0]) || 0,
					"g2" : Number(list[i][1]) || 0,
					"g3" : Number(list[i][2]) || 0,
					"g4" : Number(list[i][3]) || 0
				}
				teams[i][6] = info
			}
		})
		cb(true,teams)
	})
}
//获取英雄图鉴
heroDao.prototype.getHeroArchive = function(uid,cb) {
	this.redisDao.db.hgetall("player:user:"+uid+":heroArchive",function(err,data) {
		if(err || !data){
			cb(true,{})
		}else{
			cb(true,data)
		}
	})
}
//设置出场阵容
heroDao.prototype.setFightTeam = function(areaId,uid,hIds,cb) {
	var self = this
	self.getHeroList(uid,hIds,function(flag,heroList) {
		if(!flag || !heroList){
			cb(false,"阵容错误")
			return
		}
		for(var i = 0;i < heroList.length;i++){
			if(hIds[i] && !heroList[i]){
				cb(false,"武将不存在"+hIds[i])
				return
			}
		}
		self.getFightTeam(uid,function(flag,team) {
			if(flag && team){
				for(var i = 0;i < team.length;i++){
					if(team[i])
						self.delHeroInfo(areaId,uid,team[i].hId,"combat")
				}
			}
			self.redisDao.db.set("player:user:"+uid+":fightTeam",JSON.stringify(hIds),function(err,data) {
				if(err){
					if(cb)
						cb(false,err)
				}
				else{
					for(var i = 0;i < heroList.length;i++){
						if(hIds[i]){
							self.incrbyHeroInfo(areaId,uid,hIds[i],"combat",1)
						}
					}
					if(self.areaManager.areaMap[areaId]){
						self.areaManager.areaMap[areaId].CELoad(uid)
						self.areaManager.areaMap[areaId].taskUpdate(uid,"battleNum",1,self.areaManager.areaMap[areaId].getTeamNum(uid))
					}
					if(cb)
						cb(true)
				}
			})
		})
	})
}
//获取出场阵容
heroDao.prototype.getFightTeam = function(uid,cb) {
	var self = this
	var fightTeam = []
	async.waterfall([
		function(next) {
			self.redisDao.db.get("player:user:"+uid+":fightTeam",function(err,data) {
				if(err || !data){
					next("未设置阵容")
					return
				}
				fightTeam = JSON.parse(data)
				var multiList = []
				var hIds = []
				for(var i = 0;i < fightTeam.length;i++){
					if(fightTeam[i]){
						hIds.push(fightTeam[i])
						multiList.push(["hgetall","player:user:"+uid+":heros:"+fightTeam[i]])
					}
				}
				self.redisDao.multi(multiList,function(err,list) {
					var hash = {}
					for(var i = 0;i < list.length;i++){
						for(var j in list[i]){
							var tmp = Number(list[i][j])
							if(tmp == list[i][j])
								list[i][j] = tmp
						}
						list[i].hId = hIds[i]
						hash[list[i].hId] = list[i]
					}
					for(var i = 0;i < fightTeam.length;i++){
						if(hash[fightTeam[i]]){
							fightTeam[i] = hash[fightTeam[i]]
						}else{
							fightTeam[i] = null
						}
					}
					next(null)
				})
			})
		},
		function(next) {
			//天书
			self.getFightBook(uid,function(flag,data) {
				fightTeam[6] = data
				next()
			})
		},
		function(next) {
			//主动技能
			self.getFightPower(uid,function(powers,manualModel) {
				for(var i in powers)
					fightTeam[6][i] = powers[i]
				fightTeam[6]["manualModel"] = Number(manualModel) || 0
				next()
			})
		},
		function(next) {
			//红颜技能
			self.getBeautys(uid,function(beautys) {
				Object.assign(fightTeam[6],beautys)
				next()
			})
		},
		function(next) {
			//称号
			self.redisDao.db.hget("player:user:"+uid+":playerInfo","title",function(err,data) {
				if(data)
					fightTeam[6]["title"] = data
				next()
			})
		},
		function(next) {
			//官职
			self.redisDao.db.hget("player:user:"+uid+":playerInfo","officer",function(err,data) {
				if(data)
					fightTeam[6]["officer"] = data
				next()
			})
		},
		function(next) {
			//图鉴值
			self.redisDao.db.hget("player:user:"+uid+":playerInfo","gather",function(err,data) {
				if(data)
					fightTeam[6]["gather"] = data
				next()
			})
		},
		function(next) {
			//阵营加成
			self.redisDao.db.hmget("player:user:"+uid+":playerInfo",["camp_1","camp_2","camp_3","camp_4","camp_5"],function(err,data) {
				if(data){
					fightTeam[6]["camp_1"] = Number(data[0]) || 0
					fightTeam[6]["camp_2"] = Number(data[1]) || 0
					fightTeam[6]["camp_3"] = Number(data[2]) || 0
					fightTeam[6]["camp_4"] = Number(data[3]) || 0
					fightTeam[6]["camp_5"] = Number(data[4]) || 0
				}
				next()
			})
		},
		function(next) {
			//家园建筑
			self.redisDao.db.hmget("player:user:"+uid+":manor",["gjy","dby","qby"],function(err,data) {
				if(data){
					fightTeam[6]["gjy"] = Number(data[0]) || 0
					fightTeam[6]["dby"] = Number(data[1]) || 0
					fightTeam[6]["qby"] = Number(data[2]) || 0
				}
				next()
			})
		},
		function(next) {
			//共鸣等级
			self.redisDao.db.hget("player:user:"+uid+":playerInfo","coexist",function(err,data) {
				fightTeam[6]["coexist"] = data || 0
				next()
			})
		},
		function(next) {
			//公会技能
			self.redisDao.db.hmget("player:user:"+uid+":guild",["skill_1","skill_2","skill_3","skill_4"],function(err,data) {
				if(data){
					fightTeam[6]["g1"] = Number(data[0]) || 0
					fightTeam[6]["g2"] = Number(data[1]) || 0
					fightTeam[6]["g3"] = Number(data[2]) || 0
					fightTeam[6]["g4"] = Number(data[3]) || 0
				}
				cb(true,fightTeam)
			})
		}
	],function(err) {
		cb(false,err)
	})
}
//获取出战天书
heroDao.prototype.getFightBook = function(uid,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+uid+":book_fight",function(err,fightBooks) {
		if(!fightBooks){
			cb(true,{})
		}else{
			self.redisDao.db.hgetall("player:user:"+uid+":book",function(err,books) {
				var info = {}
				for(var i in fightBooks){
					var type = fightBooks[i]
					if(type)
						info[type] = {lv : Number(books[type+"_lv"]),star : Number(books[type+"_star"])}
				}
				cb(true,info)
			})
		}
	})
}
//获取主动技能
heroDao.prototype.getFightPower = function(uid,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+uid+":power",function(err,data) {
		if(!data || !data.fightMap){
			cb({},0)
		}else{
			var fightMap = JSON.parse(data.fightMap)
			var index = 0
			var powers = {}
			for(var i in fightMap){
				var id = fightMap[i]
				var lv = Number(data[id+"_lv"])
				var ad = Number(data[id+"_ad"])
				var star = Number(data[id+"_star"])
				if(lv && ad && star){
					var powerInfo = {id : id,lv:lv,ad:ad,star:star}
					index++
					powers["power"+index] = powerInfo
				}
			}
			cb(powers,data.manualModel)
		}
	})
}
//获取红颜技能
heroDao.prototype.getBeautys = function(uid,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+uid+":beaut",function(err,data) {
		if(!data){
			cb({},0)
		}else{
			var beautys = {}
			for(var id in beauty_base){
				if(data[id+"_star"]){
					var ad = Number(data[id+"_ad"])
					var star = Number(data[id+"_star"])
					var att1 = Number(data[id+"_att1"])
					var att2 = Number(data[id+"_att2"])
					var att3 = Number(data[id+"_att3"])
					var att4 = Number(data[id+"_att4"])
					var opinion = Number(data[id+"_opinion"])
					var beautyInfo = {id : id,ad:ad,star:star,att1:att1,att2:att2,att3:att3,att4:att4,opinion:opinion}
					beautys["beaut_"+id] = beautyInfo
				}
			}
			if(data["bcombat"])
				beautys["bcombat"] = data["bcombat"] 
			cb(beautys)
		}
	})
}
//设置逐鹿之战出场阵容
heroDao.prototype.setZhuluTeam = function(areaId,uid,hIds,cb) {
	var self = this
	self.getHeroList(uid,hIds,function(flag,heroList) {
		if(!flag || !heroList){
			cb(false,"阵容错误")
			return
		}
		for(var i = 0;i < heroList.length;i++){
			if(hIds[i] && !heroList[i]){
				cb(false,"武将不存在"+hIds[i])
				return
			}
		}
		self.redisDao.db.set("player:user:"+uid+":zhuluTeam",JSON.stringify(hIds),function(err,data) {
			if(err)
				cb(false,err)
			else
				cb(true)
		})
		// self.getZhuluTeam(uid,function(flag,team) {
		// 	if(flag && team){
		// 		for(var i = 0;i < team.length;i++){
		// 			if(team[i])
		// 				self.delHeroInfo(areaId,uid,team[i].hId,"zhuluCombat")
		// 		}
		// 	}
		// 	self.redisDao.db.set("player:user:"+uid+":zhuluTeam",JSON.stringify(hIds),function(err,data) {
		// 		if(err){
		// 			if(cb)
		// 				cb(false,err)
		// 		}
		// 		else{
		// 			for(var i = 0;i < heroList.length;i++){
		// 				if(hIds[i]){
		// 					self.incrbyHeroInfo(areaId,uid,hIds[i],"zhuluCombat",1)
		// 				}
		// 			}
		// 			self.areaManager.areaMap[areaId].CELoad(uid)
		// 			if(cb)
		// 				cb(true)
		// 		}
		// 	})
		// })
	})
}
//获取逐鹿出场阵容
heroDao.prototype.getZhuluTeam = function(uid,cb) {
	var self = this
	self.redisDao.db.get("player:user:"+uid+":zhuluTeam",function(err,data) {
		if(err || !data){
			cb(false,"未设置阵容")
			return
		}
		var zhuluTeam = JSON.parse(data)
		var multiList = []
		var hIds = []
		for(var i = 0;i < zhuluTeam.length;i++){
			if(zhuluTeam[i]){
				hIds.push(zhuluTeam[i])
				multiList.push(["hgetall","player:user:"+uid+":heros:"+zhuluTeam[i]])
			}
		}
		self.redisDao.multi(multiList,function(err,list) {
			var hash = {}
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
				if(list[i]){
					list[i].hId = hIds[i]
					hash[list[i].hId] = list[i]
				}
			}
			for(var i = 0;i < zhuluTeam.length;i++){
				zhuluTeam[i] = hash[zhuluTeam[i]]
			}
			cb(true,zhuluTeam)
		})
	})
}
module.exports = {
	id : "heroDao",
	func : heroDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "areaManager",
		ref : "areaManager"
	}]
}