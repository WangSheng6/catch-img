var Q = require("q");
var _ = require("underscore");
var airHelper = require('../../../lib/helper');
var goodsType = {
  "0":"全部",
  "1":"手机平板",
  "2":"电脑办公",
  "3":"数码影音",
  "4":"女性时尚",
  "5":"美食天地",
  "6":"潮流新品",
  "7":"网易周边",
  "8":"其他商品"
};
// 抓取全民夺宝数据
module.exports = function(reqBody){
  var defer = Q.defer();
  var type = parseInt(reqBody["type"]) || 0;
  var pageData = {
    title: "一元夺宝晒单数据",
    th: ['编号','商品', '标题', '内容'],
    td: [],
    type: goodsType[type.toString()]
  };
  var count = parseInt(reqBody["start"]) || 1;
  count < 1 && (count = 1);
  // 最大页数
  var maxPage = parseInt(reqBody["end"]);
  if(maxPage < count){
    maxPage = count + 5;
  }

  var getPageUrl = function(index){
    return "http://1.163.com/global/share/list.do?pageNum="+ index +"&pageSize=40&totalCnt=0&t=1453082266403"
  };
  var doCatch = function(){
    if(count > maxPage){
      defer.resolve(pageData);
    }else{
      airHelper.getPageData(getPageUrl(count)).then(function(data) {
        // 获取数据并下载
        data = JSON.parse(data);
        var tdArr = [];
       data.result && data.result.list &&  _.each(data.result.list,function(item){
         // 判断类型是否对
         if(type === 0 || (item.winRecord && item.winRecord.goods && item.winRecord.goods.typeId == type)){
           console.log(item.title);
           tdArr.push({
             title: item.title,
             des: item.content,
             name: item.winRecord.goods.gname
           })
         }
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