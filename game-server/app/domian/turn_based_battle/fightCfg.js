//配置模块
const initCfg = []
var model = function() {
	this.maps = {}
	//配置初始化
	console.log("配置初始化")
}
model.prototype.init = function() {
	//加载初始配置
	for(var i = 0;i < initCfg.length;i++)
		this.getCfg(initCfg[i])
	//配置初始化操作
}
//获取配置
model.prototype.getCfg = function(name) {
	if(!this.maps[name])
		this.maps[name] = require("../../../../config/gameCfg/"+name+".json")
	return this.maps[name]
}
module.exports = model