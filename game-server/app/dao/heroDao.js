//英雄DB
var uuid = require("uuid")
var heroDao = function() {}
//增加英雄背包栏
heroDao.prototype.addHeroAmount = function(areaId,uid,cb) {
	this.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":playerInfo","heroAmount",1,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//获得英雄
heroDao.prototype.gainHero = function(areaId,uid,heroId,cb) {
	
}
//修改英雄属性

//删除英雄

//获取英雄列表

//获取英雄图鉴

module.exports = {
	id : "heroDao",
	func : heroDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}