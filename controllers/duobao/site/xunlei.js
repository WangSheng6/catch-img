var cheerio = require("cheerio");
var Q = require("q");
var airHelper = require('../../../lib/helper');
// 抓取迅雷一元夺宝数据
module.exports = function(){
  var defer = Q.defer();
  var pageData = {
    title: "迅雷一元夺宝",
    th: ['编号','名称'],
    td: []
  };
  var getPageUrl = function(index){
    return "http://1.vip.xunlei.com/";
  };
  airHelper.getPageData(getPageUrl()).then(function(data) {
    // 获取数据并下载
    var $ = cheerio.load(data);
    var tdArr = [];
    $(".cont_box .prize_img").each(function(i, e) {
      tdArr.push({
        name: $(e).attr("title")
      })
    });
    pageData.td = pageData.td.concat(tdArr);
    defer.resolve(pageData);
  },function(){
    console.log("error");
  });
  return defer.promise;
};