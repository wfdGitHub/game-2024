//sg/gm/8.19
var pomelo = require('pomelo');
var bearcat = require("bearcat")
var contextPath = require.resolve('./context.json');
var areaFilter = require('./util/filters/areaFilter.js');
var chatFilter = require('./util/filters/chatFilter.js');
var crossFilter = require('./util/filters/crossFilter.js');
var adminFilter = require('./util/filters/adminFilter.js')
var errorFilter = require('./util/filters/errorFilter.js')
var serial = require('./util/filters/serial.js')
var connectorFilter = require('./util/filters/connectorFilter.js')
var app = pomelo.createApp();
/**
 * Init app for client.
 */
app.set('name', 'onlineGame');
// app configuration
bearcat.createApp([contextPath],{ BEARCAT_HOT: "off"})
bearcat.start(function() {
    app.configure('production|development','connector|gate',function() {
      // app.filter(pomelo.filters.serial());
      app.filter(serial(app));
      //检测到node.js中事件循环的请求等待队列过长，超过一个阀值时，就会触发toobusy
      app.before(pomelo.filters.toobusy());
      //处理超时进行警告，默认三秒
      app.filter(pomelo.filters.timeout());
      //错误处理
      app.set('errorHandler',errorFilter.errorHandler);
      app.filter(connectorFilter());
      app.set('connectorConfig',
        {
          connector : pomelo.connectors.hybridconnector,
          heartbeat : 60,
          disconnectOnTimeout : true,
          useDict : true,
          useProtobuf : true
        });
    })
    app.configure('production|development', 'area', function() {
      //消息串行化
      app.filter(serial(app));
      //检测到node.js中事件循环的请求等待队列过长，超过一个阀值时，就会触发toobusy
      app.before(pomelo.filters.toobusy());
      //处理超时进行警告，默认三秒
      app.filter(pomelo.filters.timeout());
      //错误处理
      app.set('errorHandler',errorFilter.errorHandler);
      app.before(areaFilter());
    });
    app.configure('production|development', 'chat', function() {
      //消息串行化
      app.filter(serial(app));
      //检测到node.js中事件循环的请求等待队列过长，超过一个阀值时，就会触发toobusy
      app.before(pomelo.filters.toobusy());
      //处理超时进行警告，默认三秒
      app.filter(pomelo.filters.timeout());
      //错误处理
      app.set('errorHandler',errorFilter.errorHandler);
      app.before(chatFilter());
    });
    app.configure('production|development', 'cross', function() {
      //消息串行化
      app.filter(serial(app));
      //检测到node.js中事件循环的请求等待队列过长，超过一个阀值时，就会触发toobusy
      app.before(pomelo.filters.toobusy());
      //处理超时进行警告，默认三秒
      app.filter(pomelo.filters.timeout());
      //错误处理
      app.set('errorHandler',errorFilter.errorHandler);
      app.before(crossFilter());
    });
    app.configure('production|development', 'admin', function() {
      //消息串行化
      app.filter(serial(app));
      //检测到node.js中事件循环的请求等待队列过长，超过一个阀值时，就会触发toobusy
      app.before(pomelo.filters.toobusy());
      //处理超时进行警告，默认三秒
      app.filter(pomelo.filters.timeout());
      //错误处理
      app.set('errorHandler',errorFilter.errorHandler);
      app.before(adminFilter());
    });
    app.start(function() {
      app.configure('production|development', function() {
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
        app.route('area', areaRoute);
      });
      app.configure('production|development', 'area', function() {
        var areaDeploy = bearcat.getBean("areaDeploy")
        areaDeploy.init(app)
        app.set("areaDeploy",areaDeploy)
        var areaManager = bearcat.getBean("areaManager")
        areaManager.init(app)
        app.set("areaManager",areaManager)
      });
      app.configure('production|development', 'cross', function() {
        var crossManager = bearcat.getBean("crossManager",app)
        app.set("crossManager",crossManager)
      });
      app.configure('production|development', 'chat', function(){
        var chat = bearcat.getBean("chat")
        chat.init(app)
        app.set("chat",chat)
      });
      app.configure('production|development', 'admin', function(){
        var areaDeploy = bearcat.getBean("areaDeploy")
        areaDeploy.init(app)
        app.set("areaDeploy",areaDeploy)
        var serverManager = bearcat.getBean("serverManager",app)
        app.set("serverManager",serverManager)
      });
      app.configure('production|development', 'connector', function(){
        var areaDeploy = bearcat.getBean("areaDeploy")
        areaDeploy.init(app)
        app.set("areaDeploy",areaDeploy)
        var connectorManager = bearcat.getBean("connectorManager")
        connectorManager.init(app)
        app.set("connectorManager",connectorManager)
      });
      console.log(app.serverId + " is ready")
    })
})
process.on('uncaughtException', function (err) {
  var redisDao = bearcat.getBean("redisDao")
  redisDao.db.rpush("server:logs",JSON.stringify(err.stack),function(err,num) {
      if(num > 200){
        redisDao.db.ltrim("server:logs",-200,-1)
      }
  })
  console.error(' !!! Caught exception: ' + err.stack);
});