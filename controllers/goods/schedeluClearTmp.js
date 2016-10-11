// 每天0点的时候，清空tmp文件
var schedule = require("node-schedule");
var airHelper = require('../../lib/helper');
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 0;
rule.minute = 0;
var doClearTmpDir = function(){
  airHelper.clearDir('tmp', function(){
    console.log("清除tmp文件成功")
  });
};
var tmp_clear_j = schedule.scheduleJob(rule, function(){
  doClearTmpDir();
});
doClearTmpDir();