var duobao_global = require("./global");

module.exports = function (req, res, next) {
  var site = req.query["site"];
  var pageData = {
    title: duobao_global.SITE_LIST[site],
    site: site,
    data: ''
  };
  res.render('duobao/catch', pageData);
};