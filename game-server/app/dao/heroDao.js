//英雄DB
var uuid = require("uuid")
var herosCfg = require("../../config/gameCfg/heros.json")
var lv_cfg = require("../../config/gameCfg/lv_cfg.json")
var star_base = require("../../config/gameCfg/star_base.json")
var advanced_base = require("../../config/gameCfg/advanced_base.json")
var recruit_base = require("../../config/gameCfg/recruit_base.json")
var recruit_list = require("../../config/gameCfg/recruit_list.json")
var equip_base = require("../../config/gameCfg/equip_base.json")
var equip_level = require("../../config/gameCfg/equip_level.json")
var artifact_level = require("../../config/gameCfg/artifact_level.json")
var artifact_talent = require("../../config/gameCfg/artifact_talent.json")
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
var bearcat = require("bearcat")
var heroDao = function() {
}
//增加英雄背包栏
heroDao.prototype.addHeroAmount = function(areaId,uid,cb) {
	this.redisDao.db.hincrby("player:user:"+uid+":playerInfo","heroAmount",1,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//获取英雄背包栏数量
heroDao.prototype.getHeroAmount = function(areaId,uid,cb) {
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
      let rand = Math.random() * allWeight
      for(let i in weights){
        if(rand < weights[i]){
          let heroList = recruit_list[i].heroList
          let heroId = heroList[Math.floor(heroList.length * Math.random())]
          let heroInfo = this.gainHero(areaId,uid,{id : heroId})
          heroInfos.push(heroInfo)
          break
        }
      }
    }
  	return heroInfos
}
//获得英雄
heroDao.prototype.gainHero = function(areaId,uid,otps,cb) {
	let id = otps.id
	if(!herosCfg[id]){
		console.log("id error by herosCfg",id)
		if(cb)
			cb(false,"id error by herosCfg",id)
		return
	}
	let ad = otps.ad || 0
	let lv = otps.lv || 1
	let star = otps.star || herosCfg[id].min_star
	var hId = uuid.v1()
	var heroInfo = {id : id,ad : ad,lv : lv,star : star}
	this.redisDao.db.hset("player:user:"+uid+":heroMap",hId,Date.now())
	this.redisDao.db.hmset("player:user:"+uid+":heros:"+hId,heroInfo)
	this.redisDao.db.hincrby("player:user:"+uid+":heroArchive",id,1)
	heroInfo.hId = hId
	this.areaManager.areaMap[areaId].taskUpdate(uid,"hero",1,star)
	if(cb)
		cb(true,heroInfo)
	heroInfo.hId = hId
	return heroInfo
}
//批量删除英雄
heroDao.prototype.removeHeroList = function(areaId,uid,hIds,cb) {
	var multiList = []
	for(var i = 0;i < hIds.length;i++){
		multiList.push(["hdel","player:user:"+uid+":heroMap",hIds[i]])
		multiList.push(["del","player:user:"+uid+":heros:"+hIds[i]])
	}
	this.redisDao.multi(multiList,function(err) {
		if(err){
			cb(false,err)
			return
		}
		cb(true)
	})
}
//删除英雄
heroDao.prototype.removeHero = function(areaId,uid,hId,cb) {
	var self = this
	self.getHeroOne(areaId,uid,hId,function(flag,heroInfo) {
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
//分解返还资源   返还全部
heroDao.prototype.heroPrAll = function(areaId,uid,heros,cb) {
	var strList = []
	for(let i = 0;i < heros.length;i++){
		let star = heros[i].star
		if(star_base[star] && star_base[star].pr)
			strList.push(star_base[star].pr)
	}
	var str = this.areaManager.areaMap[areaId].mergepcstr(strList)
	var awardList = this.areaManager.areaMap[areaId].addItemStr(uid,str)
	this.areaManager.areaMap[areaId].taskUpdate(uid,"resolve",heros.length)
	this.heroPrlvadnad(areaId,uid,heros,function(flag,awardList2) {
	if(cb)
		cb(true,awardList2.concat(awardList))
	})
}
//材料返还资源  返还除升星外(升级  升阶 装备 锦囊 神兵)
heroDao.prototype.heroPrlvadnad = function(areaId,uid,heros,cb) {
	var strList = []
	for(let i = 0;i < heros.length;i++){
		let lv = heros[i].lv
		let ad = heros[i].ad
		let artifact = heros[i].artifact
		if(lv_cfg[lv] && lv_cfg[lv].pr)
			strList.push(lv_cfg[lv].pr)
		if(advanced_base[ad] && advanced_base[ad].pr)
			strList.push(advanced_base[ad].pr)
		for(var part = 1;part <= 4;part++){
			if(heros[i]["equip_"+part]){
				var oldeId = equip_level[heros[i]["equip_"+part]]["part_"+part]
				strList.push(oldeId+":"+1)
			}
		}
		for(var j = 0;j <= 10;j++){
			if(heros[i]["acepack_"+j])
				strList.push(heros[i]["acepack_"+j]+":1")
		}
		if(artifact !== undefined && artifact_level[artifact]){
			strList.push(artifact_level[artifact]["pr"])
		}
	}
	if(strList.length){
		var str = this.areaManager.areaMap[areaId].mergepcstr(strList)
		var awardList = this.areaManager.areaMap[areaId].addItemStr(uid,str)
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
			console.log(err)
		else
			self.areaManager.areaMap[areaId].incrbyCEInfo(uid,hId,name,value)
		if(cb)
			cb(true,data)
	})
}
//设置英雄属性
heroDao.prototype.setHeroInfo = function(areaId,uid,hId,name,value,cb) {
	var self = this
	this.redisDao.db.hset("player:user:"+uid+":heros:"+hId,name,value,function(err,data) {
		if(err)
			console.log(err)
		else
			self.areaManager.areaMap[areaId].setCEInfo(uid,hId,name,value)
		if(cb)
			cb(true,data)
	})
}
//删除英雄属性
heroDao.prototype.delHeroInfo = function(areaId,uid,hId,name,cb) {
	var self = this
	this.redisDao.db.hdel("player:user:"+uid+":heros:"+hId,name,function(err,data) {
		if(err)
			console.log(err)
		else
			self.areaManager.areaMap[areaId].delCEInfo(uid,hId,name)
		if(cb)
			cb(true,data)
	})
}
//获取英雄列表
heroDao.prototype.getHeros = function(areaId,uid,cb) {
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
//获取单个英雄
heroDao.prototype.getHeroOne = function(areaId,uid,hId,cb) {
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
heroDao.prototype.getHeroList = function(areaId,uid,hIds,cb) {
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
			for(var j in list[i]){
				var tmp = Number(list[i][j])
				if(tmp == list[i][j])
					list[i][j] = tmp
			}
		}
		cb(true,list)
	})
}
//获取英雄图鉴
heroDao.prototype.getHeroArchive = function(areaId,uid,cb) {
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
	self.getHeroList(areaId,uid,hIds,function(flag,heroList) {
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
					self.areaManager.areaMap[areaId].CELoad(uid)
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
	self.redisDao.db.get("player:user:"+uid+":fightTeam",function(err,data) {
		if(err || !data){
			cb(false,"未设置阵容")
			return
		}
		var fightTeam = JSON.parse(data)
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
				fightTeam[i] = hash[fightTeam[i]]
			}
			cb(true,fightTeam)
		})
	})
}
//设置逐鹿之战出场阵容
heroDao.prototype.setZhuluTeam = function(areaId,uid,hIds,cb) {
	var self = this
	self.getHeroList(areaId,uid,hIds,function(flag,heroList) {
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
		self.getZhuluTeam(uid,function(flag,team) {
			if(flag && team){
				for(var i = 0;i < team.length;i++){
					if(team[i])
						self.delHeroInfo(areaId,uid,team[i].hId,"zhuluCombat")
				}
			}
			self.redisDao.db.set("player:user:"+uid+":zhuluTeam",JSON.stringify(hIds),function(err,data) {
				if(err){
					if(cb)
						cb(false,err)
				}
				else{
					for(var i = 0;i < heroList.length;i++){
						if(hIds[i]){
							self.incrbyHeroInfo(areaId,uid,hIds[i],"zhuluCombat",1)
						}
					}
					self.areaManager.areaMap[areaId].CELoad(uid)
					if(cb)
						cb(true)
				}
			})
		})
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
				list[i].hId = hIds[i]
				hash[list[i].hId] = list[i]
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