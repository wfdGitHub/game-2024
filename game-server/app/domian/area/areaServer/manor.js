//家园系统
const manor_builds = require("../../../../config/gameCfg/manor_builds.json")
const async = require("async")
const builds = {}
for(var i in manor_builds){
	if(!builds[manor_builds[i]["basic"]])
		builds[manor_builds[i]["basic"]] = require("../../../../config/gameCfg/manor_"+manor_builds[i]["basic"]+".json")
}
console.log(builds)
const main_name = "manor"
module.exports = function() {
	var self = this
	//获取家园数据
	this.manor_data = function(uid,cb) {
		self.getObjAll(uid,main_name,function(data) {
			if(!data){
				self.manor_init(uid,cb)
			}else{
				cb(true,data)
			}
		})
	}
	//初始化家园
	this.manor_init = function(uid,cb) {
		self.setObj(uid,main_name,"main",1)
		cb(true,{"main":1})
	}
	//建设升级建筑
	this.manor_build = function(uid,bId,land,cb) {
		if(!manor_builds[bId]){
			cb(false,"bId error "+bId)
			return
		}
		var basic = manor_builds[bId]["basic"]
		async.waterfall([
			function(next) {
				//获取主建筑等级
				self.getObj(uid,main_name,"main",function(mainLv) {
					mainLv = Number(mainLv) || 0
					if(manor_builds[basic]["main_lv"] > mainLv){
						next("主建筑等级不足")
						return
					}
					next()
				})
			},
			function(next) {
				//判断格子
				self.getObj(uid,main_name,"land_"+land,function(data) {
					if(data && data != bId)
						next("地块已被占用")
					else
						next()
				})
			},
			function(next) {
				//获取建筑等级并消耗资源
				self.getObj(uid,main_name,bId,function(buildLv) {
					buildLv = Number(buildLv) || 0
					buildLv++
					if(!builds[basic][buildLv]){
						next("建筑等级已满")
						return
					}
					if(builds[basic][buildLv]["upgrade"]){
						self.consumeItems(uid,builds[basic][buildLv]["upgrade"],1,"升级建筑:"+bId+":"+buildLv,function(flag,err) {
							if(flag)
								next(null,buildLv)
							else
								next(err)
						})
					}else{
						next()
					}
				})
			},
			function(buildLv,next) {
				if(buildLv == 1){
					//设置地块
					self.setObj(uid,main_name,"land_"+land,bId)
					if(manor_builds[bId]["type"] == "res")
						self.setObj(uid,main_name,bId+"_time",Date.now())
				}
				//升级建筑
				self.setObj(uid,main_name,bId,buildLv)
				cb(true,buildLv)
			}
		],function(err) {
			// body...
			cb(false,err)
		})
	}
	//交换建筑
	this.manor_swap = function(uid,land1,land2,cb) {
		var bId1 = ""
		var bId2 = ""
		self.getObj(uid,main_name,"land_"+land1,function(data) {
			bId1 = data
			self.getObj(uid,main_name,"land_"+land2,function(data) {
				bId2 = data
				self.setObj(uid,main_name,"land_"+land1,bId2)
				self.setObj(uid,main_name,"land_"+land2,bId1)
				cb(true)
			})
		})
	}
	//获取收益
	this.manor_reap = function(uid,bId,cb) {
		if(!manor_builds[bId]){
			cb(false,"bId error "+bId)
			return
		}
		if(manor_builds[bId]["type"] != "res"){
			cb(false,"非资源建筑")
			return
		}
		var item = manor_builds[bId]["award"]
		self.getHMObj(uid,main_name,[bId,bId+"_time"],function(data) {
			var buildLv = Number(data[0]) || 0
			var time = Number(data[1]) || 0
			if(!buildLv){
				cb(false,"建筑不存在")
				return
			}
			var awardTime = Date.now() - time
			console.log("awardTime",awardTime)
			
		})
	}
	//驯养马匹
	this.manor_horse = function(uid,cb) {
		
	}
	//打造护符
	this.manor_hufu = function(uid,cb) {
		
	}
}