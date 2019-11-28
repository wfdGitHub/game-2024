//目标选择
var model = function(seededNum) {
	this.seededNum = seededNum
}
var local = {}
//获取目标
model.prototype.getTargets = function(character,skill) {
	switch(skill.targetType){
		case "normal":
			return local.getTargetNormal(character)
		break
		default :
			console.error("targetType error ",skill.targetType)
			return []
	}
}
//选择默认单个目标
local.getTargetNormal = function(character) {
	var index = character.index
	if(index >= 3){
		index -= 3
	}
	//优先打对位的敌方前排
	if(!character.enemy[index].died){
		return  [character.enemy[index]]
	}
	//若不存在,选取前排位置顺序靠前单位
	for(var i = 0;i < 3;i++){
		if(i != index){
			if(!character.enemy[i].died){
				return  [character.enemy[i]]
			}
		}
	}
	//若不存在前排，选取对位的地方后排
	if(!character.enemy[index + 3].died){
		return  [character.enemy[index + 3]]
	}
	//最后选取后排位置靠前单位
	for(var i = 3;i < 6;i++){
		if(i != index + 3){
			if(!character.enemy[i]){
				console.log(11)
			}
			if(!character.enemy[i].died){
				return  [character.enemy[i]]
			}
		}
	}
	return []
}
module.exports = model