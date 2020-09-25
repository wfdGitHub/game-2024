//对敌方单体造成350%物理伤害。奇数回合结束后释放。
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "single"
	var damage = Math.floor(book.attInfo.atk * otps.mul)
	book.action = function() {
		var target = book.locator.getTargets(book.team[0],"enemy_1")
		if(target.length){
			var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
			var info = target[0].onHit(book,{value:damage})
			recordInfo.targets.push(info)
			fightRecord.push(recordInfo)
		}
	}
	return book
}
module.exports = model