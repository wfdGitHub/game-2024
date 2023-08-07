var star_base = require("../../../../config/gameCfg/star_base.json")
var model = function() {
	//获得升星材料
	this.getUpStarList = function(star) {
		var list = []
		if(star_base[star]){
			for(var i = 1;i <= 3;i++)
				if(star_base[star]["pc_type_"+i] && star_base[star]["pc_star_"+i])
					for(var count = 0;count < star_base[star]["pc_value_"+i];count++)
						list.push([star_base[star]["pc_type_"+i],star_base[star]["pc_star_"+i]])
		}
		return list
	}
}
module.exports = model