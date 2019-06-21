var bearcat = require("bearcat")
var playerDao = function() {}
//账号DB
playerDao.prototype.createPlayer = function(otps,cb) {
	//注册
	var playerInfo = {
		uid : otps.uid,
		name : otps.name,
		sex : otps.sex === 1? 1 : 0
	}
	var self = this
	self.redisDao.db.hmset("area:area"+otps.areaId+":player:"+otps.uid+":playerInfo",playerInfo,function(err,data) {
		if(!err){
			playerInfo.characters = []
			playerInfo.characters.push(self.characterDao.createCharacter({areaId : otps.areaId,uid : otps.uid,characterId : 10001}))
			cb(playerInfo)
		}else{
			cb(false)
		}
	})
}
//获取角色信息
playerDao.prototype.getPlayerInfo = function(otps,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+otps.areaId+":player:"+otps.uid+":playerInfo",function(err,playerInfo) {
		console.log(err,playerInfo)
		if(err || !playerInfo){
			cb(false)
		}else{
			self.characterDao.getCharacters(otps,function(characters) {
				playerInfo.characters = characters
				cb(playerInfo)
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
		name : "characterDao",
		ref : "characterDao"
	}]
}