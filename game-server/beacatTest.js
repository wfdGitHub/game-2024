var bearcat = require("bearcat")
var contextPath = require.resolve('./context.json');
bearcat.createApp([contextPath])
bearcat.start(function() {})

var playerDao = bearcat.getBean("playerDao")
// playerDao.createPlayer({uid : 10001,areaId : 1,name : "wfd"})
playerDao.getPlayerInfo({uid : 10001,areaId : 1,name : "wfd"},function(flag,playerInfo) {
	console.log("playerInfo",playerInfo)
})