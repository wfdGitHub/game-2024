//回合结束时，有50%概率释放技能，敌方低于25%生命上限且血量最低的1个目标将会被斩杀，每场战斗只可触发1次
var buffManager = require("../buff/buffManager.js")
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "seckill"
	book.id = "seckill"
	book.rate = otps.rate
	book.arg = otps.arg
	book.count = otps.count
	book.action = function() {
		if(book.count > 0){
			if(book.rate == 1 || this.seeded.random("斩杀天书") < book.rate){
				var target = false
				var min = 0
				for(var i = 0;i < book.enemy.length;i++){
					if(!book.enemy[i].died){
						var rate = book.enemy[i].getTotalAtt("hp") / book.enemy[i].getTotalAtt("maxHP")
						if(rate < book.arg && (!target || book.enemy[i].getTotalAtt("hp") < target.getTotalAtt("hp"))){
							target = book.enemy[i]
						}
					}
				}
				if(target){
					book.count--
					var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[{id:target.id,kill:true}]}
					fightRecord.push(recordInfo)
					target.onDie()
				}
			}
		}
	}
	return book
}
module.exports = model