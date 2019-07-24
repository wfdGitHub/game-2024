//装备系统
var equip_base = require("../../../../config/gameCfg/equip_base.json")
var equip_config = require("../../../../config/gameCfg/equip_config.json")
var equip_intensify = require("../../../../config/gameCfg/equip_intensify.json")
var equip_level = require("../../../../config/gameCfg/equip_level.json")
var equip_quality = require("../../../../config/gameCfg/equip_quality.json")
var equip_wash = require("../../../../config/gameCfg/equip_wash.json")
var currencyId = equip_config.currencyId.value
module.exports = function() {
	//获取装备列表
	this.getEquipList = function(uid,cb) {
		this.redisDao.db.hgetall("area:area"+this.areaId+":player:"+uid+":equip",function(err,data) {
			if(cb){
				cb(data)
			}
		})
	}
	//获得新装备
	this.addEquip = function(uid,eId,samsara,quality,cb) {
		if(!equip_base[eId] || !equip_level[samsara] || !equip_quality[quality]){
			console.log("addEquip error"+eId,samsara,quality)
			if(cb){
				cb(false,"can't find equip")
			}
			return
		}
		var estr = this.equipStr(eId,samsara,quality)
		var self = this
		this.redisDao.db.hincrby("area:area"+this.areaId+":player:"+uid+":equip",estr,1,function(err,data) {
			var notify = {
				"type" : "addEquip",
				"equip" : estr,
				"value" : 1,
				"curValue" : data
			}
			self.sendToUser(uid,notify)
			if(cb){
				cb(true)
			}
		})
	}
	//删除装备
	this.deleteEquip = function(uid,estr,value) {
		this.redisDao.db.hincrby("area:area"+this.areaId+":player:"+uid+":equip",estr,-value)
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
	this.buyEquip = function(uid,eId,samsara) {
		
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