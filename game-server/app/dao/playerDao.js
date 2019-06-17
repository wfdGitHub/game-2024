var bearcat = require("bearcat")
var playerDao = function() {}
//创建新角色
playerDao.prototype.createPlayer = function(otps,cb) {
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
// //玩家登陆、若不存在则注册、获取玩家信息
// playerDao.prototype.userLogin = function(otps,cb) {
// 	var uid = otps.uid
// 	var areaId = otps.areaId
// 	var self = this
// 	self.redisDao.db.exists("area:area"+areaId+":player:"+uid+":playerInfo",function(err,data) {
// 		if(err || !data){
// 			//TODO 随机名字算法
// 			otps.name = "名字"
// 			//不存在则创建
// 			self.createPlayer(otps,cb)
// 		}else{
// 			//存在则获取
// 			self.getPlayerInfo(otps,cb)
// 		}
// 	})
// }

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