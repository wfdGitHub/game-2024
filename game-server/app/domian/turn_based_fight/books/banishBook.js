//回合开始前，敌方剩余4个目标以上时，有40%几率放逐敌方攻击最高者，持续1回合，同一目标最多放逐1次。被放逐者无法行动、无法成为攻击目标且自身无法触发任何效果
var buffManager = require("../buff/buffManager.js")
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "banishBook"
	book.id = "banishBook"
	book.num = otps.num
	book.buffRate = otps.buffRate
	var banishList = {}
	book.action = function() {
		var target = false
		var max = 0
		var num = 0
		for(var i = 0;i < book.enemy.length;i++){
			if(!book.enemy[i].died)
				num++
		}
		if(num >= book.num){
			if(book.buffRate == 1 || this.seeded.random("放逐天书") >= this.buffRate){
				for(var i = 0;i < book.enemy.length;i++){
					if(!book.enemy[i].died && !banishList[book.enemy[i].id]){
						if(!target || book.enemy[i].getTotalAtt("atk") > target.getTotalAtt("atk")){
							target = book.enemy[i]
						}
					}
				}
				if(target){
					var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[{id : target.id}]}
					fightRecord.push(recordInfo)
					banishList[target.id] = true
					buffManager.createBuff(book,target,{buffId : "banish",duration : 1})
				}
			}
		}
	}
	return book
}
module.exports = model