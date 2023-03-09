//SDK获取数据模块
var model = function() {
	var self
	var posts = {}
	var local = {}
	this.init = function (server,serverManager) {
		self = serverManager
		for(var key in posts){
			console.log("注册",key)
			server.post(key,posts[key])
		}
	}
	//获取
	posts["/x7sy_roleQuery"] = function(req,res) {
		var data = req.body
		console.log("x7sy_roleQuery!!",data)
	}
}
module.exports = {
	id : "sdkQuery",
	func : model,
	scope : "prototype",
	props : [{
		name : "redisDao",
		ref : "redisDao"
	},{
		name : "payDao",
		ref : "payDao"
	}]
}