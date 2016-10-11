var Q = require("q");
var _ = require("underscore");
var airHelper = require('../../../lib/helper');
// 抓取全民夺宝数据
module.exports = function(){
  var defer = Q.defer();
  var pageData = {
    title: "全民夺宝(duobao369)",
    th: ['编号','名称'],
    td: []
  };
  // 最大页数
  var maxPage = 15;
  var getPageUrl = function(index){
    return "http://v1.mob.api.duobao369.com/prize/prize_list?page_size=20&page_no="+ index +"&order_by=level&desc=1&android_id=80747d8f4a4448ef&platform=android&v=1.6.3&device_name=aries&s=2b0f&nettype=wifi&n=52duobao_android&app_version=61&sim=false&device_id=860308029478894&mac=ac:f7:f3:45:dd:a5&os_version=4.1.1&"
  };
  var count = 1;
  var doCatch = function(){
    if(count > maxPage){
      defer.resolve(pageData);
    }else{
      console.log(count);
      airHelper.getPageData(getPageUrl(count)).then(function(data) {
        // 获取数据并下载
        data = JSON.parse(data);
        var tdArr = [];
        _.each(data.data,function(item){
          tdArr.push({
            name: item.title
          })
        });
        pageData.td = pageData.td.concat(tdArr);
        count += 1;
        doCatch();
      },function(){
        console.log("error");
      });
    }
  };
  doCatch();
  return defer.promise;
};