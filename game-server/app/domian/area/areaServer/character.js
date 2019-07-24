var charactersCfg = require("../../../../config/gameCfg/characters.json")
module.exports = function() {
	this.charactersMap = {
		10001 : 0,
		10002 : 1,
		10003 : 2,
		10004 : 3,
		10005 : 4
	}
	//查询主角属性
	this.getRoleArg = function(uid,name,cb) {
		this.redisDao.db.hget("area:area"+this.areaId+":player:"+uid+":characters:10001",name,function(err,data) {
			if(err || !data){
				cb(false)
			}else{
				cb(data)
			}
		})
	}
	//查询角色属性
	this.getCharacterArg = function(uid,characterId,name,cb) {
		this.redisDao.db.hget("area:area"+this.areaId+":player:"+uid+":characters:"+characterId,name,function(err,data) {
			if(err || !data){
				cb(false)
			}else{
				cb(data)
			}
		})
	}
	//增减角色属性 {uid,characterId,name,value}
	this.incrbyCharacterInfo = function(uid,characterId,name,value,cb) {
		var index = this.charactersMap[characterId]
		var self = this
		self.characterDao.incrbyCharacterInfo(this.areaId,uid,characterId,name,value,function(flag,data) {
			if(flag){
				if(self.players[uid] && self.players[uid].characters && self.players[uid].characters[index]){
					if(!self.players[uid].characters[index][name]){
						self.players[uid].characters[index][name] = 0
					}
					self.players[uid].characters[index][name] += value
					var notify = {
						"type" : "characterInfoChange",
						"characterId" : characterId,
						"index" : index,
						"name" : name,
						"value" : value,
						"curValue" : self.players[uid].characters[index][name]
					}
					self.sendToUser(uid,notify)
				}
			}
			if(cb)
				cb(flag,data)
		})
	}
	//增加角色
	this.createCharacter = function(areaId,uid,characterId) {
		var characterInfo = this.characterDao.createCharacter(areaId,uid,characterId)
		this.players[uid].characters[this.charactersMap[characterInfo.characterId]] = characterInfo
		var notify = {
			"type" : "createCharacter",
			"characterInfo" : characterInfo
		}
		this.sendToUser(uid,notify)
	}
	//根据id获取角色信息
	this.getCharacterById = function(uid,characterId) {
		if(this.players[uid] && this.players[uid].characters){
			for(var i = 0;i < this.players[uid].characters.length;i++){
				if(this.players[uid].characters[i].characterId == characterId){
					return this.players[uid].characters[i]
				}
			}
		}
		return false
	}
}