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
		fightRecord.push({type : "book",bookId:book.bookId,belong : book.belong,targets:[]})
		var recordInfo = {type : "other_heal",targets : []}
		for(var i = 0;i < book.team.length;i++){
			if(book.team[i] && !book.team[i].died){	
				if(book.buffArg)
					buffManager.createBuff(book,book.team[i],{buffId : "reduction",duration : 1,buffArg : book.buffArg})
				if(book.heal){
					var tmpRecord = book.team[i].onHeal(book,{maxRate:book.heal})
					recordInfo.targets.push(tmpRecord)
				}
			}
		}
		fightRecord.push(recordInfo)
	}
	return book
}
module.exports = model