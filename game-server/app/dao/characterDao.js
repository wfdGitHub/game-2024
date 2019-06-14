console.log(__dirname)
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
//创建新角色
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
				list[i] = self.getCharacterAttribute(list[i])
			}
			cb(list)
		})
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