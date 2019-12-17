//英雄DB
var uuid = require("uuid")
var herosCfg = require("../../config/gameCfg/heros.json")
var heroDao = function() {}
//增加英雄背包栏
heroDao.prototype.addHeroAmount = function(areaId,uid,cb) {
	this.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":playerInfo","heroAmount",1,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//获取英雄背包栏数量
heroDao.prototype.getHeroAmount = function(areaId,uid,cb) {
	this.redisDao.db.hget("area:area"+areaId+":player:"+uid+":playerInfo","heroAmount",function(err,data) {
		if(err || !data)
			cb(true,0)
		else
			cb(true,Number(data))
	})
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
	var self = this
	self.getHeroAmount(areaId,uid,function(flag,maxAmount) {
		maxAmount = Number(maxAmount)
		self.redisDao.db.hlen("area:area"+areaId+":player:"+uid+":heroMap",function(err,curAmount) {
			if(!err && curAmount){
				curAmount = Number(curAmount)
			}
			if(curAmount >= maxAmount){
				if(cb)
					cb(false,"amount over maxAmount"+curAmount+" "+maxAmount)
				return
			}
			var hId = uuid.v1()
			var heroInfo = {id : id,ad : ad,lv : lv,star : star}
			self.redisDao.db.hset("area:area"+areaId+":player:"+uid+":heroMap",hId,Date.now())
			self.redisDao.db.hmset("area:area"+areaId+":player:"+uid+":heros:"+hId,heroInfo)
			self.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":heroArchive",id,1)
			heroInfo.hId = hId
			if(cb)
				cb(true,heroInfo)
		})
	})
}
//删除英雄
heroDao.prototype.removeHero = function(areaId,uid,hId,cb) {
	var self = this
	self.redisDao.db.hdel("area:area"+areaId+":player:"+uid+":heroMap",hId,function(err,data) {
		if(err || !data){
			console.error("removeHero ",err,data)
			if(cb)
				cb(false)
			return
		}
		self.redisDao.db.del("area:area"+areaId+":player:"+uid+":heros:"+hId)
		if(cb)
			cb(true)
	})
}
//修改英雄属性
heroDao.prototype.incrbyHeroInfo = function(areaId,uid,hId,name,value,cb) {
	this.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":heros:"+hId,name,value,function(err,data) {
		if(err)
			console.log(err)
		if(cb)
			cb(true,data)
	})
}
//获取英雄列表
heroDao.prototype.getHeros = function(areaId,uid,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+areaId+":player:"+uid+":heroMap",function(err,data) {
		if(err || !data){
			cb(true,{})
			return
		}
		var multiList = []
		var hIds = []
		for(var hId in data){
			hIds.push(hId)
			multiList.push(["hgetall","area:area"+areaId+":player:"+uid+":heros:"+hId])
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
//获取英雄图鉴
heroDao.prototype.getHeroArchive = function(areaId,uid,cb) {
	this.redisDao.db.hgetall("area:area"+areaId+":player:"+uid+":heroArchive",function(err,data) {
		if(err || !data){
			cb(true,{})
		}else{
			cb(true,data)
		}
	})
}
//设置出场阵容
heroDao.prototype.setFightTeam = function(areaId,uid,hIds,cb) {
	this.redisDao.db.hset("area:area"+areaId+":player:"+uid,"fightTeam",JSON.stringify(hIds),function(err,data) {
		if(err){
			if(cb)
				cb(false,err)
		}
		else{
			if(cb)
				cb(true)
		}
	})
}
//获取出场阵容
heroDao.prototype.getFightTeam = function(areaId,uid,cb) {
	var self = this
	self.redisDao.db.hget("area:area"+areaId+":player:"+uid,"fightTeam",function(err,data) {
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
				multiList.push(["hgetall","area:area"+areaId+":player:"+uid+":heros:"+fightTeam[i]])
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
module.exports = {
	id : "heroDao",
	func : heroDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}