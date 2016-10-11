var moment = require("moment");
var duobao_global = require("./global");
var siteCatch = require("./site");
module.exports = function (req, res, next) {
  var site = req.query["site"];
  var pageData = {
    title: duobao_global.SITE_LIST[site],
    site: site,
    time: moment().format("YYYY-MM-DD"),
    data: ''
  };

  var doFinish = function(data){
    pageData.data = data;
    // 插入数据库
    duobao_global.insertSiteData(site, pageData).then(function(pageData){
      res.render('duobao/catch', pageData);
    });
  };
  siteCatch[site]().then(doFinish);
};