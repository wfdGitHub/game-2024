var petCfg = require("../../../../config/gameCfg/pet.json")
//宠物系统
module.exports = function() {
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
	//宠物进阶

	//宠物升级

	//宠物转生

	//宠物洗练
}