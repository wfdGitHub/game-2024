var fb_base = require("../../../../config/gameCfg/fb_base.json")
var fb_cfg = require("../../../../config/gameCfg/fb_cfg.json")
var async = require("async")
var currencyId = fb_cfg["currencyId"]["value"]
var cstr = currencyId+":1"
for(var type in fb_base){
	for(var i = 1;i <= 3;i++){
		fb_base[type]["boss"+i] = JSON.parse(fb_base[type]["boss"+i])
	}
}
//副本系统
var uuid = require("uuid")
module.exports = function() {
	var self = this
	//开启副本
	this.openFB = function(uid,type,cb) {
		//参数判断
		if(!fb_base[type]){
			console.error("fb type error"+type)
			cb(false,"副本不存在")
			return
		}
		async.waterfall([
			function(next) {
				//判断主角等级
				let lv = self.getLordLv(uid)
				if(lv < fb_base[type]["openLevel"] || lv < fb_cfg["open"]["value"]){
					console.error("openLevel "+lv+" / "+fb_base[type]["openLevel"])
					next("等级不足")
				}else{
					next()
				}
			},
			function(next) {
				//判断是否已进入副本
				self.getObj(uid,"fb",type,function(bossId) {
					if(bossId){
						console.error("已进入副本 "+bossId)
						next("已进入副本")
						return
					}
					next()
				})
			},
			function(next) {
				//扣除道具
				var dayStr = (new Date()).toDateString()
				//判断是否今日首次
				self.getObj(uid,"fb","lastDay",function(data) {
					if(dayStr != data){
						//首次进入
						self.setObj(uid,"fb","lastDay",dayStr)
						next()
					}else{
						//非首次 扣除道具
						self.consumeItems(uid,cstr,1,function(flag,err) {
							if(!flag){
								cb(false,err)
								return
							}
							next()
						})
					}
				})
			},
			function(next) {
				//进入副本
				self.joinFB(uid,type,cb)
			}
		],function(err) {
				cb(false,err)
		})
	}
	//加入副本
	this.joinFB = function(uid,type,cb) {
		self.setObj(uid,"fb",type,1)
		cb(true)
	}
	//退出副本
	this.quitFB = function(uid,type,cb) {
		self.getObj(uid,"fb",type,function(data) {
			if(!data){
				cb(false,"未进入副本")
			}else{
				self.delObj(uid,"fb",type)
				cb(true)
			}
		})
	}
	//挑战副本BOSS
	this.challengeFBBoss = function(uid,type,verify,cb) {
		async.waterfall([
			function(next) {
				//获取副本数据
				self.getObj(uid,"fb",type,function(bossId) {
					if(!bossId)
						next("未进入副本")
					else
						next(null,Number(bossId))
				})
			},
			function(bossId,next) {
			    var fightInfo = self.getFightInfo(uid)
			    if(!fightInfo){
			    	next("未准备")
			    	return
			    }
			   	var atkTeam = fightInfo.team
			   	var seededNum = fightInfo.seededNum
			   	var defTeam = fb_base[type]["boss"+bossId]
			    var winFlag = self.fightContorl.beginFight(atkTeam,defTeam,{seededNum : seededNum})
			    if(verify !== JSON.stringify(self.fightContorl.getFightRecord()[0])){
			    	next({"text":"战斗验证错误","fightRecord":self.fightContorl.getFightRecord()})
			    	return
			    }
			    if(winFlag){
		    		var info = {
		    			winFlag : winFlag,
		    			bossId : bossId
		    		}
		    		if(bossId >= 3){
		    			self.delObj(uid,"fb",type)
		    			//通关奖励
			    		var awardList1 = self.addItemStr(uid,fb_base[type]["passAward"])
			    		var awardList2 = self.openChestStr(uid,fb_base[type]["randAward"])
			    		info.passAward = awardList1.concat(awardList2)
		    		}else{
		    			self.incrbyObj(uid,"fb",type,1)
		    		}
		    		var bossAwards = []
		    		bossAwards = bossAwards.concat(self.openChestStr(uid,fb_base[type]["awardList"+bossId]))
		    		info.bossAward = bossAwards
		    		cb(true,info)
			    }else{
			    	cb(false,self.fightContorl.getFightRecord())
			    }
			},
		],function(err) {
			cb(false,err)
		})
	}
	//获取副本数据
	this.getFBInfo = function(uid,cb) {
		var dayStr = (new Date()).toDateString()
		self.getObjAll(uid,"fb",function(data) {
			if(!data){
				data = {}
			}
			data.dayStr = dayStr
			cb(data)
		})
	}
}