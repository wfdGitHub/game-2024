var partner_cfg = require("../../../../config/gameCfg/partner_cfg.json")
var partner_passive = require("../../../../config/gameCfg/partner_passive.json")
var characters_cfg = require("../../../../config/gameCfg/characters.json")
var partner_star = require("../../../../config/gameCfg/partner_star.json")
//伙伴系统
module.exports = function() {
	var self = this
	this.partnerTmpPassive = {}
	//伙伴升星
	this.partnerUpgradeStar = function(uid,characterId,cb) {
		if(!characters_cfg[characterId] || characters_cfg[characterId].characterType !== "partner" || !self.players[uid] || !self.players[uid].characters[characterId]){
			cb(false,"伙伴不存在" + characterId)
			return
		}
		var characterInfo = self.players[uid].characters[characterId]
		var curLv = Number(characterInfo.level)
		var curSamsara = Math.floor(((curLv - 1) / 100))
		var curStar = characterInfo["star"] || 0
		if(!partner_star[curStar + 1]){
			cb(false,"已升满级")
			return
		}
		if(curSamsara < partner_star[curStar + 1]["samsara"]){
			cb(false,"等级不足")
			return
		}
		var str =  partner_star[curStar + 1]["pc"]
		self.consumeItems(uid,str,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			self.incrbyCharacterInfo(uid,characterId,"star",1,function(flag) {
				if(cb)
					cb(flag)
			})
		})
	}
	//激活伙伴
	this.activatePartner = function(uid,characterId,cb) {
		if(!partner_cfg[characterId] || !this.players[uid]){
			cb(false)
			return
		}
		if(this.players[uid].characters[characterId]){
			cb(false,"角色已存在" + characterId)
			return
		}
		var str = partner_cfg[characterId]["activate"]
		self.consumeItems(uid,str,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			self.openPartner(uid,characterId)
			cb(true)
		})
	}
	//获取已获得转生被动技能列表
	this.getLearnPassiveList = function(uid,characterId,samsara,cb) {
		if(!characters_cfg[characterId] || characters_cfg[characterId].characterType !== "partner" || !partner_passive[samsara]){
			cb(false,"args error "+characterId+" "+samsara)
			return
		}
		var characterInfo = self.players[uid].characters[characterId]
		var curLv = Number(characterInfo.level)
		var curSamsara = Math.floor(((curLv - 1) / 100))
		var list = {}
		for(var i = 1; i <= curSamsara;i++){
			var str = uid+""+characterId+""+i
			if(self.partnerTmpPassive[str]){
				list["ps_"+i] = self.partnerTmpPassive[str]
			}
		}
		cb(true,list)
	}
	//学习转生被动技能
	this.learnPassive = function(uid,characterId,samsara,index,cb) {
		if(!characters_cfg[characterId] || characters_cfg[characterId].characterType !== "partner" || !partner_passive[samsara]){
			cb(false,"args error "+characterId+" "+samsara)
			return
		}
		var str = uid+""+characterId+""+samsara
		if(!self.partnerTmpPassive[str]){
			cb(false,"未获取技能列表")
			return
		}
		var pId = self.partnerTmpPassive[str][index]
		if(!pId){
			cb(false,"index error "+index)
			return
		}
		self.changeCharacterInfo(uid,characterId,"ps_"+samsara,pId,function(flag) {
			if(flag){
				delete self.partnerTmpPassive[str]
			}
			if(cb)
				cb(flag)
		})
	}
	//重置转生技能
	this.resetLearnPassive = function(uid,characterId,samsara,cb) {
		if(!characters_cfg[characterId] || characters_cfg[characterId].characterType !== "partner" || !partner_passive[samsara]){
			cb(false,"args error "+characterId+" "+samsara)
			return
		}
		if(!self.players[uid] || !self.players[uid].characters[characterId]){
			cb(false,"characterId error "+characterId)
			return
		}
		//判断达到转生等级
		var characterInfo = self.players[uid].characters[characterId]
		var curLv = Number(characterInfo.level)
		var curSamsara = Math.floor(((curLv - 1) / 100))
		//检查转生等级
		if(samsara > curSamsara){
			cb(false,"转生等级不足 "+curSamsara)
			return
		}
		var str = uid+""+characterId+""+samsara
		if(!self.players[uid].characters[characterId]["ps_"+samsara] && !self.partnerTmpPassive[str]){
			//若未学习技能且未获取技能则免费开启
			var pIdList = self.randomLearnPassive(characterId,samsara)
			self.partnerTmpPassive[str] = pIdList
			cb(true,pIdList)
		}else{
			var consumeStr = partner_passive[samsara].reset
			self.consumeItems(uid,consumeStr,1,function(flag,err) {
				if(!flag){
					cb(flag,err)
					return
				}
				var pIdList = self.randomLearnPassive(characterId,samsara)
				self.partnerTmpPassive[str] = pIdList
				if(self.players[uid].characters[characterId]["ps_"+samsara]){
					//删除角色当前被动技能
					self.delCharacterInfo(uid,characterId,"ps_"+samsara)
				}
				cb(true,pIdList)
			})
		}
	}
	//获取随机被动技能列表
	this.randomLearnPassive = function(characterId,samsara) {
		var str = partner_passive[samsara].passive
		var passives = {}
		var strList = str.split("&")
		strList.forEach(function(m_str) {
			var m_list = m_str.split(":")
			passives[m_list[0]] = Number(m_list[1])
		})
		var pIdList = []
		for(var i = 0;i < 3;i++){
			var allRand = 0
			var curRand = 0
			for(var pId in passives){
				allRand += passives[pId]
			}
			var rand = Math.random() * allRand
			for(var pId in passives){
				curRand += passives[pId]
				if(rand < curRand){
					pIdList.push(Number(pId))
					delete passives[pId]
					break
				}
			}
		}
		return pIdList
	}
	//开启伙伴
	this.openPartner = function(uid,characterId) {
		this.createCharacter(this.areaId,uid,characterId)
	}
}