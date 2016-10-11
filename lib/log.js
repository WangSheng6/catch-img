var log4js = require('log4js');
var fs = require("fs");
var _ = require("underscore");
var logDirectory = __dirname + '/../log';
// 加上socket提示
var socketHelper = require("./websocket");
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
log4js.configure({
  appenders: [
    {
      type: 'console',
      category: "console"

    }, //控制台输出
    {
      type: "file",
      filename: logDirectory + '/log.log',
      pattern: "_yyyy-MM-dd",
      maxLogSize: 20480,
      backups: 3,
      category: 'dateFileLog'
    }//日期文件格式
  ],
  replaceConsole: true,   //替换console.log
  levels:{
    dateFileLog: 'debug',
    console: 'debug'
  }
});


var dateFileLog = log4js.getLogger('dateFileLog');
var consoleLog = log4js.getLogger('console');
// 开发模式输出console信息
//exports.logger = consoleLog;

module.exports = function(env){
  // 生成模式，将日志输出到文件中, 这个是默认的
  var logger = dateFileLog;
  // 如果是生产模式，那么就重写console方法
  // NODE_ENV=publish node bin/www   或者  NODE_ENV=publish nodemon bin/www
  if(env == 'publish'){
    _.each(["log","info","debug"],function(item){
      // 重写 console  相关方法，如果是 生产环境的话，那么就抄送一份到日志去
      console[item] = (function(oriLogFunc){
        return function(str) {
          logger.debug.apply(logger,arguments);
          socketHelper.send(str);
          oriLogFunc.apply(console, arguments);
        }
      })(console[item]);
    });
  }else{
    // 普通模式
    logger = consoleLog;
    _.each(["log","info","debug"],function(item){
      // 重写 console, 加上socket信息
      console[item] = (function(oriLogFunc){
        return function(str) {
          socketHelper.send(str);
          oriLogFunc.apply(console, arguments);
        }
      })(console[item]);
    });
  }
  return {
    logger: logger
  }
};