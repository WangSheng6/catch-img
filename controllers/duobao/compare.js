var duobao_global = require("./global");
var _ = require("underscore");
var dbSiteHelper = require('../../lib/dbSiteHelper');
module.exports = function (req, res, next) {
  var site = req.query["site"];
  var time1 = req.query["time1"];
  var time2 = req.query["time2"];

  dbSiteHelper.getCollectionItem(site,{time:time1}).then(function(data1){
    dbSiteHelper.getCollectionItem(site,{time:time2}).then(function(data2){
      // 接下来开始比较
      var arr1 = _.map(data1.data.td,function(item){
        return item.name;
      });
      var arr2 = _.map(data2.data.td,function(item){
        return item.name;
      });
      var diff1 = _.difference(arr1, arr2);
      var diff2 = _.difference(arr2, arr1);
      res.render('duobao/compare', {
        title: duobao_global.SITE_LIST[site],
        targetDif: diff1.length > diff2.length ? diff1 : diff2,
        diff1: diff1,
        time1: time1,
        diff2: diff2,
        time2: time2
      });
    })
  })
};