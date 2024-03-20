//宝物
const ace_pack = require("../../../../config/gameCfg/ace_pack.json")
var aceList = {}
for(var i in ace_pack){
	if(!aceList[ace_pack[i]["quality"]])
		aceList[ace_pack[i]["quality"]] = []
	aceList[ace_pack[i]["quality"]].push(i)
}
const weight = {"3":0.35,"4":0.24,"5":0.12,"6":0.08,"7":0}
module.exports = function() {
	var self = this
	this.compoundAce = function(uid,aId1,aId2,cb) {
		if(!ace_pack[aId1] || !ace_pack[aId2] || ace_pack[aId1]["quality"] != ace_pack[aId2]["quality"]){
			cb(false,"id error "+aId1+" "+aId2)
			return
		}
		var qa = ace_pack[aId1]["quality"]
		self.consumeItems(uid,aId1+":1&"+aId2+":1",1,"宝物合成",function(flag,err) {
			if(!flag){
				cb(false,err)
			}else{
				var itemId
				if(aceList[qa+1] && Math.random() < weight[qa])
					itemId = aceList[qa+1][Math.floor(aceList[qa+1].length * Math.random())]
				else
					itemId = aceList[qa][Math.floor(aceList[qa].length * Math.random())]
				var awardList = self.addItemStr(uid,itemId+":1",1,"宝物合成")
				cb(true,awardList)
			}
		})
	}
}