//兵符系统
const main_name = "bingfu"
const async = require("async")
const bingfu_lv = require("../../../../config/gameCfg/bingfu_lv.json")
const bingfu_att = require("../../../../config/gameCfg/bingfu_att.json")
const talent_list = require("../../../../config/gameCfg/talent_list.json")
module.exports = function() {
	var self = this
	var local = {}
	//获取兵符数据
	this.getBingfuData = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			cb(true,data)
		})
	}
	//获取兵符
	this.gainBingfu = function(uid,bfInfo) {
		bfInfo = bfInfo ? bfInfo : {}
		bfInfo = self.fightContorl.bingfuEntity.createBingfu(bfInfo.type,bfInfo.lv,bfInfo.qa,bfInfo.sec_att,bfInfo.sec_vel)
		bfInfo.id = self.getLordLastid(uid)
		local.saveBingfu(uid,bfInfo)
		var notify = {
			type : "gainBingfu",
			bfInfo : bfInfo
		}
		self.sendToUser(uid,notify)
		return bfInfo
	}
	//洗练兵符 主属性和次级属性重新生成
	this.washBingfu = function(uid,bId,cb) {
		var bfInfo = {}
		async.waterfall([
			function(next) {
				//获取兵符
				local.getBingfuInfo(uid,bId,function(flag,data) {
					if(flag){
						bfInfo = data
						next()
					}else{
						next(data)
					}
				})
			},
			function(next) {
				//消耗道具
				var pcStr = self.fightContorl.bingfuEntity.getWashPcStr(bfInfo)
				self.consumeItems(uid,pcStr,1,"洗练兵符",function(flag,err) {
					if(flag){
						next()
					}else{
						cb(false,err)
					}
				})
			},
			function(next) {
				//洗练兵符
				bfInfo = self.fightContorl.bingfuEntity.washBingfu(bfInfo)
				local.saveBingfu(uid,bfInfo)
				cb(true,bfInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//精炼兵符 次级属性重新生成
	this.refineBingfu = function(uid,bId,cb) {
		var bfInfo = {}
		async.waterfall([
			function(next) {
				//获取兵符
				local.getBingfuInfo(uid,bId,function(flag,data) {
					if(flag){
						bfInfo = data
						next()
					}else{
						next(data)
					}
				})
			},
			function(next) {
				//消耗道具
				var pcStr = self.fightContorl.bingfuEntity.getRefinePcStr(bfInfo)
				self.consumeItems(uid,pcStr,1,"精炼兵符",function(flag,err) {
					if(flag){
						next()
					}else{
						cb(false,err)
					}
				})
			},
			function(next) {
				//精炼兵符
				bfInfo = self.fightContorl.bingfuEntity.randSecVel(bfInfo)
				local.saveBingfu(uid,bfInfo)
				cb(true,bfInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//保存洗练属性
	this.replaceBingfu = function(uid,bId,cb) {
		var bfInfo = {}
		async.waterfall([
			function(next) {
				//获取兵符
				local.getBingfuInfo(uid,bId,function(flag,data) {
					if(flag){
						bfInfo = data
						next()
					}else{
						next(data)
					}
				})
			},
			function(next) {
				//保存洗练属性
				bfInfo = self.fightContorl.bingfuEntity.saveTmpData(bfInfo)
				local.saveBingfu(uid,bfInfo)
				cb(true,bfInfo)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//洗练已穿戴兵符
	this.washBingfuForWear = function(uid,type,cb) {
		var bfData = {}
		var bfInfo = {}
		async.waterfall([
			function(next) {
				var bfStr = self.getBfData(uid)
				if(bfStr)
					bfData = JSON.parse(bfStr)
				if(!bfData[type])
					next("未穿戴")
				else{
					bfInfo = bfData[type]
					next()
				}
			},
			function(next) {
				//消耗道具
				var pcStr = self.fightContorl.bingfuEntity.getWashPcStr(bfInfo)
				self.consumeItems(uid,pcStr,1,"洗练兵符",function(flag,err) {
					if(flag){
						next()
					}else{
						cb(false,err)
					}
				})
			},
			function(next) {
				//洗练兵符
				bfInfo = self.fightContorl.bingfuEntity.washBingfu(bfInfo)
				bfData[type] = bfInfo
				bfData = JSON.stringify(bfData)
				self.setBingfuInfo(uid,bfData)
				cb(true,bfData)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//精炼已穿戴兵符
	this.refineBingfuForWear = function(uid,type,cb) {
		var bfData = {}
		var bfInfo = {}
		async.waterfall([
			function(next) {
				var bfStr = self.getBfData(uid)
				if(bfStr)
					bfData = JSON.parse(bfStr)
				if(!bfData[type])
					next("未穿戴")
				else{
					bfInfo = bfData[type]
					next()
				}
			},
			function(next) {
				//消耗道具
				var pcStr = self.fightContorl.bingfuEntity.getWashPcStr(bfInfo)
				self.consumeItems(uid,pcStr,1,"精炼兵符",function(flag,err) {
					if(flag){
						next()
					}else{
						cb(false,err)
					}
				})
			},
			function(next) {
				//精炼兵符
				bfInfo = self.fightContorl.bingfuEntity.randSecVel(bfInfo)
				bfData[type] = bfInfo
				bfData = JSON.stringify(bfData)
				self.setBingfuInfo(uid,bfData)
				cb(true,bfData)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//保存已穿戴洗练属性
	this.replaceBingfuForWear= function(uid,type,cb) {
		var bfData = {}
		var bfInfo = {}
		async.waterfall([
			function(next) {
				var bfStr = self.getBfData(uid)
				if(bfStr)
					bfData = JSON.parse(bfStr)
				if(!bfData[type])
					next("未穿戴")
				else{
					bfInfo = bfData[type]
					next()
				}
			},
			function(next) {
				//保存洗练属性
				bfInfo = self.fightContorl.bingfuEntity.saveTmpData(bfInfo)
				bfData[type] = bfInfo
				bfData = JSON.stringify(bfData)
				self.setBingfuInfo(uid,bfData)
				cb(true,bfData)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//兵符分解
	this.resolveBingfu = function(uid,bIds,cb) {
		async.waterfall([
			function(next) {
				//参数判断
				if(!Array.isArray(bIds) || !bIds.length){
					next("bIds error "+bIds)
					return
				}
				var map = {}
				for(var i = 0;i < bIds.length;i++){
					if(map[bIds[i]]){
						next("bIds error "+bIds)
						return
					}
					map[bIds[i]] = 1
				}
				next()
			},
			function(next) {
				//获取兵符
				self.getHMObj(uid,main_name,bIds,function(list) {
					var washValue = 0
					var refineValue = 0
					for(var i = 0;i < list.length;i++){
						if(!list[i]){
							next("id error "+bIds[i])
							return
						}
						list[i] = JSON.parse(list[i])
					}
					for(var i = 0;i < bIds.length;i++)
						self.delObj(uid,main_name,bIds[i])
					var pr = self.fightContorl.bingfuEntity.getResolveItem(list)
					var awardList = self.addItemStr(uid,pr,1,"兵符分解")
					cb(true,awardList)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//兵符合成
	this.compoundBingfu = function(uid,bIds,cb) {
		async.waterfall([
			function(next) {
				//参数判断
				if(!Array.isArray(bIds) || !bIds.length){
					next("bIds error "+bIds)
					return
				}
				var map = {}
				for(var i = 0;i < bIds.length;i++){
					if(map[bIds[i]]){
						next("bIds error "+bIds)
						return
					}
					map[bIds[i]] = 1
				}
				next()
			},
			function(next) {
				//获取兵符
				self.getHMObj(uid,main_name,bIds,function(list) {
					var washValue = 0
					var refineValue = 0
					for(var i = 0;i < list.length;i++){
						if(!list[i]){
							next("id error "+bIds[i])
							return
						}
						list[i] = JSON.parse(list[i])
						if(list[i]["lv"] != list[0]["lv"]){
							next("id error "+bIds[i])
							return
						}
					}
					if(!bingfu_lv[list[0]["lv"]]["count"] || list.length != bingfu_lv[list[0]["lv"]]["count"]){
						next("list error "+list.length)
						return
					}
					for(var i = 0;i < bIds.length;i++)
						self.delObj(uid,main_name,bIds[i])
					var bfInfo = {}
					bfInfo.lv = list[0]["lv"] + 1
					bfInfo = self.gainBingfu(uid,bfInfo)
					cb(true,bfInfo)
				})
			}
		],function(err) {
			cb(false,err)
		})
	}
	//兵符穿戴
	this.wearBingfu = function(uid,bId,cb) {
		var bfData = {}
		async.waterfall([
			function(next) {
				var bfStr = self.getBfData(uid)
				if(!bfStr)
					bfData = {}
				else
					bfData = JSON.parse(bfStr)
				next()
			},
			function(next) {
				//获取兵符
				local.getBingfuInfo(uid,bId,function(flag,data) {
					if(flag){
						next(null,data)
					}else{
						next(data)
					}
				})
			},
			function(bfInfo,next) {
				if(self.getLordLv(uid) <  bingfu_lv[bfInfo.lv]["lv"]){
					next("等级不足 "+self.getLordLv(uid)+"/"+bingfu_lv[bfInfo.lv]["lv"])
					return
				}
				if(bfData[bfInfo.type]){
					//卸下兵符
					local.saveBingfu(uid,bfData[bfInfo.type])
				}
				//移除兵符
				self.delObj(uid,main_name,bId)
				//穿戴
				bfData[bfInfo.type] = bfInfo
				bfData = JSON.stringify(bfData)
				self.setBingfuInfo(uid,bfData)
				cb(true,bfData)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//兵符卸下
	this.unwearBingfu = function(uid,type,cb) {
		var bfData = {}
		async.waterfall([
			function(next) {
				var bfStr = self.getBfData(uid)
				if(!bfStr)
					bfData = {}
				else
					bfData = JSON.parse(bfStr)
				next()
			},
			function(next) {
				if(!bfData[type]){
					cb(false,"未穿戴兵符")
					return
				}
				//卸下兵符
				local.saveBingfu(uid,bfData[type])
				delete bfData[type]
				bfData = JSON.stringify(bfData)
				self.setBingfuInfo(uid,bfData)
				cb(true,bfData)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//保存兵符
	local.saveBingfu = function(uid,bfInfo) {
		var bfStr = JSON.stringify(bfInfo)
		self.setObj(uid,main_name,bfInfo.id,bfStr)
	}
	//获取兵符
	local.getBingfuInfo = function(uid,bId,cb) {
		self.getObj(uid,main_name,bId,function(bfStr) {
			if(!bfStr){
				cb(false,"bId error "+bId)
			}else{
				var bfInfo = JSON.parse(bfStr)
				cb(true,bfInfo)
			}
		})
	}
}