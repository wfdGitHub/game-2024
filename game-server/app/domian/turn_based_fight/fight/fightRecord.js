var model = function() {
	this.list = []
	this.init = function() {
		this.list = []
	}
	this.push = function(info) {
		this.list.push(info)
	}
}
module.exports = new model()