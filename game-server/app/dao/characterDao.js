var characterFun = require("../domian/entity/character.js")
var charactersJson = require("../../config/gameCfg/characters.json")
var attributeType =   {
	"characterId" : "number",
	"name" : "string",
    "level": "number",
    "hp": "number",
    "atk": "number",
    "def": "number",
    "atkSpeed": "number",
    "crit": "number",
    "critDef": "number",
    "hitRate": "number",
    "dodgeRate": "number",
    "exp": "number"
}
var characterDao = function() {}
//角色DB
characterDao.prototype.createCharacter = function(otps) {
	var characterInfo = {
		characterId : otps.characterId,
		level : 1,
		exp : 0
	}
	this.redisDao.db.hmset("area:area"+otps.areaId+":player:"+otps.uid+":characters:"+otps.characterId,characterInfo)
	this.redisDao.db.hset("area:area"+otps.areaId+":player:"+otps.uid+":characterMap",otps.characterId,true)
	return characterInfo
}
//获取角色信息
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
			for(var i = 0;i < list.length;i++){
				for(var j in list[i]){
					list[i][j] = Number(list[i][j])
				}
			}
			cb(list)
		})
	})
}
//获取角色属性 {areaId,uid,characterId}
characterDao.prototype.getCharacterInfo = function(otps,cb) {
	this.redisDao.db.hgetall("area:area"+otps.areaId+":player:"+otps.uid+":characters:"+otps.characterId,function(err,data) {
		if(err || !data){
			console.log("getCharacterInfo error ",otps)
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
//获取角色属性
characterDao.prototype.getCharacterAttribute = function(characterInfo) {
	for(var i in charactersJson[characterInfo.characterId]){
		characterInfo[i] = charactersJson[characterInfo.characterId][i]
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