//对敌方单体造成350%物理伤害。奇数回合结束后释放。
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "singleAtk"
	book.action = function() {
		var target = book.locator.getTargets(book.team[0],"enemy_1")
		if(target.length){
			var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
			var power = book.getTotalAtt("atk")
			power = Math.max(power - target[0].getTotalAtt("phyDef"),power * 0.1)
			var value = Math.ceil(power * this.mul)
			if(value < 1)
				value = 1
			var info = target[0].onHit(book,{value:value,d_type:"phy"})
			recordInfo.targets.push(info)
			fightRecord.push(recordInfo)
		}
	}
	return book
}
module.exports = model