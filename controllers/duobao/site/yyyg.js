var cheerio = require("cheerio");
var Q = require("q");
var airHelper = require('../../../lib/helper');
// 抓取一元云购数据
module.exports = function(){
  var defer = Q.defer();
  var pageData = {
    title: "一元云购",
    th: ['编号','名称'],
    td: []
  };
  // 最大页数
  var maxPage = 5;
  var getPageUrl = function(index){
    return "http://www.yyyg.com/goods_list/index.html?p=" + index;
  };
  var count = 1;
  var doCatch = function(){
    if(count > maxPage){
      defer.resolve(pageData);
    }else{
      airHelper.getPageData(getPageUrl(count)).then(function(data) {
        // 获取数据并下载
        var $ = cheerio.load(data);
        var tdArr = [];
        $("#ulGoodsList .w-goods-title a").each(function(i, e) {
          tdArr.push({
            name: $(e).text().replace(/([一十1]元云购)(.*)/,"$2")
          })
        });
        // 获取尾页
        var pageEndUrl = $("#Page_End a").attr("href");
        pageEndUrl && (maxPage = pageEndUrl.replace(/(.*)(\?p=)(.*)/, "$3").trim());
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