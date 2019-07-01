var petCfg = require("../../../../config/gameCfg/pet.json")
//宠物系统
module.exports = function() {
	//增加宠物栏
	this.addPetStore = function(areaId,uid,cb) {
		var self = this
		self.petDao.addPetAmount(areaId,uid,function(flag,data) {
			if(flag){
				if(!self.players[uid].petAmount)
					self.players[uid].petAmount = 0
				self.players[uid].petAmount += 1
			}
			cb(flag,self.players[uid].petAmount)
		})
	}
	//获得宠物
	this.obtainPet = function(areaId,uid,characterId,cb) {
		var self = this
		self.petDao.obtainPet(areaId,uid,characterId,function(flag,petInfo) {
			if(flag){
				self.players[uid].pets[petInfo.id] = petInfo
			}
			cb(flag,petInfo)
		})
	}
	//移除宠物
	this.removePet = function(areaId,uid,id,cb) {
		var self = this
		self.petDao.removePet(areaId,uid,id,function(flag) {
			if(flag){
				delete self.players[uid].pets[id]
				if(self.players[uid].fightPet == id){
					self.petRest(areaId,uid,cb)
				}else{
					cb(flag)
				}
			}else{
				cb(false)
			}
		})
	}
	//设置宠物出战
	this.setFightPet = function(areaId,uid,id,cb) {
		var self = this
		self.petDao.setFightPet(areaId,uid,id,function(flag) {
			if(flag){
				self.players[uid].fightPet = id
			}
			cb(flag)
		})
	}
	//宠物休息
	this.petRest = function(areaId,uid,cb) {
		var self = this
		self.petDao.petRest(areaId,uid,function(flag) {
			if(flag){
				delete self.players[uid].fightPet
			}
			cb(flag)
		})
	}
	//宠物进阶

	//宠物升级

	//宠物转生

	//宠物洗练
}