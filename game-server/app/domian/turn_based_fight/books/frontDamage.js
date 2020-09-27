//对敌方后排造成172%物理伤害。偶数回合结束后释放。
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "frontDamage"
	var damage = Math.floor(book.attInfo.atk * otps.mul)
	book.action = function() {
		var target = book.locator.getTargets(book.team[0],"enemy_horizontal_front_real")
		if(target.length){
			var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
			var value = damage - target[0].getTotalAtt("magDef")
			if(value < 1)
				value = 1
			var info = target[0].onHit(book,{value:value})
			recordInfo.targets.push(info)
			fightRecord.push(recordInfo)
		}
	}
	return book
}
module.exports = model