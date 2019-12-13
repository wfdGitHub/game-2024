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
	let ad = otps.ad || 0
	let lv = otps.lv || 1
	let exp = otps.exp || 0
	if(!herosCfg[id]){
		console.log("id error by herosCfg",id)
		cb(false,"id error by herosCfg",id)
		return
	}
	var self = this
	self.getHeroAmount(areaId,uid,function(flag,maxAmount) {
		maxAmount = Number(data)
		self.redisDao.db.hlen("area:area"+areaId+":player:"+uid+":heros",function(err,curAmount) {
			if(!err && curAmount){
				curAmount = Number(curAmount)
			}
			if(curAmount >= maxAmount){
				if(cb)
					cb(false,"amount over maxAmount"+curAmount+" "+maxAmount)
				return
			}
			var heroInfo = {id : id,ad : ad,lv : lv,exp : exp}
			self.redisDao.db.hmset("area:area"+areaId+":player:"+uid+":heros",id,heroInfo)
			self.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":heroArchive",id,1)
			cb(true,heroInfo)
		})
	})
}
//删除英雄
heroDao.prototype.removeHero = function(areaId,uid,id,cb) {
	this.redisDao.db.hdel("area:area"+areaId+":player:"+uid+":heros",id,function(err,data) {
		console.log("removePet",err,data)
		if(err || !data){
			if(cb)
				cb(false)
		}else{
			if(cb)
				cb(true)
		}
	})
}
//修改英雄属性
heroDao.prototype.incrbyHeroInfo = function(areaId,uid,id,name,value,cb) {
	this.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":heros:"+id,name,value,function(err,data) {
		if(err)
			console.log(err)
		if(cb)
			cb(true,data)
	})
}
//获取英雄列表
heroDao.prototype.getHeros = function(areaId,uid,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+areaId+":player:"+uid+":heros",function(err,data) {
		if(err || !data){
			cb(true,{})
		}else{
			for(var i in data){
				var tmp = Number(data[i])
				if(tmp == data[i])
					data[i] = tmp
			}
			cb(true,data)
		}
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
module.exports = {
	id : "heroDao",
	func : heroDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}