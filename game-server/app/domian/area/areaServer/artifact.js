//神器法宝模块
var artifact_base = require("../../../../config/gameCfg/artifact_base.json")
var artifac_star = require("../../../../config/gameCfg/artifac_star.json")
var artifac_advance = require("../../../../config/gameCfg/artifac_advance.json")
module.exports = function() {
	var self = this
	//神器激活
	this.artifactActivate = function(uid,aId,cb) {
		if(!artifact_base[aId]){
			cb(false,"神器不存在"+aId)
			return
		}
		var characterInfo = this.getCharacterById(uid,this.heroId)
		if(characterInfo[aId]){
			cb(false,"已拥有"+aId)
			return
		}
		var pc = artifact_base[aId]["item"]+":"+artifact_base[aId]["activate"]
		console.log("pc",pc)
		self.consumeItems(uid,pc,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			//激活
			self.changeCharacterInfo(uid,self.heroId,aId,1,function(flag,data) {
				cb(flag,data)
			})
		})
	}
	//神器进阶
	this.artifactAdvance = function(uid,aId,cb) {
		if(!artifact_base[aId]){
			cb(false,"神器不存在"+aId)
			return
		}
		var characterInfo = this.getCharacterById(uid,this.heroId)
		if(!characterInfo[aId]){
			cb(false,"未激活"+aId)
			return
		}
		var curLevel = characterInfo[aId+"_advance"]
		if(!curLevel){
			curLevel = 0
		}
		curLevel++
		if(!artifac_advance[curLevel]){
			cb(false,"已升满")
			return
		}
		var pc = artifac_advance[curLevel]["pc"]
		self.consumeItems(uid,pc,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			//进阶
			self.incrbyCharacterInfo(uid,self.heroId,aId+"_advance",1,function(flag,data) {
				cb(flag,data)
			})
		})
	}
	//神器升星
	this.artifactStar = function(uid,aId,cb) {
		if(!artifact_base[aId]){
			cb(false,"神器不存在"+aId)
			return
		}
		var characterInfo = this.getCharacterById(uid,this.heroId)
		if(!characterInfo[aId]){
			cb(false,"未激活"+aId)
			return
		}
		var curLevel = characterInfo[aId+"_star"]
		if(!curLevel){
			curLevel = 0
		}
		curLevel++
		if(!artifac_star[curLevel]){
			cb(false,"已升满")
			return
		}
		var pc = artifact_base[aId]["item"]+":"+artifac_star[curLevel]["s_pc"]
		if(artifac_star[curLevel]["n_pc"]){
			pc += "&" + artifac_star[curLevel]["n_pc"]
		}
		self.consumeItems(uid,pc,1,function(flag,err) {
			if(!flag){
				cb(flag,err)
				return
			}
			//升星
			self.incrbyCharacterInfo(uid,self.heroId,aId+"_star",1,function(flag,data) {
				cb(flag,data)
			})
		})
	}
	//穿戴神器
	this.dressedArtifact = function(uid,aId,cb) {
		if(!artifact_base[aId]){
			cb(false,"神器不存在"+aId)
			return
		}
		var characterInfo = this.getCharacterById(uid,this.heroId)
		if(!characterInfo[aId]){
			cb(false,"未激活"+aId)
			return
		}
		var type = artifact_base[aId]["type"]
		self.changeCharacterInfo(uid,self.heroId,"activate_"+type,aId,function(flag,data) {
			cb(flag,data)
		})
	}
	//卸下神器
	this.takeofArtifact = function(uid,type,cb) {
		var characterInfo = this.getCharacterById(uid,this.heroId)
		if(!characterInfo["activate_"+type]){
			cb(false,"未穿戴")
			return
		}
		self.delCharacterInfo(uid,self.heroId,"activate_"+type,function(flag,data) {
			cb(flag,data)
		})
	}
}