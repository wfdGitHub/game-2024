//宝石
var stone_base = require("../../../../config/gameCfg/stone_base.json")
var stone_skill = require("../../../../config/gameCfg/stone_skill.json")
var stone_cfg = require("../../../../config/gameCfg/stone_cfg.json")
var baseStone = {
	"1" : 400010100,
	"2" : 400020100,
	"3" : 400030100,
	"4" : 400040100
}
module.exports = function() {
	var self = this
	//穿戴宝石
	this.wearStone = function(uid,hId,itemId,pos,cb) {
		var lv = self.getLordLv(uid)
		if(!stone_cfg["pos_"+pos]){
			cb(false,"pos error "+pos)
			return
		}
		if(lv < stone_cfg["pos_"+pos]["role_lv"]){
			cb(false,"等级不足 "+lv+":"+stone_cfg["pos_"+pos]["role_lv"])
			return
		}
		if(stone_cfg["pos_"+pos]["type"] == "base"){
			this.wearStoneBase(uid,hId,itemId,pos,cb)
		}else{
			this.wearStoneSkill(uid,hId,itemId,pos,cb)
		}
	}
	//穿戴属性宝石
	this.wearStoneBase = function(uid,hId,itemId,pos,cb) {
		if(!stone_base[itemId] || stone_base[itemId]["pos"] != pos){
			cb(false,"位置不对应")
			return
		}
		self.consumeItems(uid,itemId+":1",1,"穿戴宝石",function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				var key = "s"+pos
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(!flag){
						cb(false,"英雄不存在")
						return
					}
					if(heroInfo[key]){
						//拆卸宝石
						self.addItem({uid:uid,itemId:heroInfo[key],value:1,reason:"卸下宝石"})
					}
					if(heroInfo[key+"v"]){
						var num = Math.floor(heroInfo[key+"v"] / stone_base[baseStone[pos]]["value"])
						self.addItem({uid:uid,itemId:baseStone[pos],value:num,reason:"卸下宝石"})
						self.heroDao.setHeroInfoNormal(self.areaId,uid,hId,key+"v",0)
					}
					self.heroDao.setHeroInfo(self.areaId,uid,hId,key,itemId)
					cb(true)
				})
			}
		})
	}
	//穿戴技能宝石
	this.wearStoneSkill = function(uid,hId,itemId,pos,cb) {
		if(!stone_skill[itemId]){
			cb(false,"位置不对应")
			return
		}
		var key = "s"+pos
		var type = stone_skill[itemId]["type"]
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!flag){
				cb(false,"英雄不存在")
				return
			}
			for(var i = 5;i <= 8;i++){
				if(i != pos){
					if(heroInfo["s"+i] && stone_skill[heroInfo["s"+i]] && stone_skill[heroInfo["s"+i]]["type"] == type){
						cb(false,"已装备同类型技能宝石")
						return
					}
				}
			}
			self.consumeItems(uid,itemId+":1",1,"穿戴宝石",function(flag,err) {
				if(!flag){
					cb(false,err)
				}else{
					if(heroInfo[key]){
						//拆卸宝石
						self.addItem({uid:uid,itemId:heroInfo[key],value:1,reason:"卸下宝石"})
					}
					self.heroDao.setHeroInfo(self.areaId,uid,hId,key,itemId)
					cb(true)
				}
			})
		})
	}
	//卸下宝石
	this.unwearStone = function(uid,hId,pos,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!flag){
				cb(false,"英雄不存在")
				return
			}
			var key = "s"+pos
			if(heroInfo[key]){
				//拆卸宝石
				self.addItem({uid:uid,itemId:heroInfo[key],value:1,reason:"卸下宝石"})
				if(heroInfo[key+"v"] && stone_base[heroInfo[key]]){
					console.log("heroInfo",heroInfo[key+"v"],stone_base[baseStone[pos]]["value"])
					var num = Math.floor(heroInfo[key+"v"] / stone_base[baseStone[pos]]["value"])
					self.addItem({uid:uid,itemId:baseStone[pos],value:num,reason:"卸下宝石"})
					self.heroDao.setHeroInfo(self.areaId,uid,hId,key+"v",0)
				}
				self.heroDao.delHeroInfo(self.areaId,uid,hId,key)
				cb(true,heroInfo[key])
			}else{
				cb(false)
			}
		})
	}
	//升级宝石
	this.upStone = function(uid,hId,pos,items,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!flag){
				cb(false,"英雄不存在")
				return
			}
			var key = "s"+pos
			var itemId = heroInfo[key]
			if(itemId){
				if(stone_cfg["pos_"+pos]["type"] == "base"){
					self.upStoneBase(uid,hId,pos,itemId,heroInfo[key+"v"],items,cb)
				}else{
					self.upStoneSkill(uid,hId,pos,itemId,items,cb)
				}
			}else{
				cb(false)
			}
		})
	}
	//升级属性宝石
	this.upStoneBase = function(uid,hId,pos,itemId,value,items,cb) {
		if(!stone_base[itemId] || !stone_base[itemId]["up_value"]){
			cb(false)
			return
		}
		var key = "s"+pos
		var allValue = value || 0
		var str = ""
		for(var i in items){
			if(!stone_base[i] || stone_base[i]["pos"] != pos || !Number.isInteger(items[i])){
				cb(false,"item error "+i)
				return
			}
			allValue += stone_base[i]["value"] * items[i]
			str += i+":"+items[i]+"&"
		}
		str = str.substr(0, str.length - 1)
		var itemId
		while(stone_base[itemId]["up_value"] && allValue >= stone_base[itemId]["up_value"]){
			allValue -= stone_base[itemId]["up_value"]
			itemId++
			if(!stone_base[itemId]){
				cb(false,"经验超出")
				return
			}
		}
		if(!stone_base[itemId]["up_value"] && allValue > 0){
			cb(false,"经验超出")
			return
		}
		self.consumeItems(uid,str,1,"升级宝石",function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.heroDao.setHeroInfo(self.areaId,uid,hId,key,itemId)
				self.heroDao.setHeroInfoNormal(self.areaId,uid,hId,key+"v",allValue)
				cb(true,{itemId : itemId,value : allValue})
			}
		})
	}
	//升级技能宝石
	this.upStoneSkill = function(uid,hId,pos,itemId,items,cb) {
		if(!stone_skill[itemId] || !stone_skill[itemId]["up_value"]){
			cb(false)
			return
		}
		var allValue = 0
		var str = ""
		for(var i in items){
			if(!stone_skill[i] || !Number.isInteger(items[i])){
				cb(false,"item error "+i)
				return
			}
			if(stone_skill[i]["type"] == stone_skill[itemId]["type"])
				allValue += stone_skill[i]["value"] * items[i] * 2
			else
				allValue += stone_skill[i]["value"] * items[i]
			str += i+":"+items[i]+"&"
		}
		str = str.substr(0, str.length - 1)
		if(stone_skill[itemId]["up_value"] != allValue){
			cb(false,"经验不一致")
			return
		}
		itemId++
		if(!stone_skill[itemId]){
			cb(false,"不可升级")
			return
		}
		self.consumeItems(uid,str,1,"升级宝石",function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				self.heroDao.setHeroInfo(self.areaId,uid,hId,key,itemId)
				cb(true,{itemId : itemId})
			}
		})
	}
}