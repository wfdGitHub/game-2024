var bearcat = require("bearcat")
var playerDao = function() {}
//账号DB
playerDao.prototype.createPlayer = function(otps,cb) {
	//注册
	var playerInfo = {
		uid : otps.uid,
		name : otps.name,
		sex : otps.sex === 1? 1 : 2,
		dayStr : (new Date).toLocaleDateString()
	}
	var self = this
	self.redisDao.db.hmset("area:area"+otps.areaId+":player:"+otps.uid+":playerInfo",playerInfo,function(err,data) {
		if(!err){
			playerInfo.characters = []
			playerInfo.characters.push(self.characterDao.createCharacter(otps.areaId,otps.uid,10001))
			self.redisDao.db.hset("area:area"+otps.areaId+":nameMap",otps.name,otps.uid)
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
		if(err || !playerInfo){
			cb(false)
		}else{
			for(var i in playerInfo){
				var tmp = Number(playerInfo[i])
				if(tmp == playerInfo[i])
					playerInfo[i] = tmp
			}
			self.characterDao.getCharacters(otps.areaId,otps.uid,function(characters) {
				playerInfo.characters = characters
				self.petDao.getPets(otps.areaId,otps.uid,function(pets) {
					playerInfo.pets = pets
					cb(playerInfo)
				})
			})
		}
	})
}
//检查账号是否可创建
playerDao.prototype.checkPlayerInfo = function(otps,cb) {
	var multiList = []
	multiList.push(["exists","area:area"+otps.areaId+":player:"+otps.uid+":playerInfo"])
	multiList.push(["hexists","area:area"+otps.areaId+":nameMap",otps.name])
	this.redisDao.multi(multiList,function(err,list) {
		if(list[0] !== 0){
			cb(false,"已注册账号")
		}else if(list[1] !== 0){
			cb(false,"名字已存在")
		}else{
			cb(true)
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
	},{
		name : "petDao",
		ref : "petDao"
	}]
}