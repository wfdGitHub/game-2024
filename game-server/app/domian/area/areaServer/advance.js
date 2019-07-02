//进阶突破系统
var advanceCfg = require("../../../../config/gameCfg/advance.json")
var characters = require("../../../../config/gameCfg/characters.json")
module.exports = function() {
	//进阶
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
		// console.log("consumeStr",consumeStr)
		var strList = consumeStr.split("&")
		var items = []
		var values = []
		var self = this
		strList.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = Number(m_list[0])
			var value = Number(m_list[1])
			items.push(itemId)
			values.push(value)
		})
		//判断道具是否足够
		self.getBagItemList(uid,items,function(list) {
			for(var i = 0;i < values.length;i++){
				if(list[i] < values[i]){
					cb(false,"item not enough "+items[i]+" "+list[i]+" "+values[i])
					return
				}
			}
			//扣除道具
			for(var i = 0;i < values.length;i++){
				self.addItem(uid,items[i],-values[i])
			}
			//进阶
			self.incrbyCharacterInfo(uid,characterId,"advance",1,function(flag,data) {
				cb(flag,data)
			})
		})
	}
}