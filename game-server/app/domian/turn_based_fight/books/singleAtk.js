//对敌方单体造成350%物理伤害。奇数回合结束后释放。
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "singleAtk"
	var mul = otps.mul
	book.action = function() {
		var target = book.locator.getTargets(book.team[0],"enemy_1")
		if(target.length){
			var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
			var value = Math.floor((book.master.getTotalAtt("atk") - target[0].getTotalAtt("phyDef")) * mul)
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