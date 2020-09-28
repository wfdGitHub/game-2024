//为己方生命最少的队友治疗450%攻击的生命，并驱散所有异常效果（灼烧、中毒、眩晕、沉默、麻痹、禁疗）。偶数回合结束后释放。最多释放一次
var buffManager = require("../buff/buffManager.js")
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "singleHeal"
	book.id = "singleHeal"
	book.value = Math.floor(otps.mul * book.attInfo.atk)
	book.count = otps.count
	book.dispel = otps.dispel
	book.action = function() {
		if(book.count > 0){
			book.count--
			var target = book.locator.getTargets(book.team[0],"team_minHp_1")[0]
			if(target){
				var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
				if(book.dispel){
					if(target["buffs"]["burn"])
						target["buffs"]["burn"].destroy()
					if(target["buffs"]["poison"])
						target["buffs"]["poison"].destroy()
					if(target["buffs"]["forbidden"])
						target["buffs"]["forbidden"].destroy()
				}
				if(book.control){
					if(target["buffs"]["dizzy"])
						target["buffs"]["dizzy"].destroy()
					if(target["buffs"]["disarm"])
						target["buffs"]["disarm"].destroy()
					if(target["buffs"]["silence"])
						target["buffs"]["silence"].destroy()
				}
				var info = target.onHeal(book,{value:book.value})
				recordInfo.targets.push(info)
				fightRecord.push(recordInfo)

			}
		}
	}
	return book
}
module.exports = model