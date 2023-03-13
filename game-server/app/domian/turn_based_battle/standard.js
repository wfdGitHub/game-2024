//基准数据
const TEAMLENGTH = 5
var model = function() {

}
//基准阵容数据
model.prototype.standardTeam = function(team,lv) {
	if(!team)
		team = []
	var teamInfo = [{}]
	for(var i = 1;i <= TEAMLENGTH;i++)
		teamInfo[i] = this.standardCharacter(team[i-1])
	return teamInfo
}
//基准角色数据
model.prototype.standardCharacter = function(id,lv) {
	if(!id)
		return 0
	var info = {}
	info.id = id
	info.lv = 1
	info.star = 1
	info.ad = 1
	return info
}
module.exports = new model()