var dbSiteHelper = require('../../lib/dbSiteHelper');
var Q = require("q");
module.exports = {
  // 要抓取的站点列表
  SITE_LIST : {
    "yiyuan": "一元夺宝",
    "quanmin": "全民夺宝",
    "yyyg": "一元云购",
    "xunlei": "迅雷一元夺宝"
  },
  // 将记录插入数据库
  insertSiteData: function(site, pageData){
    var defer = Q.defer();
    var insertData = function(){
      dbSiteHelper.getCollectionItem(site,{time: pageData.time}).then(function(){
        // 如果已经存在，那么直接覆盖
        console.log("已经存在，直接覆盖");
        dbSiteHelper.getCollection(site).update({
          "time": pageData.time
        }, {'$set':{
          "data": pageData.data
        }}, function (err, list) {
          if (err){
            console.log("err: " + err);
            throw err;
          }
          defer.resolve(pageData);
        });
      },function(){
        console.log("不存在，插入");
        dbSiteHelper.getCollection(site).insert({
          "name": site,
          "time": pageData.time,
          "data": pageData.data
        }, function (err, list) {
          if (err){
            console.log("err: " + err);
            throw err;
          }
          defer.resolve(pageData);
        });
      });
    };
    // 接下来入库
    dbSiteHelper.checkSiteExist(site).then(function(){
      // 已存在
      insertData();
    },function(){
      dbSiteHelper.dbSiteList.insert({
        key: site,
        name: module.exports.SITE_LIST[site]
      },function(){
        insertData();
      });
    });
    return defer.promise;
  }
};