var areaDao = function() {}

//创建新服务器
areaDao.prototype.createArea = function(otps,cb) {

}
//获取服务器列表
areaDao.prototype.getAreaList = function(cb) {

}

module.exports = {
	id : "areaDao",
	func : areaDao,
	props : [{
		name : "redisDao",
		ref : "redisDao"
	}]
}