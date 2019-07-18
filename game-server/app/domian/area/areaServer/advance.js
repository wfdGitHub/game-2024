//进阶突破系统
var advanceCfg = require("../../../../config/gameCfg/advance.json")
var characters = require("../../../../config/gameCfg/characters.json")
module.exports = function() {
	//角色进阶
	this.characterAdvanced = function(uid,characterId,cb) {
		if(this.charactersMap[characterId] === undefined){
			cb(false,"characterId error "+characterId)
			return
		}
		var characterInfo = this.getCharacterById(uid,characterId)
		if(!characterInfo){
			cb(false,"characterInfo error")
			return
		}
		var curAdvance = 0
		if(characterInfo.advance){
			curAdvance = characterInfo.advance
		}
		curAdvance++
		if(!advanceCfg[curAdvance]){
			cb(false,"advance max")
			return
		}
		if(!advanceCfg[curAdvance][characters[characterId].characterType+"_pc"]){
			cb(false,"characterType error "+characters[characterId].characterType)
			return
		}
		var consumeStr = advanceCfg[curAdvance][characters[characterId].characterType+"_pc"]
		var self = this
		self.consumeItems(uid,consumeStr,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			//进阶
			self.incrbyCharacterInfo(uid,characterId,"advance",1,function(flag,data) {
				cb(flag,data)
			})
		})
	}
	//宠物进阶
	this.petAdvanced = function(uid,id,cb) {
		var petInfo = this.getPetById(uid,id)
		if(!petInfo){
			cb(false,"petInfo error")
			return
		}
		var curAdvance = 0
		if(petInfo.advance){
			curAdvance = petInfo.advance
		}
		curAdvance++
		if(!advanceCfg[curAdvance]){
			cb(false,"advance max")
			return
		}
		if(!advanceCfg[curAdvance][characters[petInfo.characterId].characterType+"_pc"]){
			cb(false,"characterType error "+characters[petInfo.characterId].characterType)
			return
		}
		var consumeStr = advanceCfg[curAdvance][characters[petInfo.characterId].characterType+"_pc"]
		var self = this
		self.consumeItems(uid,consumeStr,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			//进阶
			self.incrbyPetInfo(uid,id,"advance",1,function(flag,data) {
				cb(flag,data)
			})
		})
	}
}