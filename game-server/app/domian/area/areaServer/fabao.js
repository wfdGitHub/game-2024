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
			if(heroInfo["fabao"+index]){
				var fstr = heroInfo["fabao"+index]
				var fInfo = JSON.parse(fstr)
				delete heroInfo["fabao"+index]
				self.heroDao.delHeroInfo(self.areaId,uid,hId,"fabao"+index,function(flag,data) {
					var award = self.gainFabao(uid,fstr)
					cb(true,{heroInfo:heroInfo,award:award})
				})
			}
		})
	}
	//生成法宝
	this.makeFabao = function(uid,type,qa,cb) {
		var id = self.getLordLastid(uid)
		var info = self.fightContorl.makeFabao(qa,type)
		info.id = id
		info = JSON.stringify(info)
		self.setObj(uid,main_name,id,info)
		cb(true,info)
	}
	//获得法宝
	this.gainFabao = function(uid,fstr){
		fInfo = JSON.parse(fstr)
		self.setObj(uid,main_name,fInfo.id,fstr)
		return fInfo
	}
	//法宝洗练
	this.washFabao = function(uid,fId1,fId2) {
		var fstr1,fstr2,fInfo1,fInfo2
		async.waterfall([
			function(next) {
				//获取法宝
				self.getHMObj(uid,main_name,[fId1,fId2],function(list) {
					if(!list[0] || !list[1]){
						next("法宝不存在")
						return
					}
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
					self.setObj(uid,main_name,fId1,JSON.stringify(fInfo1))
					cb(true,fInfo1)
				})
			},
		],function(err) {
			cb(false,err)
		})
	}
	//法宝洗练保存
	this.saveWashFabao = function(uid,fId,index) {
		self.getObj(uid,main_name,fId,function(fstr) {
			if(!fstr){
				cb(false,"法宝不存在")
				return
			}
			var fInfo = JSON.parse(fstr)
			if(!fInfo["wash"+index]){
				cb(false,"洗练属性不存在")
				return
			}
			for(var i in fInfo["wash"+index])
				fInfo[i] = fInfo["wash"+index][i]
			delete fInfo.wash1
			delete fInfo.wash2
			self.setObj(uid,main_name,fId,JSON.stringify(fInfo))
			cb(true,fInfo)
		})
	}
	//法宝升级
	this.upFabao = function(uid,fId) {
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
				self.setObj(uid,main_name,fId,JSON.stringify(fInfo))
				cb(true,fInfo)
			}
		],function(err) {
			cb(false,err)
		})
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
			self.setObj(uid,main_name,fId,JSON.stringify(fInfo),function() {
				var awardList = self.addItemStr(uid,pr,1,"法宝重生")
				cb(true,{fInfo:fInfo,awardList:awardList})
			})
		})
	}
}
module.exports = model