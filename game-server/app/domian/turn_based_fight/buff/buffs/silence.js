//沉默
var buffBasic = require("../buffBasic.js")
var model = function(releaser,character,otps) {
	var silence = new buffBasic(releaser,character,otps)
	// console.log("角色"+silence.character.id+"被沉默!!!!!!")
	silence.name = "沉默"
	silence.character.silence = true
	silence.clear = function() {
		// console.log(silence.character.id+"沉默结束")
		silence.character.silence = false
	}
	return silence
}
module.exports = model