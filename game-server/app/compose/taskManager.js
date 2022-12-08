var sequeue = require('seq-queue');

var manager = module.exports;
var MAX_COUNT = 50
var queues = {};

manager.timeout = 3000;

/**
 * Add tasks into task group. Create the task group if it dose not exist.
 *
 * @param {String}   key       task key
 * @param {Function} fn        task callback
 * @param {Function} ontimeout task timeout callback
 * @param {Number}   timeout   timeout for task
 */
manager.addTask = function(key, fn, ontimeout, timeout) {
  var queue = queues[key];
  if(!queue) {
    queue = sequeue.createQueue(manager.timeout);
    queues[key] = queue;
  }

  return queue.push(fn, ontimeout, timeout);
};

/**
 * Destroy task group
 *
 * @param  {String} key   task key
 * @param  {Boolean} force whether close task group directly
 */
manager.closeQueue = function(key, force) {
  if(!queues[key]) {
    // ignore illeagle key
    return;
  }

  queues[key].close(force);
  delete queues[key];
};


manager.checkOver = function(key) {
  console.log(key,queues[key].queue.length)
  if(queues[key] && queues[key].queue.length > MAX_COUNT){
    console.log("数量过多",queues[key].queue.length)
    return true
  }else
    return false
}