
var catchCommon = require('./common');

// router goods/catch
module.exports = function (req, res, next) {
  catchCommon.catchImgSimpleHandle(req, res, next);
};