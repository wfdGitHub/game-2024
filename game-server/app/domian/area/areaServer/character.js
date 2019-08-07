var charactersCfg = require("../../../../config/gameCfg/characters.json")
module.exports = function() {
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
		var self = this
		self.characterDao.incrbyCharacterInfo(this.areaId,uid,characterId,name,value,function(flag,data) {
			if(flag){
				if(self.players[uid] && self.players[uid].characters && self.players[uid].characters[characterId]){
					if(!self.players[uid].characters[characterId][name]){
						self.players[uid].characters[characterId][name] = 0
					}
					self.players[uid].characters[characterId][name] += value
					var notify = {
						"type" : "characterInfoChange",
						"characterId" : characterId,
						"name" : name,
						"value" : value,
						"curValue" : self.players[uid].characters[characterId][name]
					}
					self.sendToUser(uid,notify)
				}
			}
			if(cb)
				cb(flag,data)
		})
	}
	//设置角色属性
	this.changeCharacterInfo = function(uid,characterId,name,value,cb) {
		var self = this
		self.characterDao.changeCharacterInfo(this.areaId,uid,characterId,name,value,function(flag,data) {
			if(flag){
				if(self.players[uid] && self.players[uid].characters && self.players[uid].characters[characterId]){
					self.players[uid].characters[characterId][name] = value
					var notify = {
						"type" : "characterInfoChange",
						"characterId" : characterId,
						"name" : name,
						"curValue" : data
					}
					self.sendToUser(uid,notify)
				}
			}
			if(cb)
				cb(flag,data)
		})
	}
	//删除角色属性
	this.delCharacterInfo = function(uid,characterId,name,cb) {
		var self = this
		self.characterDao.delCharacterInfo(this.areaId,uid,characterId,name,function(flag,data) {
			if(flag){
				if(self.players[uid] && self.players[uid].characters && self.players[uid].characters[characterId]){
					delete self.players[uid].characters[characterId][name]
					var notify = {
						"type" : "delCharacterInfo",
						"characterId" : characterId,
						"name" : name
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
		this.players[uid].characters[characterId] = characterInfo
		var notify = {
			"type" : "createCharacter",
			"characterInfo" : characterInfo
		}
		this.sendToUser(uid,notify)
	}
	//根据id获取角色信息
	this.getCharacterById = function(uid,characterId) {
		if(this.players[uid] && this.players[uid].characters && this.players[uid].characters[characterId]){
			return this.players[uid].characters[characterId]
		}
		return false
	}
}