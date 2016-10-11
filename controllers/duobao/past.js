var duobao_global = require("./global");
var dbSiteHelper = require('../../lib/dbSiteHelper');
module.exports = function (req, res, next) {
  var site = req.query["site"] || "yiyuan";
  var doFinish = function(list){
    res.render('duobao/past', {
      title: duobao_global.SITE_LIST[site],
      site: site,
      list: list || []
    });
  };
  dbSiteHelper.getCollectionAllItem(site,{},{time: -1}).then(doFinish,doFinish);
};