//潜行
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var buff = new buffBasic(releaser,character,otps)
	buff.update = function(dt) {
		//没有存活队友则消失
		var flag = true
		for(var i = 0;i < this.character.team.length;i++){
			if(this.character.team[i]["id"] != this.character.id && !this.character.team[i].died){
				flag = false
				break
			}
		}
		if(flag){
			this.destroy()
		}else{
			this.refresh()
			if(this.duration != -1){
				this.duration -= 1
				if(this.duration <= 0){
					this.destroy()
				}
			}
		}
	}
	return buff
}
module.exports = model