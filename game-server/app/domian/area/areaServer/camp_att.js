//阵营加成
const main_name = "camp_att"
const camp_att = require("../../../../config/gameCfg/camp_att.json")
var camp_item = {
	"1" : "401",
	"2" : "402",
	"3" : "403",
	"4" : "404",
	"5" : "405"
}
module.exports = function() {
	var self = this
	//升级阵营加成
	this.upgradCampAtt = function(uid,camp,cb) {
		if(!camp_item[camp]){
			cb(false,"camp error "+camp)
			return
		}
		var key = "camp_"+camp
		var lv = self.getLordAtt(uid,key)
		lv++
		if(!camp_att[lv]){
			cb(false,"lv error "+lv)
			return
		}
		self.consumeItems(uid,camp_item[camp]+":"+camp_att[lv]["score"],1,"阵营加成"+camp,function(flag,err) {
			if(flag){
				self.incrbyLordData(uid,key,1,function(data) {
					self.taskUpdate(uid,"camp_att",1)
					self.setCampAtt(uid,camp,Number(data))
					cb(true,data)
				})
			}else{
				cb(false,err)
			}
		})
	}
}