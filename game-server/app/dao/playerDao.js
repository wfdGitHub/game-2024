var bearcat = require("bearcat")
const VIP = require("../../config/gameCfg/VIP.json")
var playerDao = function() {}
var beginHero = 304040//205070
var vipLv = 10
//创建角色
playerDao.prototype.createPlayer = function(otps,cb) {
	var playerInfo = {
		accId : otps.accId,
		areaId : otps.areaId,
		name : otps.name,
		head : beginHero,
		createTime : Date.now(),
		real_rmb : 0,
		real_day : 0, 
		real_week : 0,
		rmb : 0,
		rmb_day : 0,
		week_rmb : 0,
		vip : vipLv,
		vip_exp: VIP[vipLv]["rmb"],
		exp : 0,
		level : 1,
		heroAmount : 100,
		heroLv : 1,
		maxSS : 0,
		dayStr : 0,
		weekStr : 0,
		r_luck : Math.floor(Math.random() * 3) + 20,
		freeze : 0
	}
	var self = this
	self.redisDao.db.hincrby("area:area"+otps.areaId+":areaInfo","playerAmount",1)
	self.redisDao.db.incrby("user:lastid",1,function(err,uid) {
		uid = parseInt(uid)
		playerInfo.uid = uid
		playerInfo.CE = 0
		self.redisDao.db.hset("acc:user:"+playerInfo.accId+":playerMap",uid,otps.areaId)
		self.redisDao.db.hset("acc:user:"+playerInfo.accId+":areaMap",otps.areaId,uid)
		self.redisDao.db.hmset("player:user:"+uid+":playerInfo",playerInfo,function(err,data) {
			if(!err){
				self.redisDao.db.hset("game:nameMap",otps.name,uid)
				self.heroDao.gainHero(otps.areaId,uid,{id : beginHero},function(flag,heroInfo) {
					self.heroDao.setFightTeam(otps.areaId,uid,[null,heroInfo.hId,null,null,null,null])
				})
				cb(playerInfo)
			}else{
				cb(false)
			}
		})
	})
}
//获取角色列表
playerDao.prototype.getPlayerList = function(otps,cb) {
	var accId = otps.accId
	this.redisDao.db.hgetall("acc:user:"+accId+":areaMap",function(err,list) {
		cb(true,list || {})
	})
}
//获取所在服务器角色UID
playerDao.prototype.getUidByAreaId = function(otps,cb) {
	var accId = otps.accId
	var areaId = otps.areaId
	this.redisDao.db.hget("acc:user:"+accId+":areaMap",areaId,function(err,uid) {
		if(err || !uid){
			cb(false)
		}else{
			cb(true,Number(uid))
		}
	})
}
//获取角色信息
playerDao.prototype.getPlayerInfo = function(otps,cb) {
	var self = this
	self.redisDao.db.hgetall("player:user:"+otps.uid+":playerInfo",function(err,playerInfo) {
		if(err || !playerInfo){
			cb(false)
		}else{
			for(var i in playerInfo){
				var tmp = Number(playerInfo[i])
				if(tmp == playerInfo[i])
					playerInfo[i] = tmp
			}
			cb(playerInfo)
		}
	})
}
//获取角色所在服务器
playerDao.prototype.getPlayerAreaId = function(uid,cb) {
	var self = this
	self.redisDao.db.hget("player:user:"+uid+":playerInfo","areaId",function(err,areaId) {
		if(err || !areaId){
			cb(false,err)
		}else{
			cb(true,Number(areaId))
		}
	})
}
//设置角色数据
playerDao.prototype.setPlayerInfo = function(otps,cb) {
	var self = this
	self.redisDao.db.hset("player:user:"+otps.uid+":playerInfo",otps.key,otps.value,function(err) {
		if(!err){
			if(cb)
				cb(true)
		}else{
			if(cb)
				cb(false,err)
		}
	})
}
//检查账号是否可创建
playerDao.prototype.checkPlayerInfo = function(otps,cb) {
	var multiList = []
	multiList.push(["hexists","acc:user:"+otps.accId+":areaMap",otps.areaId])
	multiList.push(["hexists","game:nameMap",otps.name])
	this.redisDao.multi(multiList,function(err,list) {
		if(list[0] !== 0){
			cb(false,"已注册账号")
		}else if(list[1] !== 0){
			otps.name = otps.name + (Math.floor(Math.random() * 90000) + 10000)
			cb(true,otps.name)
		}else{
			cb(true,otps.name)
		}
	})
}
module.exports = {
	id : "playerDao",
	func : playerDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "heroDao",
		ref : "heroDao"
	}]
}