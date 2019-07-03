var pomelo = require('pomelo');
var bearcat = require("bearcat")
var contextPath = require.resolve('./context.json');
var areaFilter = require('./util/filters/areaFilter.js');
var chatFilter = require('./util/filters/chatFilter.js');
var app = pomelo.createApp();
/**
 * Init app for client.
 */
app.set('name', 'onlineGame');
// app configuration
bearcat.createApp([contextPath],{ BEARCAT_HOT: "off"})
bearcat.start(function() {
  app.configure('production|development',function() {
    //消息串行化
    app.filter(pomelo.filters.serial());
    //检测到node.js中事件循环的请求等待队列过长，超过一个阀值时，就会触发toobusy
    app.before(pomelo.filters.toobusy());
    //处理超时进行警告，默认三秒
    app.filter(pomelo.filters.timeout());
    // app.set('serverConfig', { 
    //   "reloadHandlers": true,
    //   "reloadRemotes": true
    // });
  })
  app.configure('production|development', 'connector', function(){
    app.set('connectorConfig',
      {
        connector : pomelo.connectors.hybridconnector,
        heartbeat : 5,
        disconnectOnTimeout : true,
        useDict : true,
        useProtobuf : true
      });
  });
  app.configure('production|development', 'gate', function(){
    app.set('connectorConfig',
      {
        connector : pomelo.connectors.hybridconnector,
        heartbeat : 5,
        disconnectOnTimeout: true,
        useDict : true,
        useProtobuf : true,
        // ssl: {
        //   type: 'wss',
        //   key: fs.readFileSync('./keys/server.key'),
        //   cert: fs.readFileSync('./keys/server.crt'),
        // }
      });
  });
  //后端服务器分配路由
  var areaRoute = function(session, msg, app, cb) {
    //获取用户游戏服务器ID
    var serverId = session.get("serverId")
    if(!serverId){
      cb("未登录游戏服务器")
      return
    }
    cb(null, serverId);
  };
  app.configure('production|development', function() {
    app.route('area', areaRoute);
  });
  app.configure('production|development', 'area', function() {
    app.before(areaFilter());
  });
  app.configure('production|development', 'chat', function() {
    app.before(chatFilter());
  });
	app.start(function() {
    app.configure('production|development', 'chat', function(){
      var chat = bearcat.getBean("chat")
      chat.init(app)
      app.set("chat",chat)
    });
    app.configure('production|development', 'area', function(){
      var areaManager = bearcat.getBean("areaManager")
      areaManager.init(app)
      app.set("areaManager",areaManager)
    });
    app.configure('production|development', 'admin|connector', function(){
      var areaDeploy = bearcat.getBean("areaDeploy")
      areaDeploy.init(app)
      app.set("areaDeploy",areaDeploy)
    });
    app.configure('production|development', 'connector', function(){
        var connectorManager = bearcat.getBean("connectorManager")
        connectorManager.init(app)
        app.set("connectorManager",connectorManager)
    });
    console.log(app.serverId + " is ready")
  })
})