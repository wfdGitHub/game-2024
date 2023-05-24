//对敌方后排造成172%物理伤害。偶数回合结束后释放。
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "backDamage"
	var mul = otps.mul
	book.action = function() {
		var targets = book.locator.getTargets(book.team[0],"enemy_horizontal_back_real")
		if(targets.length){
			var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
			for(var i = 0;i < targets.length;i++){
				var target = targets[i]
				var power = book.getTotalAtt("atk")
				power = Math.max(power - target[0].getTotalAtt("phyDef"),power * 0.1)
				var value = Math.ceil(power * this.mul)
				var info = target.onHit(book,{value:value,d_type:"phy"})
				recordInfo.targets.push(info)
			}
			fightRecord.push(recordInfo)
		}
	}
	return book
}
module.exports = model