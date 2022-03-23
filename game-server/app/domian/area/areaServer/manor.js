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
	//建设建筑
	this.manor_build = function(uid,bId,land,cb) {
		if(!builds[bId]){
			cb(false,"bId error "+bId)
			return
		}
		async.waterfall([
			function(next) {
				//获取主建筑等级
				self.getObj(uid,main_name,"main",function(mainLv) {
					mainLv = Number(mainLv) || 0
					if(manor_builds[bId]["main_lv"] > mainLv){
						next("主建筑等级不足")
						return
					}
					next()
				})
			},
			function(next) {
				// body...
			}
		],function(err) {
			// body...
			cb(false,err)
		})
	}
	//拆除建筑
	this.manor_clear = function(uid,bId,cb) {

	}
	//升级建筑
	this.manor_upgrade = function(uid,bId,cb) {

	}
	//获取收益
	this.manor_reap = function(uid,bId,cb) {
		
	}
	//驯养马匹
	this.manor_horse = function(uid,cb) {
		
	}
	//打造护符
	this.manor_hufu = function(uid,cb) {
		
	}
}