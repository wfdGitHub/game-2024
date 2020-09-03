//分享功能
const uuid = require("uuid")
const main_name = "share"
module.exports = function() {
	var self = this
	//每日更新
	this.shareDayUpdate = function() {
		self.delAreaObjAll(main_name)
	}
	//保存分享数据
	this.saveShareData = function(data,cb) {
		if(typeof(data) != "string"){
			cb(false,"data error")
			return
		}
		var shareId = uuid.v1()
		self.setAreaObj(main_name,shareId,data)
		cb(true,shareId)
	}
	//获取分享数据
	this.getShareData = function(shareId,cb) {
		self.getAreaObj(main_name,shareId,function(data) {
			if(data){
				cb(true,data)
			}else{
				cb(false)
			}
		})
	}
}