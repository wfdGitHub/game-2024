//英雄图鉴(收集)
const main_name = "gather"
const heros = require("../../../../config/gameCfg/heros.json")
const star_base = require("../../../../config/gameCfg/star_base.json")
module.exports = function() {
	var self = this
	//获得已激活图鉴
	this.getHeroBook = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			cb(true,data)
		})
	}
	//激活图鉴
	this.activateHeroBook = function(uid,id,cb) {
		if(!heros[id]){
			cb(false,"id error "+id)
			return
		}
		self.redisDao.db.hget("player:user:"+uid+":heroArchive",id,function(err,data) {
			if(!data){
				cb(false,"该英雄未获得 "+data)
				return
			}
			self.getObj(uid,main_name,id,function(star) {
				if(star){
					cb(false,"该英雄图鉴已激活")
					return
				}
				var star = heros[id]["min_star"]
				self.setObj(uid,main_name,id,star)
				self.incrbyLordData(uid,"gather",star_base[star]["gather"],function(data) {
					self.setGather(uid,Number(data))
					cb(true,{star : star,gather : data})
				})
			})
		})
	}
	//升级图鉴
	this.upgradeHeroBook = function(uid,id,cb) {
		if(!heros[id]){
			cb(false,"id error "+id)
			return
		}
		console.log("upgradeHeroBook",uid,id)
		self.redisDao.db.hget("player:user:"+uid+":heroArchive",id,function(err,data) {
			if(!data){
				cb(false,"该英雄未获得")
				return
			}
			console.log("data",data)
			self.getObj(uid,main_name,id,function(star) {
				console.log("star",satr,data <= star)
				if(!star || data <= star){
					cb(false,"该英雄图鉴未满足升级条件")
					return
				}
				star = Number(star)+1
				self.incrbyObj(uid,main_name,id,1)
				self.incrbyLordData(uid,"gather",star_base[star]["gather"],function(data) {
					self.setGather(uid,Number(data))
					cb(true,{star : star,gather : data})
				})
			})
		})
	}
}