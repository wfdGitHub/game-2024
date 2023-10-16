//法宝系统
const async = require("async")
const fabao_type = require("../../../../config/gameCfg/fabao_type.json")
const fabao_qa = require("../../../../config/gameCfg/fabao_qa.json")
const fabao_slot = require("../../../../config/gameCfg/fabao_slot.json")
const fabao_lv = require("../../../../config/gameCfg/fabao_lv.json")
const fabao_att = require("../../../../config/gameCfg/fabao_att.json")
const fabao_spe = require("../../../../config/gameCfg/fabao_spe.json")
const lord_lv = require("../../../../config/gameCfg/lord_lv.json")
const util = require("../../../../util/util.js")
const main_name = "fabao"
var model = function() {
	var self = this
	var local = {}
	//获取数据
	this.getFabaoData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			cb(true,data)
		})
	}
	//法宝穿戴
	this.wearFabao = function(uid,hId,fId,index,cb) {
		var lv = self.getLordLv(uid)
		if(!Number.isInteger(index) || index < 1 || index > lord_lv[lv]["fabao"]){
			cb(false,"法宝栏位未开放")
			return
		}
		var heroInfo,fstr,fInfo,oldFabao
		async.waterfall([
			function(next) {
				//检查英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					next()
				})
			},
			function(next) {
				//检查装备
				self.getObj(uid,main_name,fId,function(data) {
					fstr = data
					if(!fstr){
						next("法宝不存在")
					}else{
						fInfo = JSON.parse(fstr)
						next()
					}
				})
			},
			function(next) {
				//卸下原法宝
				if(heroInfo["fabao"+index]){
					oldFabao = JSON.parse(heroInfo["e"+fInfo.slot])
					self.setObj(uid,main_name,oldFabao.id,heroInfo["fabao"+index])
					delete heroInfo["fabao"+index]
				}
				next()
			},
			function(next) {
				//穿戴装备
				self.delObj(uid,main_name,fId,function() {
					heroInfo["fabao"+index] = fstr
					self.heroDao.setHeroInfo(self.areaId,uid,hId,"fabao"+index,heroInfo["fabao"+index],function(flag,data) {
						cb(true,{heroInfo:heroInfo,oldFabao:oldFabao})
					})
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//法宝卸下
	this.unWearFabao = function(uid,hId,index,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,data) {
			if(!data){
				cb(false,"英雄不存在")
				return
			}
			var heroInfo = data
			if(!heroInfo["fabao"+index]){
				cb(false,"未穿戴法宝")
				return
			}
			var fstr = heroInfo["fabao"+index]
			var fInfo = JSON.parse(fstr)
			delete heroInfo["fabao"+index]
			self.heroDao.delHeroInfo(self.areaId,uid,hId,"fabao"+index,function(flag,data) {
				var award = self.gainFabao(uid,fstr)
				cb(true,{heroInfo:heroInfo,award:award})
			})
		})
	}
	//生成法宝
	this.makeFabao = function(uid,qa,type,cb) {
		var id = self.getLordLastid(uid)
		var info = self.fightContorl.makeFabao(qa,type)
		info.id = id
		info = JSON.stringify(info)
		self.setObj(uid,main_name,id,info)
		if(cb)
			cb(true,info)
		return info
	}
	//获得法宝
	this.gainFabao = function(uid,fstr){
		var fInfo = JSON.parse(fstr)
		self.setObj(uid,main_name,fInfo.id,fstr)
		return fstr
	}
	//获得指定品质装备
	this.makeFabaoByQa = function(uid,qa,type) {
		var id = self.getLordLastid(uid)
		var info = self.fightContorl.makeFabao(qa,type)
		info.id = id
		info = JSON.stringify(info)
		self.setObj(uid,main_name,id,info)
		return info
	}
	//法宝分解
	this.recycleFabao = function(uid,fIds,cb) {
		if(!fIds || !Array.isArray(fIds) || !fIds.length){
			cb(false,"fIds error "+fIds)
			return
		}
		var hIdmap = {}
		for(var i = 0;i < fIds.length;i++){
			if(hIdmap[fIds[i]]){
			  	cb(false,"fId不能重复")
			  	return
			}
			hIdmap[fIds[i]] = true
		}
		self.getHMObj(uid,main_name,fIds,function(list) {
			for(var i = 0;i < list.length;i++){
			 	if(!list[i]){
			 		cb(false,"fId error "+fIds[i])
			 		return
			 	}
			 	list[i] = JSON.parse(list[i])
			}
			var str = self.fightContorl.getFabaoRecycle(list)
			for(var i = 0;i < list.length;i++)
				self.delObj(uid,main_name,list[i]["id"])
			var awardList = self.addItemStr(uid,str,1,"法宝分解")
			cb(true,awardList)
		})
	}
	//法宝洗练
	this.washFabao = function(uid,fId1,fId2,cb) {
		var fstr1,fstr2,fInfo1,fInfo2
		async.waterfall([
			function(next) {
				//获取法宝
				self.getHMObj(uid,main_name,[fId1,fId2],function(list) {
					if(!list[0] || !list[1]){
						next("法宝不存在")
						return
					}
					fstr1 = list[0]
					fstr2 = list[1]
					fInfo1 = JSON.parse(list[0])
					fInfo2 = JSON.parse(list[1])
					if(fInfo1.qa < 3 || fInfo1.qa != fInfo2.qa){
						next("品质错误")
						return
					}
					next()
				})
			},
			function(next) {
				fInfo1.wash1 = self.fightContorl.washFabao(fstr1,fstr2)
				fInfo1.wash2 = self.fightContorl.washFabao(fstr1,fstr2)
				//移除法宝2
				self.delObj(uid,main_name,fId2,function() {
					fInfo1 = JSON.stringify(fInfo1)
					self.setObj(uid,main_name,fId1,fInfo1)
					cb(true,fInfo1)
				})
			},
		],function(err) {
			cb(false,err)
		})
	}
	//法宝洗练保存
	this.saveWashFabao = function(uid,fId,select,cb) {
		self.getObj(uid,main_name,fId,function(fstr) {
			if(!fstr){
				cb(false,"法宝不存在")
				return
			}
			var fInfo = JSON.parse(fstr)
			if(!fInfo["wash"+select]){
				cb(false,"洗练属性不存在")
				return
			}
			for(var i in fInfo["wash"+select])
				fInfo[i] = fInfo["wash"+select][i]
			delete fInfo.wash1
			delete fInfo.wash2
			fInfo = JSON.stringify(fInfo)
			self.setObj(uid,main_name,fId,fInfo)
			cb(true,fInfo)
		})
	}
	//法宝升级
	this.upFabao = function(uid,fId,cb) {
		var fInfo
		async.waterfall([
			function(next) {
				self.getObj(uid,main_name,fId,function(fstr) {
					if(!fstr){
						cb(false,"法宝不存在")
						return
					}
					fInfo = JSON.parse(fstr)
					var lv = self.getLordLv(uid)
					if(lv < fabao_lv[fInfo.lv]["lv"]){
						cb(false,"主公等级不足 "+lv+"/"+fabao_lv[fInfo.lv]["lv"])
						return
					}
					if(!fabao_lv[fInfo.lv+1]){
						cb(false,"已满级")
						return
					}
					next()
				})
			},
			function(next) {
				self.consumeItems(uid,fabao_lv[fInfo.lv]["pc"],1,"法宝升级",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				fInfo.lv++
				fInfo = JSON.stringify(fInfo)
				self.setObj(uid,main_name,fId,fInfo)
				cb(true,fInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//法宝重生
	this.resetFabaoLv = function(uid,fId,cb) {
		self.getObj(uid,main_name,fId,function(fstr) {
			if(!fstr){
				cb(false,"法宝不存在")
				return
			}
			var fInfo = JSON.parse(fstr)
			if(fInfo.lv <= 1){
				cb(false,"未升级")
				return
			}
			var pr = "2000:"+fabao_lv[fInfo.lv]["pr"]
			fInfo.lv = 1
			fInfo = JSON.stringify(fInfo)
			self.setObj(uid,main_name,fId,fInfo,function() {
				var awardList = self.addItemStr(uid,pr,1,"法宝重生")
				cb(true,{fInfo:fInfo,awardList:awardList})
			})
		})
	}
	//法宝加点
	this.slotPointFabao = function(uid,fId,slots,cb) {
		self.getObj(uid,main_name,fId,function(fstr) {
			if(!fstr){
				cb(false,"法宝不存在")
				return
			}
			if(!self.fightContorl.slotPointFabao(fstr,slots)){
				cb(false,"加点错误")
				return
			}
			var fInfo = JSON.parse(fstr)
			fInfo.slots = slots
			fInfo = JSON.stringify(fInfo)
			self.setObj(uid,main_name,fId,fInfo)
			cb(true,fInfo)
		})
	}
	//法宝洗练-穿戴
	this.washFabaoByHero = function(uid,hId,index,fId2,cb) {
		var fstr1,fstr2,fInfo1,fInfo2,heroInfo
		async.waterfall([
			function(next) {
				//获取主法宝
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["fabao"+index]){
						next("未穿戴法宝")
						return
					}
					fstr1 = heroInfo["fabao"+index]
					fInfo1 = JSON.parse(fstr1)
					next()
				})
			},
			function(next) {
				//获取副法宝
				self.getObj(uid,main_name,fId2,function(data) {
					if(!data){
						cb(false,"法宝不存在")
						return
					}
					fstr2 = data
					fInfo2 = JSON.parse(fstr2)
					if(fInfo1.qa < 3 || fInfo1.qa != fInfo2.qa){
						next("品质错误")
						return
					}
					next()
				})
			},
			function(next) {
				fInfo1.wash1 = self.fightContorl.washFabao(fstr1,fstr2)
				fInfo1.wash2 = self.fightContorl.washFabao(fstr1,fstr2)
				//移除法宝
				self.delObj(uid,main_name,fId2,function() {
					heroInfo["fabao"+index] = JSON.stringify(fInfo1)
					self.heroDao.onlySetHeroInfo(uid,hId,"fabao"+index,heroInfo["fabao"+index])
					cb(true,heroInfo)
				})
			},
		],function(err) {
			cb(false,err)
		})
	}
	//法宝洗练保存-穿戴
	this.saveWashFabaoByHero = function(uid,hId,index,select,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,data) {
			if(!data){
				cb(false,"英雄不存在")
				return
			}
			var heroInfo = data
			if(!heroInfo["fabao"+index]){
				cb(false,"法宝不存在")
				return
			}
			var fInfo = JSON.parse(heroInfo["fabao"+index])
			if(!fInfo["wash"+select]){
				cb(false,"洗练属性不存在")
				return
			}
			for(var i in fInfo["wash"+select])
				fInfo[i] = fInfo["wash"+select][i]
			delete fInfo.wash1
			delete fInfo.wash2
			heroInfo["fabao"+index] = JSON.stringify(fInfo)
			self.heroDao.setHeroInfo(self.areaId,uid,hId,"fabao"+index,heroInfo["fabao"+index])
			cb(true,heroInfo)
		})
	}
	//法宝升级-穿戴
	this.upFabaoByHero = function(uid,hId,index,cb) {
		var fInfo,heroInfo
		async.waterfall([
			function(next) {
				self.heroDao.getHeroOne(uid,hId,function(flag,data) {
					if(!data){
						next("英雄不存在")
						return
					}
					heroInfo = data
					if(!heroInfo["fabao"+index]){
						next("法宝不存在")
						return
					}
					fInfo = JSON.parse(heroInfo["fabao"+index])
					var lv = self.getLordLv(uid)
					if(lv < fabao_lv[fInfo.lv]["lv"]){
						next("主公等级不足 "+lv+"/"+fabao_lv[fInfo.lv]["lv"])
						return
					}
					if(!fabao_lv[fInfo.lv+1]){
						next("已满级")
						return
					}
					next()
				})
			},
			function(next) {
				self.consumeItems(uid,fabao_lv[fInfo.lv]["pc"],1,"法宝升级",function(flag,err) {
					if(flag)
						next()
					else
						next(err)
				})
			},
			function(next) {
				fInfo.lv++
				heroInfo["fabao"+index] = JSON.stringify(fInfo)
				self.heroDao.setHeroInfo(self.areaId,uid,hId,"fabao"+index,heroInfo["fabao"+index])
				cb(true,heroInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//法宝重生-穿戴
	this.resetFabaoLvByHero = function(uid,hId,index,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,data) {
			if(!data){
				cb(false,"英雄不存在")
				return
			}
			var heroInfo = data
			if(!heroInfo["fabao"+index]){
				cb(false,"法宝不存在")
				return
			}
			var fInfo = JSON.parse(heroInfo["fabao"+index])
			if(fInfo.lv <= 1){
				cb(false,"未升级")
				return
			}
			var pr = "2000:"+fabao_lv[fInfo.lv]["pr"]
			fInfo.lv = 1
			heroInfo["fabao"+index] = JSON.stringify(fInfo)
			self.heroDao.setHeroInfo(self.areaId,uid,hId,"fabao"+index,heroInfo["fabao"+index],function() {
				var awardList = self.addItemStr(uid,pr,1,"法宝重生")
				cb(true,{heroInfo:heroInfo,awardList:awardList})
			})
		})
	}
	//法宝加点-穿戴
	this.slotPointFabaoByHero = function(uid,hId,index,slots,cb) {
		self.heroDao.getHeroOne(uid,hId,function(flag,data) {
			if(!data){
				cb(false,"英雄不存在")
				return
			}
			var heroInfo = data
			var fstr = heroInfo["fabao"+index]
			if(!fstr){
				cb(false,"法宝不存在")
				return
			}
			if(!self.fightContorl.slotPointFabao(fstr,slots)){
				cb(false,"加点错误")
				return
			}
			var fInfo = JSON.parse(fstr)
			fInfo.slots = slots
			fInfo = JSON.stringify(fInfo)
			heroInfo["fabao"+index] = JSON.stringify(fInfo)
			self.heroDao.setHeroInfo(self.areaId,uid,hId,"fabao"+index,heroInfo["fabao"+index],function() {
				cb(true,{heroInfo:heroInfo})
			})
		})
	}
}
module.exports = model