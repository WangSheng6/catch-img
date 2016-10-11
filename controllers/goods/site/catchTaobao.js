var cheerio = require("cheerio");
var Q = require("q");
var _ = require("underscore");
var catchCommon = require('../common');
var airHelper = require('../../../lib/helper');

// 抓取淘宝的商品数据
module.exports = {
    // 配置
    setting: {
      //天猫的页面是gbk编码，所以要带上gbk，不然中文会乱码
      encoding: "gbk"
    },
    // 从抓取的页面获取商品信息
    getGoodsData: function(data,url){
      var defer = Q.defer();
      var $ = cheerio.load(data);
      var imgSrcArr = [];
      $("#J_UlThumb li img").each(function(i, e) {
        var imgSrc = $(e).attr("data-src");
        if(imgSrc.indexOf("http") != 0){
          imgSrc = "http:" + imgSrc
        }
        imgSrcArr.push(imgSrc);
      });
      var sid = $("#J_Pine").attr("data-sellerid");
      // 这边要用text，不然中文会乱码, 同时还要过滤掉一些敏感字符
      var goodName = $(".tb-main-title").text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "");
      // todo http://gd1.alicdn.com/bao/uploaded/i1/TB1vhRzKFXXXXa7XFXXXXXXXXXX_!!0-item_pic.jpg_50x50.jpg
      // 只要把链接中的50x50改成 400x400
      var allImgSrcArr = [
        {
          key: 'intro_big_pics',
          value: _.map(imgSrcArr, function (item) {
            return item.replace("50x50", '400x400').replace("https:", "http");
          })
        }
      ];
      // 接下来获取源代码的 apiImgInfo 字段
      var lastIndex =  $("body").html().lastIndexOf("apiImgInfo");
      var tmpMsg = $("body").html().substr(lastIndex-1, 500);
      // 得到详情页的链接
      var imgDetailUrl = tmpMsg.split(/[\r\n]+/)[0].replace(/(.*)(apiImgInfo  : ')(.*)(',)/g,'$3');
      // 得到url的txt页面，并直接请求
      console.log("开始抓取淘宝详情页：" + imgDetailUrl);
      airHelper.getPageData(imgDetailUrl.indexOf('http') == 0 ? imgDetailUrl : ('http:' + imgDetailUrl)).then(function(data) {
        // 正则替换
        data = data.replace(/\s+/g, '').replace(/(\$callback\()(\S+)(\))/, "$2");
        data = JSON.parse(data);
        var newArr = [];
        _.each(data, function(item, key){
          if(_.isObject(item)){
            newArr.push("http://img.alicdn.com/imgextra/i4/"+ sid +"/" + key);
          }
        });
        allImgSrcArr.push({
          key: "descr",
          value: newArr
        });
        defer.resolve({
          imgArr: allImgSrcArr,
          goodsName: goodName
        });
      },function(){
        console.log("error");
      });
      return defer.promise;
    }
};