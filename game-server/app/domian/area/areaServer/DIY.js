//定制接口
const main_name = "diy"
const async = require("async")
const DIY_hero = require("../../../../config/gameCfg/DIY_hero.json")
module.exports = function() {
	var self = this
	//获取定制数据
	this.getDIYData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			cb(true,data)
		})
	}
	//设置定制英雄
	this.setDIYHero = function(uid,id,args,cb) {
		self.getObj(uid,main_name,id+"_state",function(data) {
			if(data){
				cb(false,"该英雄已定制完成")
				return
			}
			var info = self.fightContorl.gainDIYHero(id,args)
			if(!info){
				cb(false,"参数错误")
				return
			}
			self.setObj(uid,main_name,id+"_args",JSON.stringify(args))
			self.setObj(uid,main_name,id+"_price",JSON.stringify(info.price))
			self.setObj(uid,main_name,id+"_info",JSON.stringify(info.heroInfo))
			cb(true,info)
		})
	}
	//获得定制英雄
	this.gainDIYHero = function(uid,id,cb) {
		self.getObj(uid,main_name,id+"_info",function(heroInfo) {
			if(!heroInfo){
				cb(false,"英雄未定制")
				return
			}
			self.incrbyObj(uid,main_name,id+"_state",1,function(data) {
				if(data !== 1){
					cb(false,"英雄已获得")
					return
				}
				heroInfo = JSON.parse(heroInfo)
				heroInfo = self.addPlayerHero(uid,heroInfo)
				cb(true,heroInfo)
			})
		})
	}
	//购买货币定制英雄
	this.buyDIYHero = function(uid,id,cb) {
		if(!DIY_hero[id] || DIY_hero[id]["type"] != 1){
			cb(false,"该英雄非货币定制英雄")
			return
		}
		self.getHMObj(uid,main_name,[id+"_state",id+"_price",id+"_info"],function(list) {
			var state = list[0]
			var price = list[1]
			var heroInfo = list[2]
			if(state || !price || !heroInfo){
				cb(false,"不可定制")
				return
			}
			self.consumeItems(uid,DIY_hero[id]["item"]+":"+price,1,"定制英雄",function(flag,err) {
				if(!flag){
					cb(false,err)
					return
				}
				self.gainDIYHero(uid,id,cb)
			})
		})
	}
}