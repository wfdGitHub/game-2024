//家园系统
const manor_builds = require("../../../../config/gameCfg/manor_builds.json")
const builds = {}
for(var i in manor_builds){
	if(!builds[manor_builds[i]["basic"]])
		builds[manor_builds[i]["basic"]] = require("../../../../config/gameCfg/manor_"+manor_builds[i]["basic"]+".json")
}
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
		self.setObj(uid,main_name,"main":1)
		cb(true,{"main":1})
	}
	//建设建筑
	this.manor_build = function(uid,bId,land,cb) {
		if(!builds[bId]){
			cb(false,"bId error "+bId)
			return
		}
		
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