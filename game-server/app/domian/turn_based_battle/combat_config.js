//配置模块
var model = function() {
	this.maps = {}
	//配置初始化
	console.log("配置初始化")
}
//获取配置
model.prototype.getCfg = function(name) {
	if(!this.maps[name])
		this.maps[name] = require("../../../../config/gameCfg/"+name+".json")
	return this.maps[name]
}

module.exports = new model()