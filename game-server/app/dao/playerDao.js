var playerDao = function() {}
//创建新角色
playerDao.prototype.createPlayer = function(otps) {
	var playerInfo = {
		uid : otps.uid,
		areaId : otps.areaId,
		name : otps.name
	}
	this.redisDao.db.hmset("area:area"+otps.areaId+":"+otps.uid+":playerInfo",playerInfo)
	this.heroDao.createHero({name : "游侠",heroId : 1,areaId : otps.areaId,uid : otps.uid})
	this.heroDao.createHero({name : "战士",heroId : 2,areaId : otps.areaId,uid : otps.uid})
}
//获取角色信息
playerDao.prototype.getPlayerInfo = function(otps,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+otps.areaId+":"+otps.uid+":playerInfo",function(err,playerInfo) {
		console.log(err,playerInfo)
		if(err || !playerInfo){
			cb(false)
		}else{
			self.heroDao.getHeroInfo(otps,function(heros) {
				playerInfo.heros = heros
				cb(true,playerInfo)
			})
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