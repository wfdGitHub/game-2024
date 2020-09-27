//给己方全体武将附加1个减伤12%的护盾，持续1回合。奇数回合结束后释放。
var buffManager = require("../buff/buffManager.js")
var bookBasic = require("./bookBasic.js")
var fightRecord = require("../fight/fightRecord.js")
var model = function(otps) {
	var book = new bookBasic(otps)
	book.bookId = "reductionBuff"
	book.id = "reductionBuff"
	book.buffArg = otps.buffArg
	book.heal = otps.heal
	book.action = function() {
		var recordInfo = {type : "book",bookId:book.bookId,belong : book.belong,targets:[]}
		fightRecord.push(recordInfo)
		for(var i = 0;i < book.team.length;i++){
			if(book.team[i] && !book.team[i].died){	
				if(book.buffArg)
					buffManager.createBuff(book,book.team[i],{buffId : "reduction",duration : 1,buffArg:book.buffArg})
				if(book.heal)
					book.team[i].onHeal(book,{value : Math.floor(book.team[i].getTotalAtt("maxHP") * book.heal)})
			}
		}
	}
	return book
}
module.exports = model