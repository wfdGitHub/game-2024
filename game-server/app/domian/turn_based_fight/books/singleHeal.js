//为己方生命最少的队友治疗450%攻击的生命，并驱散持续伤害效果。偶数回合结束后释放。最多释放一次
var buffManager = require("../buff/buffManager.js")
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "singleHeal"
	book.id = "singleHeal"
	book.value = Math.floor(otps.mul * book.attInfo.atk)
	book.count = otps.count
	book.action = function() {
		if(book.count > 0){
			var target = book.locator.getTargets(book.team[0],"team_minHp_1")[0]
			if(target){
				var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
				var info = target.onHeal(book,{value:book.value})
				recordInfo.targets.push(info)
				fightRecord.push(recordInfo)
				if(target["buffs"]["burn"])
					target["buffs"]["burn"].destroy()
				if(target["buffs"]["poison"])
					target["buffs"]["poison"].destroy()
			}
		}
	}
	return book
}
module.exports = model