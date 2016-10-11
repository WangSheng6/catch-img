// 启动定时任务， 自动抓取，在每天的8点
var moment = require("moment");
var _ = require("underscore");
var duobao_global = require("./global");
var siteCatch = require("./site");
var schedule = require("node-schedule");
var siteArr = _.keys(duobao_global.SITE_LIST);

var doCatch = function(){
  if(siteArr.length > 0){
    var site = siteArr.shift();
    console.log("开始抓取站点：" + site);
    var pageData = {
      title: duobao_global.SITE_LIST[site],
      site: site,
      time: moment().format("YYYY-MM-DD"),
      data: ''
    };
    siteCatch[site]().then(function(data){
      pageData.data = data;
      // 插入数据库
      duobao_global.insertSiteData(site, pageData).then(function(pageData){
        console.log("抓取站点成功：" + site);
        doCatch();
      });
    });
  }else{
    console.log("任务执行完毕！！！");
  }
};
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 8;
rule.minute = 0;
var j = schedule.scheduleJob(rule, function(){
  console.log("开始定时抓取");
  doCatch();
});