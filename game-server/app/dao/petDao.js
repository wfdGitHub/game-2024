var characterFun = require("../domian/entity/character.js")
var charactersCfg = require("../../config/gameCfg/characters.json")
var petCfg = require("../../config/gameCfg/pet.json")
var uuid = require("uuid")
//宠物DB
var petDao = function() {}
//增加宠物栏
petDao.prototype.addPetAmount = function(areaId,uid,cb) {
	this.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":playerInfo","petAmount",1,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//玩家获得宠物
petDao.prototype.obtainPet = function(areaId,uid,characterId,cb) {
	if(!charactersCfg[characterId]){
		console.log("characterId error by charactersCfg")
		if(cb)
			cb(false,"characterId error by charactersCfg")
		return
	}
	var petInfo = this.createPet(characterId)
	if(!petInfo){
		if(cb)
			cb(false,"characterId error by petCfg")
		return
	}
	var self = this
	var maxAmount = 0
	var curAmount = 0
	self.redisDao.db.hget("area:area"+areaId+":player:"+uid+":playerInfo","petAmount",function(err,data) {
		if(err || !data){
			cb(false,"amount error "+data)
			return
		}
		maxAmount = parseInt(data)
		self.redisDao.db.hlen("area:area"+areaId+":player:"+uid+":petMap",function(err,data) {
			if(!err && data){
				curAmount = parseInt(data)
			}
			if(curAmount >= maxAmount){
				cb(false,"amount over maxAmount"+curAmount+" "+maxAmount)
				return
			}
			self.redisDao.db.hset("area:area"+areaId+":player:"+uid+":petMap",petInfo.id,Date.now())
			self.redisDao.db.hmset("area:area"+areaId+":player:"+uid+":petList:"+petInfo.id,petInfo)
			cb(true,petInfo)
		})
	})
}
//创建宠物
petDao.prototype.createPet = function(characterId) {
	if(!petCfg[characterId]){
		console.log("characterId error by petCfg")
		return false
	}
	var petInfo = {
		characterId : characterId,
		id : uuid.v1()
	}
	petInfo.strAptitude = Math.floor(Math.random() * (petCfg[characterId].maxstr - petCfg[characterId].minstr) + petCfg[characterId].minstr) || 0
	petInfo.agiAptitude = Math.floor(Math.random() * (petCfg[characterId].maxagi - petCfg[characterId].minagi) + petCfg[characterId].minagi) || 0
	petInfo.vitAptitude = Math.floor(Math.random() * (petCfg[characterId].maxvit - petCfg[characterId].minvit) + petCfg[characterId].minvit) || 0
	petInfo.phyAptitude = Math.floor(Math.random() * (petCfg[characterId].maxphy - petCfg[characterId].minphy) + petCfg[characterId].minphy) || 0
	petInfo.growth = Number((Math.random() * (petCfg[characterId].maxgrowth - petCfg[characterId].mingrowth) + petCfg[characterId].mingrowth).toFixed(2))
	return petInfo
}
//获取宠物列表
petDao.prototype.getPets = function(areaId,uid,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+areaId+":player:"+uid+":petMap",function(err,data) {
		console.log("data111",data)
		if(err || !data){
			cb({})
			return
		}
		var multiList = []
		for(var id in data){
			multiList.push(["hgetall","area:area"+areaId+":player:"+uid+":petList:"+id])
		}
		self.redisDao.multi(multiList,function(err,list) {
			var hash = {}
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					list[i][j] = Number(list[i][j]) || list[i][j]
				}
				hash[list[i].id] = list[i]
			}
			cb(hash)
		})
	})
}
//移除宠物
petDao.prototype.removePet = function(areaId,uid,id,cb) {
	var self = this
	self.redisDao.db.hdel("area:area"+areaId+":player:"+uid+":petMap",id,function(err,data) {
		console.log("removePet",err,data)
		if(err || !data){
			cb(false)
			return
		}
		self.redisDao.db.del("area:area"+areaId+":player:"+uid+":petList:"+id)
		cb(true)
	})
}
//设置出战宠物
petDao.prototype.setFightPet = function(areaId,uid,id,cb) {
	var self = this
	self.redisDao.db.hexists("area:area"+areaId+":player:"+uid+":petMap",id,function(err,data) {
		if(err || !data){
			console.log(err,data)
			cb(false)
			return
		}
		self.redisDao.db.hset("area:area"+areaId+":player:"+uid+":playerInfo","fightPet",id,function(err,data) {
			cb(true)
		})
	})
}
//宠物休息
petDao.prototype.petRest = function(areaId,uid,cb) {
	var self = this
	self.redisDao.db.hdel("area:area"+areaId+":player:"+uid+":playerInfo","fightPet",function(err,data) {
		cb(true)
	})
}
//宠物进阶

//宠物升级

//宠物转生

//宠物洗练

module.exports = {
	id : "petDao",
	func : petDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}


petDao.prototype.createPet(13001)