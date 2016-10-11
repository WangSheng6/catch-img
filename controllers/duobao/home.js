var _ = require("underscore");
var duobao_global = require("./global");
module.exports = function (req, res, next) {
  res.render('duobao', {
    data: _.pairs(duobao_global.SITE_LIST)
  });
};