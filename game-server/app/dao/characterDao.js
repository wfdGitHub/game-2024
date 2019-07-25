var characterFun = require("../domian/entity/character.js")
var charactersCfg = require("../../config/gameCfg/characters.json")
var characterDao = function() {}
//角色DB
characterDao.prototype.createCharacter = function(areaId,uid,characterId) {
	var characterInfo = {
		characterId : characterId,
		level : 1,
		exp : 0
	}
	this.redisDao.db.hmset("area:area"+areaId+":player:"+uid+":characters:"+characterId,characterInfo)
	this.redisDao.db.hset("area:area"+areaId+":player:"+uid+":characterMap",characterId,Date.now())
	return characterInfo
}
//获取角色信息
characterDao.prototype.getCharacters = function(areaId,uid,cb) {
	var self = this
	self.redisDao.db.hgetall("area:area"+areaId+":player:"+uid+":characterMap",function(err,data) {
		if(err || !data){
			cb([])
			return
		}
		var multiList = []
		for(var characterId in data){
			multiList.push(["hgetall","area:area"+areaId+":player:"+uid+":characters:"+characterId])
		}
		self.redisDao.multi(multiList,function(err,list) {
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					var tmp = Number(list[i][j])
					if(tmp == list[i][j])
						list[i][j] = tmp
				}
			}
			cb(list)
		})
	})
}
//获取角色属性 {areaId,uid,characterId}
characterDao.prototype.getCharacterInfo = function(areaId,uid,characterId,cb) {
	this.redisDao.db.hgetall("area:area"+areaId+":player:"+uid+":characters:"+characterId,function(err,data) {
		if(err || !data){
			console.log("getCharacterInfo error ",areaId,uid,characterId)
			cb(false)
		}else{
			cb(true,data)
		}
	})
}
//增减角色属性
characterDao.prototype.incrbyCharacterInfo = function(areaId,uid,characterId,name,value,cb) {
	this.redisDao.db.hincrby("area:area"+areaId+":player:"+uid+":characters:"+characterId,name,value,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//设置角色属性
characterDao.prototype.changeCharacterInfo = function(areaId,uid,characterId,name,value,cb) {
	this.redisDao.db.hset("area:area"+areaId+":player:"+uid+":characters:"+characterId,name,value,function(err,data) {
		if(cb)
			cb(true,value)
	})
}
//删除角色属性
characterDao.prototype.delCharacterInfo = function(areaId,uid,characterId,name,cb) {
	this.redisDao.db.hdel("area:area"+areaId+":player:"+uid+":characters:"+characterId,name,function(err,data) {
		if(cb)
			cb(true,data)
	})
}
//获取角色属性
characterDao.prototype.getCharacterAttribute = function(characterInfo) {
	for(var i in charactersCfg[characterInfo.characterId]){
		characterInfo[i] = charactersCfg[characterInfo.characterId][i]
	}
	var character = new characterFun(characterInfo)
    return character.getInfo()
}
module.exports = {
	id : "characterDao",
	func : characterDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}