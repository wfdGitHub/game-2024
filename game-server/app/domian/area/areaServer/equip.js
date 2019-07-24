//装备系统
var uuid = require("uuid")
var equip_base = require("../../../../config/gameCfg/equip_base.json")
var equip_config = require("../../../../config/gameCfg/equip_config.json")
var equip_intensify = require("../../../../config/gameCfg/equip_intensify.json")
var equip_level = require("../../../../config/gameCfg/equip_level.json")
var equip_quality = require("../../../../config/gameCfg/equip_quality.json")
var equip_wash = require("../../../../config/gameCfg/equip_wash.json")
var quality_weight = []
var qualityAllRand = 0
for(var i in equip_quality){
	qualityAllRand += equip_quality[i].weight
	quality_weight.push(qualityAllRand)
}
var currencyId = equip_config.currencyId.value
module.exports = function() {
	//获取装备池列表
	this.getEquipList = function(uid,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":equip",function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获取可穿戴装备列表
	this.getWearableList = function(uid,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":wearable",function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获得装备池装备
	this.addEquip = function(uid,eId,samsara,quality,cb) {
		if(!equip_base[eId] || !equip_level[samsara] || !equip_quality[quality]){
			console.log("addEquip error"+eId,samsara,quality)
			if(cb){
				cb(false,"can't find equip")
			}
			return
		}
		var self = this
		var estr = self.equipStr(eId,samsara,quality)
		self.redisDao.db.hincrby("area:area"+self.areaId+":player:"+uid+":equip",estr,1,function(err,data) {
			var notify = {
				"type" : "addEquip",
				"estr" : estr,
				"value" : 1,
				"curValue" : data
			}
			self.sendToUser(uid,notify)
			if(cb){
				cb(true)
			}
		})
	}
	//获得可穿戴装备
	this.addWearable = function(uid,eId,samsara,quality,cb) {
		if(!equip_base[eId] || !equip_level[samsara] || !equip_quality[quality]){
			console.log("addWearable error"+eId,samsara,quality)
			if(cb){
				cb(false,"can't find equip")
			}
			return
		}
		var self = this
		var eInfo = self.equipInfo(eId,samsara,quality)
		eInfo.wId = uuid.v1()
		self.redisDao.db.hset("area:area"+self.areaId+":player:"+uid+":wearable",eInfo.wId,JSON.stringify(eInfo),function(err,data) {
			var notify = {
				"type" : "addWearable",
				"eInfo" : eInfo
			}
			self.sendToUser(uid,notify)
			if(cb){
				cb(true,eInfo)
			}
		})
	}
	//删除装备
	this.deleteEquip = function(uid,estr,value) {
		var self = this
		self.redisDao.db.hincrby("area:area"+self.areaId+":player:"+uid+":equip",estr,-value,function(err,curValue) {
			if(!err && curValue <= 0){
				self.redisDao.db.hdel("area:area"+self.areaId+":player:"+uid+":equip",estr)
			}
		})
	}
	//删除可穿戴装备
	this.deleteWearable = function(uid,wId) {
		this.redisDao.db.hdel("area:area"+this.areaId+":player:"+uid+":wearable",wId)
	}
	//批量分解装备 elist : {eStr : 1}
	this.resolveEquip = function(uid,elist,cb) {
		var self = this
		if(typeof(elist) != "object"){
			cb(false,"elist not object")
			return
		}
		//参数检查
		for(var i in elist){
			if(!self.equipParse(i) || !Number.isInteger(elist[i])){
				cb(false,i + " 参数错误")
				return
			}
		}
		//查询并扣除装备
		self.consumeEquips(uid,elist,function(flag,err) {
			if(!flag){
				cb(false,err)
				return
			}
			var value = 0
			//计算熔炼值
			for(var i in elist){
				var eInfo = self.equipParse(i)
				var tmpValue = equip_base[eInfo.eId]["sd"]
				tmpValue *= equip_level[eInfo.samsara]["sRate"]
				tmpValue *= equip_quality[eInfo.quality]["sRate"]
				tmpValue *= elist[i]
				tmpValue = parseInt(tmpValue)
				if(Number.isInteger(tmpValue)){
					value += tmpValue
				}else{
					console.log("熔炼值计算错误  ",i,tmpValue)
				}
			}
			if(value > 0){
				self.addItem(uid,currencyId,value)
			}
			cb(true,value)
		})
	}
	//兑换装备
	this.buyEquip = function(uid,eId,samsara,cb) {
		if(!equip_base[eId] || !equip_level[samsara]){
			console.log("addEquip error"+eId,samsara)
			if(cb){
				cb(false,"can't find equip")
			}
			return
		}
		var self = this
		//判断熔炼值是否足够
		var needValue = parseInt(equip_base[eId]["sc"] *  equip_level[samsara]["sRate"])
		if(!Number.isInteger(needValue) || needValue < 0){
			cb(false,"needValue error "+needValue)
			return
		}
		self.getBagItem(uid,currencyId,function(value) {
			if(value < needValue){
				cb(false,"currencyId "+currencyId+" not enough "+value+" "+needValue)
				return
			}
			//扣除货币
			self.addItem(uid,currencyId,-needValue)
			//计算品质
			var rand = Math.random() * qualityAllRand
			var quality = 0
			for(var i = 0;i < quality_weight.length;i++){
				if(rand < quality_weight[i]){
					quality = i
					break
				}
			}
			self.addEquip(uid,eId,samsara,quality,cb)
		})
	}
	//转换成可穿戴装备
	this.changeWearable = function(uid,eId,samsara,quality,cb) {
		var self = this
		if(!equip_base[eId] || !equip_level[samsara] || !equip_quality[quality]){
			console.log("addEquip error"+eId,samsara,quality)
			if(cb){
				cb(false,"can't find equip")
			}
			return
		}
		var elist = {}
		var eStr = self.equipStr(eId,samsara,quality)
		elist[eStr] = 1
		self.consumeEquips(uid,elist,function(flag,err) {
			if(!flag){
				cb(false,err)
				return
			}
			self.addWearable(uid,eId,samsara,quality,cb)
		})
	}
	//可穿戴转换回装备池
	this.changeEquip = function(uid,wId,cb) {
		if(!wId){
			cb(false,"wId "+wId)
			return
		}
		var self = this
		self.redisDao.db.hget("area:area"+self.areaId+":player:"+uid+":wearable",wId,function(err,data) {
			if(err || !data){
				cb(false,err)
				return
			}
			var eInfo = JSON.parse(data)
			if(!eInfo || !eInfo.wId){
				cb(false,"eInfo error "+eInfo)
				return
			}
			if(!equip_base[eInfo.eId] || !equip_level[eInfo.samsara] || !equip_quality[eInfo.quality]){
				if(cb){
					cb(false,"can't find equip")
				}
				return
			}
			self.deleteWearable(uid,wId)
			self.addEquip(uid,eInfo.eId,eInfo.samsara,eInfo.quality,cb)
		})
	}
	//穿戴装备

	//卸下装备

	//装备洗练

	//生成装备信息 装备ID   转生等级  装备品质  强化等级
	this.equipInfo = function(eId,samsara,quality) {
		var info = {
			eId : eId,
			samsara : samsara,
			quality : quality
		}
		return info
	}
	//生成装备字符串
	this.equipStr = function(eId,samsara,quality) {
		return eId+"-"+samsara+"-"+quality
	}
	//根据装备字符串获取装备信息
	this.equipParse = function(str) {
		var list = str.split("-")
		var info = {
			eId : list[0],
			samsara : Number(list[1]),
			quality : Number(list[2])
		}
		if(!equip_base[info.eId] || !equip_level[info.samsara] || !equip_quality[info.quality]){
			console.log("equipParse error"+info.eId,info.samsara,info.quality)
			return false
		}
		return info
	}
	//扣除装备
	this.consumeEquips = function(uid,elist,cb) {
		var self = this
		var eArr = []
		for(var i in elist){
			eArr.push(i)
		}
		//判断装备是否足够
		self.getEquipItemList(uid,eArr,function(list) {
			for(var i = 0;i < eArr.length;i++){
				if(list[i] < elist[eArr[i]]){
					cb(false,"equip not enough "+eArr[i]+" "+list[i]+" "+elist[eArr[i]])
					return
				}
			}
			//扣除装备
			for(var i in elist){
				self.deleteEquip(uid,i,elist[i])
			}
			cb(true)
		})
	}
	//获取指定装备数量
	this.getEquipItemList = function(uid,eArr,cb) {
		var multiList = []
		for(var i = 0;i < eArr.length;i++){
			multiList.push(["hget","area:area"+this.areaId+":player:"+uid+":equip",eArr[i]])
		}
		this.redisDao.multi(multiList,function(err,list) {
			for(var i = 0;i < list.length;i++){
				list[i] = Number(list[i])
			}
			cb(list)
		})
	}
}