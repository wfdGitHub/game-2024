var bearcat = require("bearcat")
var heros = require("../../../../config/gameCfg/heros.json")
var equip_base = require("../../../../config/gameCfg/equip_base.json")
var equip_level = require("../../../../config/gameCfg/equip_level.json")
var async = require("async")
var hufuHandler = function(app) {
  this.app = app;
	this.areaManager = this.app.get("areaManager")
};
//穿戴装备

module.exports = function(app) {
  return bearcat.getBean({
  	id : "hufuHandler",
  	func : hufuHandler,
  	args : [{
  		name : "app",
  		value : app
  	}]
  })
};