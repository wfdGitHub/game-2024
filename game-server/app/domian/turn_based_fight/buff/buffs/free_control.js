//团队免控BUFF
var buffBasic = require("../buffBasic.js")
var buff_cfg = require("../../../../../config/gameCfg/buff_cfg.json")
var model = function(releaser,character,otps) {
	//继承父类属性
	var buff = new buffBasic(releaser,character,otps)
	buff.value = otps.value || 0
	buff.mul = otps.mul || 0
	buff.listens = []
	buff.clear = function() {
		for(var i = 0;i < buff.listens.length;i++)
			buff.buffManager.delListenerCB(buff.listens[i].buffId,buff.listens[i].cbId)
	}
	//我方成员被控制
	buff.teamBeControl = function(buffId,target) {
		if(target.buffs[buffId] && !buff.character.died && buff.value > 0 && buff.buffManager.seeded.random() < buff.mul){
			buff.fightRecord.push({type:"show_tag",id:target.id,tag:"free_control"})
			target.buffs[buffId].destroy()
			buff.value--
			if(buff.value <= 0)
				buff.destroy()
			return true
		}
		return false
	}
	for(var i in buff_cfg){
		if(buff_cfg[i].control){
			var cbId = buff.buffManager.addListenerCB(i,buff.teamBeControl)
			buff.listens.push({"buffId":i,"cbId":cbId})
		}
	}
	return buff
}
module.exports = model