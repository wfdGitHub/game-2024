//系统跑马灯
const notice_cfg = require("../../../../config/gameCfg/notice_cfg.json")
const NOTICE_TIME = 180000
module.exports = function() {
	var self = this
	var list = []
	//更新
	this.updateNotice = function() {
		for(var i = 0;i < list.length;i++){
			if(list[i]["time"] < Date.now()){
				list.shift()
				i--
			}else{
				break
			}
		}
	}
	//添加公告
	this.addNotice = function(key,xxx,yyy,zzz) {
		console.log("addNotice",key,xxx,yyy,zzz)
		if(notice_cfg[key]){
			var text = notice_cfg[key]["text"]
			if(xxx)
				text = text.replace('xxx', xxx);
			if(yyy)
				text = text.replace('yyy', yyy);
			if(zzz)
				text = text.replace('zzz', zzz);
			list.push({text : text,time : NOTICE_TIME + Date.now()})
		}
	}
	//获取公告
	this.methods.getScrollNotice = function(uid,msg,cb) {
		cb(true,list.slice(0,20))
	}
}