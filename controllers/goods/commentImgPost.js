var catchCommon = require('./common');
var _ = require("underscore");

// router goods/commentImg  post
module.exports = function (req, res, next) {
    var urlsObj = req.body["url"].split("\n"), urls = [], urlsSetting = {};

    _.each(urlsObj,function(item){
        var tmpArr = item.trim().split(",");
        var tmpUrl = tmpArr[0].trim();
        if(tmpUrl.indexOf("https") == 0){
            tmpUrl = tmpUrl.replace('https', 'http');
        }
        urls.push(tmpUrl);
        urlsSetting[tmpUrl] = {
            start: (tmpArr[1] && parseInt(tmpArr[1].trim())) || 0,
            end: (tmpArr[2] && parseInt(tmpArr[2].trim())) || 0
        }

    });
    catchCommon.catchImgSimpleHandle(req, res, next, {
      timeout: 1000000,
      active: "comment",
      urls: urls,
      urlsSetting: urlsSetting
    })
};