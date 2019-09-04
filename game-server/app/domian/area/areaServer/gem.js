//宝石系统
var gem_level = require("../../../../config/gameCfg/gem_level.json")
var gem_config = require("../../../../config/gameCfg/gem_config.json")
var gem_base = require("../../../../config/gameCfg/gem_base.json")
var gem_slot = require("../../../../config/gameCfg/gem_slot.json")
var currencyId = gem_config.currencyId.value

module.exports = function() {
	var self = this
	//获取宝石列表
	this.getGemList = function(uid,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":gem",function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//购买宝石
	this.buyGem = function(uid,gId,level,count,cb) {
		if(!gem_base[gId] || !gem_level[level] || !gem_level[level][gId] || !Number.isInteger(count) || count < 1){
			cb(false,"参数错误")
			return
		}
		//判断货币是否足够
		var gemCfg = gem_level[level]
		var needValue = Math.round(gemCfg.price * count)
		self.getBagItem(uid,currencyId,function(value) {
			if(value < needValue){
				cb(false,"currencyId "+currencyId+" not enough "+value+" "+needValue)
				return
			}
			//扣除货币
			self.addItem({uid : uid,itemId : currencyId,value : -needValue})
			//增加宝石
			self.addGem(uid,gId,level,count,cb)
		})
	}
	//获得一个当前转生等级随机宝石
	this.addRandGem = function(uid,gId,rate,cb) {
		if(!gId){
			gId = "g" + (Math.floor(Math.random() * 12) + 1)
		}
		var curLv = self.players[uid].characters[self.heroId].level
		var samsara = Math.floor(((curLv - 1) / 100))
		self.addGem(uid,gId,samsara + 1,rate,cb)
	}
	//增加宝石
	this.addGem = function(uid,gId,level,count,cb) {
		if(!gem_base[gId] || !gem_level[level] || !gem_level[level][gId] || !Number.isInteger(count) || count < 1){
			cb(false,"参数错误")
			return
		}
		var gstr = self.gemStr(gId,level)
		self.redisDao.db.hincrby("area:area"+self.areaId+":player:"+uid+":gem",gstr,count,function(err,data) {
			var notify = {
				"type" : "addGem",
				"gstr" : gstr,
				"value" : count,
				"curValue" : data
			}
			self.sendToUser(uid,notify)
			if(cb){
				cb(true,gstr)
			}
		})
	}
	//宝石str
	this.gemStr = function(gId,level) {
		return gId + "-" + level
	}
	//根据宝石字符串获取宝石信息
	this.gemParse = function(str) {
		var list = str.split("-")
		var info = {
			gId : list[0],
			level : parseInt(list[1])
		}
		if(!gem_base[info.gId] || !gem_level[info.level] || !gem_level[info.level][info.gId]){
			console.log("gemParse error"+info.gId+"  "+info.level)
			return false
		}
		return info
	}
	//出售宝石
	this.sellGem = function(uid,glist,cb) {
		if(typeof(glist) != "object"){
			cb(false,"glist not object")
			return
		}
		//参数检查
		for(var i in glist){
			if(!self.gemParse(i) || !Number.isInteger(glist[i])){
				cb(false,i + " 参数错误")
				return
			}
		}
		//查询并扣除宝石
		self.consumeGems(uid,glist,function(flag,err) {
			if(!flag){
				cb(false,err)
				return
			}
			var value = 0
			//计算货币值
			for(var i in glist){
				var gInfo = self.gemParse(i)
				var tmpValue = Math.round(gem_level[gInfo.level]["selling"] * glist[i])
				if(Number.isInteger(tmpValue)){
					value += tmpValue
				}else{
					console.log("宝石售价计算错误  ",i,tmpValue)
				}
			}
			if(value > 0){
				self.addItem({uid : uid,itemId : currencyId,value : value})
			}
			cb(true,value)
		})
	}
	//扣除宝石
	this.consumeGems = function(uid,glist,cb) {
		var gArr = []
		for(var i in glist){
			gArr.push(i)
		}
		//判断宝石是否足够
		self.getGemItemList(uid,gArr,function(list) {
			for(var i = 0;i < gArr.length;i++){
				if(list[i] < glist[gArr[i]]){
					cb(false,"gem not enough "+gArr[i]+" "+list[i]+" "+glist[gArr[i]])
					return
				}
			}
			//扣除宝石
			for(var i in glist){
				self.deleteGem(uid,i,glist[i])
			}
			cb(true)
		})
	}
	//获取指定宝石数量
	this.getGemItemList = function(uid,gArr,cb) {
		var multiList = []
		for(var i = 0;i < gArr.length;i++){
			multiList.push(["hget","area:area"+this.areaId+":player:"+uid+":gem",gArr[i]])
		}
		this.redisDao.multi(multiList,function(err,list) {
			for(var i = 0;i < list.length;i++){
				list[i] = Number(list[i])
			}
			cb(list)
		})
	}
	//删除宝石
	this.deleteGem = function(uid,gstr,value) {
		self.redisDao.db.hincrby("area:area"+self.areaId+":player:"+uid+":gem",gstr,-value,function(err,curValue) {
			var notify = {
				"type" : "addGem",
				"gstr" : gstr,
				"value" : -value,
				"curValue" : curValue
			}
			self.sendToUser(uid,notify)
			if(!err && curValue <= 0){
				self.redisDao.db.hdel("area:area"+self.areaId+":player:"+uid+":gem",gstr)
			}
		})
	}
	//镶嵌宝石
	this.inlayGem = function(uid,eId,slot,gstr,cb) {
		if(!gem_slot[eId] || !gem_slot[eId]["slot_"+slot] || typeof(gstr) != "string"){
			cb(false,"参数错误 eId : "+eId+"  slot : "+slot+ " gstr : "+gstr)
			return
		}
		//判断宝石槽是否开放
		var characterInfo = self.players[uid].characters[self.heroId]
		var curLv = Number(characterInfo.level)
		var samsara = Math.floor((curLv / 100))
		if(samsara < gem_config["slot_"+samsara]){
			cb(false,"宝石槽未开放，需要转生等级 : "+gem_config["slot_"+samsara])
			return
		}
		//获取宝石信息
		var gInfo = self.gemParse(gstr)
		if(!gInfo){
			cb(false,"gstr error : "+gstr)
			return
		}
		//判断携带等级
		var gemCfg = gem_level[gInfo.level]
		if(samsara < gemCfg[samsara]){
			cb(false,"等级不足不可镶嵌，需要转生等级 : "+gemCfg[samsara])
			return
		}
		//判断插槽类型
		if(gem_base[gInfo.gId]["slotType"] !== gem_slot[eId]["slot_"+slot]){
			cb(false,"插槽类型错误 "+gem_base[gInfo.gId]["slotType"]+"  "+gem_slot[eId]["slot_"+slot])
			return
		}
		var cInfo = {}
		cInfo[gstr] = 1
		self.consumeGems(uid,cInfo,function(flag,err) {
			if(!flag){
				cb(false,err)
				return
			}
			self.takeofGem(uid,eId,slot,function(flag,data) {
				self.changeCharacterInfo(uid,10001,"g_"+eId+"_"+slot,gstr,function(flag) {
					if(cb)
						cb(flag)
				})
			})
		})
	}
	//卸下宝石
	this.takeofGem = function(uid,eId,slot,cb) {
		self.getRoleArg(uid,"g_"+eId+"_"+slot,function(data) {
			if(data){
				var tmpInfo = self.gemParse(data)
				if(tmpInfo){
					self.addGem(uid,tmpInfo.gId,tmpInfo.level,1,cb)
				}else{
					console.log("error addGem tmpInfo",tmpInfo,data)
				}
				self.delCharacterInfo(uid,10001,"g_"+eId+"_"+slot)
				if(cb)
					cb(true,data)
			}else{
				if(cb)
					cb(false,"未镶嵌")
			}
		})
	}
	//合成宝石
	this.compoundGem = function(uid,gId,level,glist,cb) {
		if(!gem_base[gId] || !gem_level[level] || !gem_level[level][gId] || typeof(glist) !== "object"){
			cb(false,"gemInfo error"+gId+"  "+level)
			return false
		}
		var needValue = gem_level[level]["price"]
		var curValue = 0
		for(var i in glist){
			var gInfo = self.gemParse(i)
			if(!gInfo || !Number.isInteger(glist[i]) || gId !== gInfo.gId){
				cb(false,i + " 参数错误")
				return
			}
			curValue += gem_level[gInfo.level]["price"] * glist[i]
		}
		if(curValue > needValue){
			cb(false,"消耗宝石价值不能超过所升级宝石 "+curValue+" / "+needValue)
			return
		}
		if(curValue == needValue){
			self.consumeGems(uid,glist,function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				self.addGem(uid,gId,level,1,cb)
				cb(true)
			})
		}else{
			self.getBagItem(uid,currencyId,function(value) {
				if(value < (needValue - curValue)){
					cb(false,"currencyId "+currencyId+" not enough "+value+" "+(needValue - curValue))
					return
				}
				self.consumeGems(uid,glist,function(flag,err) {
					if(!flag){
						cb(false,err)
						return
					}
					self.addItem({uid : uid,itemId : currencyId,value : -(needValue - curValue)})
					self.addGem(uid,gId,level,1,cb)
					cb(true)
				})
			})
		}
	}
}