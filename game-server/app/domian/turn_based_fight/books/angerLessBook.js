//释放技能给己方1、2、3号位武将回复1点怒气。奇数回合结束后释放。
var buffManager = require("../buff/buffManager.js")
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "angerLessBook"
	book.id = "angerLessBook"
	book.before = otps.before
	book.num = otps.num
	book.before = function() {
		var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
		fightRecord.push(recordInfo)
		for(var i = 0;i < book.enemy.length;i++){
			if(!book.enemy[i].died){
				book.enemy[i].lessAnger(1)
			}
		}
		if(book.before){
			var targets = book.locator.getEnemyRandom(book.team[0],book.before)
			for(var i = 0;i < targets.length;i++){
				targets[i].lessAnger(1)
			}
		}
	}
	book.action = function() {
		if(this.seeded.random("减怒天书") >= 0.5){
			var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
			fightRecord.push(recordInfo)
			var targets = book.locator.getEnemyRandom(book.team[0],book.num)
			for(var i = 0;i < targets.length;i++){
				targets[i].lessAnger(1)
			}
		}
	}
	return book
}
module.exports = model