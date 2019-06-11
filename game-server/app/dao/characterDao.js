var roleLevel = require("../../config/role/roleLevel.json")
var characterDao = function() {}
//创建新角色
characterDao.prototype.createCharacter = function(otps) {
	var characterInfo = {
		characterId : otps.characterId,
		name : otps.name,
		level : 1
	}
	for(var i in roleLevel[1]){
		characterInfo[i] = roleLevel[1][i]
	}
	characterInfo.exp = 0
	this.redisDao.db.hmset("area:area"+otps.areaId+":player:"+otps.uid+":characters:"+otps.characterId,characterInfo)
	this.redisDao.db.hset("area:area"+otps.areaId+":player:"+otps.uid+":characterMap",otps.characterId,true)
	return characterInfo
}
//获取英雄信息
characterDao.prototype.getCharacters = function(otps,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+otps.areaId+":player:"+otps.uid+":characterMap",function(err,data) {
		if(err || !data){
			cb([])
			return
		}
		var multiList = []
		for(var characterId in data){
			if(data[characterId] == "true"){
				multiList.push(["hgetall","area:area"+otps.areaId+":player:"+otps.uid+":characters:"+characterId])
			}
		}
		self.redisDao.multi(multiList,function(err,list) {
			cb(list)
		})
	})
}
module.exports = {
	id : "characterDao",
	func : characterDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}