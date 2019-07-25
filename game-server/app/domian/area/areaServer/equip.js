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
var wash_weight = []
var washAllRand = 0
for(var i = 1;i <= 5;i++){
	washAllRand += equip_config["wash_"+i].value
	wash_weight.push(washAllRand)
}
var washArr = []
for(var i in equip_wash[0]){
	washArr.push(i)
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
	this.addWearable = function(uid,eInfo,cb) {
		if(!equip_base[eInfo.eId] || !equip_level[eInfo.samsara] || !equip_quality[eInfo.quality]){
			console.log("addWearable error"+eInfo.eId,eInfo.samsara,eInfo.quality)
			if(cb){
				cb(false,"can't find equip")
			}
			return
		}
		var self = this
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
	//获得已穿戴装备
	this.addDressed = function(uid,eInfo,cb) {
		var self = this
		self.getRoleArg(uid,"d_"+eInfo.eId,function(data) {
			if(data){
				//若已穿戴，将装备放回可穿戴装备池
				self.addWearable(uid,JSON.parse(data))
			}
			self.deleteWearable(uid,eInfo.wId)
			self.changeCharacterInfo(uid,10001,"d_"+eInfo.eId,JSON.stringify(eInfo),function(flag) {
				if(cb)
					cb(flag)
			})
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
			var eInfo = self.equipInfo(eId,samsara,quality)
			eInfo.wId = uuid.v1()
			self.addWearable(uid,eInfo,cb)
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
	this.dressedEquip = function(uid,wId,cb) {
		var self = this
		self.redisDao.db.hget("area:area"+self.areaId+":player:"+uid+":wearable",wId,function(err,data) {
			if(err || !data){
				cb(false,"装备不存在")
				return
			}
			var eInfo = JSON.parse(data)
			if(!eInfo){
				cb(false,"eInfo error "+eInfo)
				return
			}
			//不能超过人物等级
			var curLv = self.players[uid].characters[0].level
			var samsara = Math.floor(((curLv - 1) / 100))
			if(eInfo.samsara > samsara){
				cb(false,"未到达穿戴等级")
				return
			}
			self.addDressed(uid,eInfo,cb)
		})
	}
	//卸下装备
	this.takeofEquip = function(uid,eId,cb) {
		var self = this
		self.getRoleArg(uid,"d_"+eId,function(data) {
			if(!data){
				cb(false,"未穿戴装备")
				return
			}
			var eInfo = JSON.parse(data)
			self.delCharacterInfo(uid,10001,"d_"+eId)
			self.addWearable(uid,eInfo,cb)
		})
	}
	//可穿戴装备洗练
	this.wearableWash = function(uid,wId,locks,cb) {
		var self = this
		self.redisDao.db.hget("area:area"+self.areaId+":player:"+uid+":wearable",wId,function(err,data) {
			if(err || !data){
				cb(false,"装备不存在")
				return
			}
			var eInfo = JSON.parse(data)
			self.equipWash(uid,eInfo,locks,function(flag,newInfo) {
				if(!flag){
					cb(false,newInfo)
					return
				}
				self.addWearable(uid,newInfo,cb)
			})
		})
	}
	//已穿戴装备洗练
	this.dressedWash = function(uid,eId,locks,cb) {
		var self = this
		self.redisDao.db.hget("area:area"+self.areaId+":player:"+uid+":wearable",wId,function(err,data) {
			if(err || !data){
				cb(false,"未穿戴装备")
				return
			}
			var eInfo = JSON.parse(data)
			self.equipWash(uid,eInfo,locks,function(flag,newInfo) {
				if(!flag){
					cb(false,newInfo)
					return
				}
				self.changeCharacterInfo(uid,10001,"d_"+newInfo.eId,JSON.stringify(newInfo),function(flag) {
					if(cb)
						cb(flag)
				})
			})
		})
	}
	//装备洗练
	this.equipWash = function(uid,eInfo,locks,cb) {

		if(!equip_wash[eInfo.samsara] && equip_wash[eInfo.samsara + 1]){
			cb(false,"配置错误")
			return
		}
		// wash_weight
		var pc = equip_level[eInfo.samsara]["wpc"]
		var wcount = equip_quality[eInfo.quality]["wash"]
		var oldWash = eInfo.wash
		var lockMap = {}
		var lockCount = 0
		if(oldWash){
			oldWash = JSON.parse(oldWash)
			if(locks){
				for(var i = 0;i < locks.length;i++){
					if(Number.isInteger(locks[i]) && locks[i] >= 0 && locks[i] < wcount && !lockMap[locks[i]]){
						lockMap[locks[i]] = true
						lockCount++
					}
				}
			}
		}
		var rate = Math.pow(2,lockCount)
		this.consumeItems(uid,pc,rate,function(flag,err) {
			if(!flag){
				cb(false,err)
				return
			}
			var baseWashLv = equip_level[eInfo.samsara]["wash"]
			var newWash = []
			for(var i = 0;i < wcount;i++){
				if(!lockMap[i] || !oldWash[i]){
					var rand = Math.random() * washAllRand
					var quality = 0
					for(var j = 0;j < wash_weight.length;j++){
						if(rand < wash_weight[j]){
							quality = j
							break
						}
					}
					var endWashLv = baseWashLv + quality
					var name = washArr[Math.floor(Math.random() * washArr.length)]
					var value = equip_wash[eInfo.samsara][name] + Math.floor(Math.random() * (equip_wash[eInfo.samsara + 1][name] - equip_wash[eInfo.samsara][name]))
					var str = name+":"+value
					newWash.push({pa : str,quality : quality})
				}else{
					newWash.push(oldWash[i])
				}
			}
			eInfo.wash = JSON.stringify(newWash)
			cb(true,eInfo)
		})
	}
	//装备强化
	this.equipIntensify = function(uid,eId,cb) {
		var self = this
		if(!equip_base[eId]){
			cb(false,"eId error "+eId)
			return
		}
		if(!self.players[uid] || !self.players[uid].characters[0]){
			cb(false,"system error")
			return
		}
		var characterInfo = self.players[uid].characters[0]
		var curLv = Number(characterInfo.level)
		var samsara = Math.floor((curLv / 100))

		self.getRoleArg(uid,"i_"+eId,function(data) {
			var curIL = Number(data)
			if(!curIL){
				curIL = 0
			}
			curIL++
			if(curIL > equip_level[samsara]["il"]){
				cb(false,"已达到当前等级上限")
				return
			}
			var isamsara = Math.floor(curIL / 10)
			var ilv = Math.floor((curIL - 1) % 10 + 1)
			if(!equip_level[isamsara] || !equip_level[isamsara]["ipc"]){
				cb(false,"不可升级")
				return
			}
			var ipc = equip_level[isamsara]["ipc"]
			var pc = equip_intensify[ilv]["pc"]
			self.consumeItems(uid,pc,ipc,function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				self.incrbyCharacterInfo(uid,10001,"i_"+eId,1,cb)
			})
		})
	}
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