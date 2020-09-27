//释放技能给己方1、2、3号位武将回复1点怒气。奇数回合结束后释放。
var buffManager = require("../buff/buffManager.js")
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "angerAddBook"
	book.id = "angerAddBook"
	book.num = otps.num
	book.buffArg = otps.buffArg
	book.action = function() {
		var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
		fightRecord.push(recordInfo)
		for(var i = 0;i < book.num;i++){
			if(book.team[i] && !book.team[i].died){	
				book.team[i].addAnger(1)
				if(book.buffArg)
					buffManager.createBuff(book,book.team[i],{buffId : "amplify",duration : 1,buffArg:book.buffArg})
			}
		}
	}
	return book
}
module.exports = model