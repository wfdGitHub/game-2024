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
		var list = {}
		for(var i = 0;i < book.enemy.length;i++){
			if(!book.enemy[i].died){
				list[book.enemy[i].id] = 1
			}
		}
		if(book.before){
			var targets = book.locator.getEnemyRandom(book.team[0],book.before)
			for(var i = 0;i < targets.length;i++){
				list[targets[i].id]++
				targets[i].lessAnger(list[targets[i].id],true)
				recordInfo.targets.push({id:targets[i].id,value:-list[targets[i].id]})
			}
		}
		fightRecord.push(recordInfo)
	}
	book.action = function() {
		if(this.seeded.random("减怒天书") >= 0.5){
			var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
			var targets = book.locator.getEnemyRandom(book.team[0],book.num)
			for(var i = 0;i < targets.length;i++){
				recordInfo.targets.push({id:targets[i].id,value:-1})
				targets[i].lessAnger(1,true)
			}
			fightRecord.push(recordInfo)
		}
	}
	return book
}
module.exports = model