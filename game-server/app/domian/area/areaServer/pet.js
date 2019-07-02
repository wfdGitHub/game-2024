var petCfg = require("../../../../config/gameCfg/pet.json")
//宠物系统
module.exports = function() {
	this.washTmp = {}
	//增加宠物栏
	this.addPetAmount = function(uid,cb) {
		var self = this
		self.petDao.addPetAmount(self.areaId,uid,function(flag,data) {
			if(flag){
				if(!self.players[uid].petAmount)
					self.players[uid].petAmount = 0
				self.players[uid].petAmount += 1
			}
			if(cb)
				cb(flag,self.players[uid].petAmount)
		})
	}
	//获得宠物
	this.obtainPet = function(uid,characterId,cb) {
		var self = this
		self.petDao.obtainPet(self.areaId,uid,characterId,function(flag,petInfo) {
			if(flag){
				self.players[uid].pets[petInfo.id] = petInfo
			}
			if(cb)
				cb(flag,petInfo)
		})
	}
	//移除宠物
	this.removePet = function(uid,id,cb) {
		var self = this
		self.petDao.removePet(self.areaId,uid,id,function(flag) {
			if(flag){
				delete self.players[uid].pets[id]
				if(self.players[uid].fightPet == id){
					self.petRest(self.areaId,uid,cb)
				}else{
					cb(flag)
				}
			}else{
				cb(false)
			}
		})
	}
	//设置宠物出战
	this.setFightPet = function(uid,id,cb) {
		var self = this
		self.petDao.setFightPet(self.areaId,uid,id,function(flag) {
			if(flag){
				self.players[uid].fightPet = id
			}
			cb(flag)
		})
	}
	//宠物休息
	this.petRest = function(uid,cb) {
		var self = this
		self.petDao.petRest(self.areaId,uid,function(flag) {
			if(flag){
				delete self.players[uid].fightPet
			}
			cb(flag)
		})
	}
	//根据id获取宠物信息
	this.getPetById = function(uid,id) {
		if(this.players[uid] && this.players[uid].pets){
			if(this.players[uid].pets[id]){
				return this.players[uid].pets[id]
			}
		}
		return false
	}
	//增减宠物属性
	this.incrbyPetInfo = function(uid,id,name,value,cb) {
		var self = this
		self.petDao.incrbyPetInfo(this.areaId,uid,id,name,value,function(flag,data) {
			if(flag){
				if(self.players[uid] && self.players[uid].pets && self.players[uid].pets[id]){
					if(!self.players[uid].pets[id][name]){
						self.players[uid].pets[id][name] = 0
					}
					self.players[uid].pets[id][name] += value
					var notify = {
						"type" : "petInfoChange",
						"id" : id,
						"name" : name,
						"value" : value,
						"curValue" : self.players[uid].pets[id][name]
					}
					self.sendToUser(uid,notify)
				}
			}
			if(cb)
				cb(flag,data)
		})
	}
	//获取宠物图鉴
	this.getPetArchive = function(uid,cb) {
		this.petDao.getPetArchive(this.areaId,uid,function(data) {
		    cb(data)
		 })
	}
	//宠物洗练
	this.washPet = function(uid,id,cb) {
		if(!this.players[uid] || !this.players[uid].pets || !this.players[uid].pets[id]){
			cb(false)
			return
		}
		var self = this
		var characterId = this.players[uid].pets[id].characterId
		var c = petCfg[characterId]
		var consumeStr = petCfg[characterId].washPc
		// console.log("consumeStr",consumeStr)
		var strList = consumeStr.split("&")
		var items = []
		var values = []
		var self = this
		var variation = false
		if(this.players[uid].pets[id].variation == 1){
			variation = true
		}
		strList.forEach(function(m_str) {
			var m_list = m_str.split(":")
			var itemId = Number(m_list[0])
			var value = Number(m_list[1])
			if(variation){
				value = Math.round(value * 3)
			}
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
			//洗练
			var petInfo = self.players[uid].pets[id]
			var tmpPetInfo = self.petDao.createPet(petInfo.characterId)
			if(variation || Math.random() < 0.03){
				tmpPetInfo.variation = 1
				tmpPetInfo.strAp += petCfg[characterId].vPhy
				tmpPetInfo.agiAp += petCfg[characterId].vPhy
				tmpPetInfo.vitAp += petCfg[characterId].vPhy
				tmpPetInfo.phyAp += petCfg[characterId].vPhy
				tmpPetInfo.growth += petCfg[characterId].vgrowth
			}else{
				tmpPetInfo.variation = 0
			}
			self.washTmp[id] = tmpPetInfo
			cb(true,tmpPetInfo)
		})
	}
	//保存洗练结果
	this.saveWashPet = function(uid,id,cb) {
		if(!this.players[uid] || !this.players[uid].pets || !this.players[uid].pets[id] || !this.washTmp[id]){
			cb(false)
			return
		}
		var tmpPetInfo = this.washTmp[id]
		for(var i in tmpPetInfo){
			this.players[uid].pets[id][i] = tmpPetInfo[i]
		}
		this.redisDao.db.hmset("area:area"+this.areaId+":player:"+uid+":pets:"+id,tmpPetInfo)
		delete this.washTmp[id]
		cb(true,this.players[uid].pets[id])
	}
}