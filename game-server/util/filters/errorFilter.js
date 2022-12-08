
var Filter = function() {}

Filter.prototype.errorHandler = function (err, msg, resp, session, next) {
	// console.log("errorHandler",err, msg, resp, session.id)
	next(null,err)
}

module.exports = new Filter()
