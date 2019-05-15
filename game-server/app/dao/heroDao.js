var heroDao = function() {}
//创建新英雄
heroDao.prototype.createHero = function(otps) {
	var HeroInfo = {
		heroId : otps.heroId,
		name : otps.name || "英雄",
		level : otps.level || 1,
		hp : otps.hp || 100,
		mp : otps.mp || 100,
		atk : otps.atk || 10,
		def : otps.def || 0
	}
	this.redisDao.db.hmset("area:area"+otps.areaId+":player:"+otps.uid+":heroInfo:"+otps.heroId,HeroInfo)
	this.redisDao.db.hset("area:area"+otps.areaId+":player:"+otps.uid+":heroMap",otps.heroId,true)
	return HeroInfo
}
//获取英雄信息
heroDao.prototype.getHeroInfo = function(otps,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+otps.areaId+":player:"+otps.uid+":heroMap",function(err,data) {
		if(err || !data){
			cb([])
			return
		}
		var multiList = []
		for(var heroId in data){
			if(data[heroId] == "true"){
				multiList.push(["hgetall","area:area"+otps.areaId+":player:"+otps.uid+":heroInfo:"+heroId])
			}
		}
		self.redisDao.multi(multiList,function(err,list) {
			cb(list)
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