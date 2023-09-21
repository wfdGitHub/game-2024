//战法系统
const main_name = "zhanfa"
const zhanfa = require("../../../../config/gameCfg/zhanfa.json")
const default_cfg = require("../../../../config/gameCfg/default_cfg.json")
const exalt_lv = require("../../../../config/gameCfg/exalt_lv.json")
const async = require("async")
var itemId = 230
module.exports = function() {
	var self = this
	//战法数据
	this.getZhanfaList = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data)
				data = {}
			cb(true,data)
		})
	}
	//获得随机战法
	this.gainRandZhanfa = function(uid,cb) {
		var arr = []
		var count = 0
		var zId = false
		async.waterfall([
			function(next) {
				self.getObjAll(uid,main_name,function(data) {
					if(!data)
						data = {}
					count = Number(data.count) || 0
					for(var i in zhanfa){
						if(!data[i])
							arr.push(i)
					}
					if(arr.length){
						var rand = Math.floor(Math.random() * arr.length)
						zId = arr[rand]
						next()
					}else{
						next("已收集全部战法")
					}
				})
			},
			function(next) {
				var pc = itemId+":"+(default_cfg["zhanfa_base"]["value"] + count * default_cfg["zhanfa_up"]["value"])
				self.consumeItems(uid,pc,1,"随机战法",function(flag,err) {
					if(!flag){
						cb(false,err)
					}else{
						self.gainOneZhanfa(uid,zId,cb)
					}
				})
			}
		],function(err) {
			cb(false,err)
		})

	}
	//获得指定战法
	this.gainSpecialZhanfa = function(uid,zId,cb) {
		if(!zhanfa[zId]){
			cb(false,"战法不存在")
			return
		}
		self.getObj(uid,main_name,zId,function(data) {
			if(data){
				cb(false,"战法已收集")
				return
			}
			self.getObj(uid,main_name,"count",function(data) {
				var count = Number(data) || 0
				var pc = itemId+":"+(default_cfg["zhanfa_base"]["value"] + count * default_cfg["zhanfa_up"]["value"] + default_cfg["zhanfa_special"]["value"])
				self.consumeItems(uid,pc,1,"指定战法",function(flag,err) {
					if(!flag){
						cb(false,err)
					}else{
						self.gainOneZhanfa(uid,zId,cb)
					}
				})
			})
		})
	}
	//获得战法
	this.gainOneZhanfa = function(uid,zId,cb) {
		if(!zhanfa[zId]){
			cb(false,"战法不存在")
			return
		}
		self.setObj(uid,main_name,zId,1)
		self.incrbyObj(uid,main_name,"count",1)
		self.taskUpdate(uid,"zhanfa_gain",1,zId)
		cb(true,zId)
	}
	//穿戴战法
	this.wearZhanfa = function(uid,hId,index,zId,cb) {
		if(index != 1 && index != 2 && index != 3){
			cb(false,"index error "+index)
			return
		}
		if(!zhanfa[zId]){
			cb(false,"战法不存在")
			return
		}
		//判断是否解锁
		var key = "zf_"+index
		async.waterfall([
			function(next) {
				//判断英雄
				self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
					if(!heroInfo || !heroInfo.id){
						next("英雄不存在")
						return
					}
					if(index > exalt_lv[heroInfo.exalt]["zhanfa"]){
						next("战法栏未解锁")
						return
					}
					var oldZid = heroInfo[key]
					if(zId){
						next("已穿戴战法")
						return
					}
					next()
				})
			},
			function(next) {
				//判断战法
				self.getObj(uid,main_name,zId,function(data) {
					if(!data){
						next("该战法未获得")
						return
					}
					if(data != 1){
						next("该战法已穿戴")
						return
					}
					next()
				})
			},
			function(next) {
				//设置战法
				self.heroDao.setHeroInfo(self.areaId,uid,hId,key,zId)
				self.setObj(uid,main_name,zId,hId)
				var info = {}
				info[key] = zId
				cb(true,info)
			}
		],function(err) {
			cb(false,err)
		})
	}
	//卸下战法
	this.unwearZhanfa = function(uid,hId,index,cb) {
		if(index != 1 && index != 2 && index != 3){
			cb(false,"index error "+index)
			return
		}
		//判断是否解锁
		var key = "zf_"+index
		self.heroDao.getHeroOne(uid,hId,function(flag,heroInfo) {
			if(!heroInfo){
				cb(false,"英雄不存在")
				return
			}
			var zhanfa = heroInfo[key]
			if(!zhanfa){
				cb(false,"未穿戴战法")
				return
			}
			self.heroDao.delHeroInfo(self.areaId,uid,hId,key)
			self.setObj(uid,main_name,zhanfa,1)
			cb(true,zhanfa)
		})
	}
}