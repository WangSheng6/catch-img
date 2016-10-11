var cheerio = require("cheerio");
var Q = require("q");
var _ = require("underscore");
var catchCommon = require('../common');
var airHelper = require('../../../lib/helper');

// 抓取天猫的商品数据
module.exports = {
    // 配置
    setting: {
      //天猫的页面是gbk编码，所以要带上gbk，不然中文会乱码
      encoding: "gbk",
      // phantom 脚本的名字
      phantomUrlName: "catchTmall"
    },
    // 从抓取的页面获取商品信息
    getGoodsData: function(data,url){
      var defer = Q.defer();
      var $ = cheerio.load(data);
      var imgSrcArr = [];
      var detailUrl = 'http:'+ data.split('"httpsDescUrl":"')[1].split('"')[0];
      $("#J_UlThumb li img").each(function(i, e) {
        var imgSrc = $(e).attr("src");
        if(imgSrc.indexOf("http") != 0){
          imgSrc = "http:" + imgSrc
        }
        imgSrcArr.push(imgSrc);
      });
      // 这边要用text，不然中文会乱码, 同时还要过滤掉一些敏感字符
      var goodName = $(".tb-detail-hd h1").text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "");
      // todo https://img.alicdn.com/bao/uploaded/i3/TB1gALrJpXXXXXyXXXXXXXXXXXX_!!0-item_pic.jpg_60x60q90.jpg
      // 只要把链接中的60x60改成 430x430
      var allImgSrcArr = [
        {
          key: 'intro_big_pics',
          value: _.map(imgSrcArr, function (item) {
            return item.replace("60x60", '430x430').replace("https:", "http");
          })
        }
      ];
      console.log(allImgSrcArr);
      // 使用phantom js 获取详情图片
      /*catchCommon.getDetailImg(url,function(arr){
        // 得到url的txt页面，并直接请求
        console.log("开始抓取天猫详情页：" + arr[0]);
        airHelper.getPageData("http:" + arr[0]).then(function(data) {
          var arr = [];
          // 正则替换
          data.replace(/src="(\S+)"/g, function(match,$1){
            arr.push($1);
          });
          var newArr = [];
          _.each(arr,function(item){
            // 去掉分隔符
            if(item.indexOf("spaceball") == -1){
              if(item.substr(0,2) === '//'){
                item = 'http:' + item;
              }
              newArr.push(item.replace("https","http"));
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
      },this.setting.phantomUrlName);*/
      // 获取详情图片
      catchCommon.getDetailImg(detailUrl,url,function(arr){
        allImgSrcArr.push({
          key: "descr",
          value: arr
        });
        defer.resolve({
          imgArr: allImgSrcArr,
          goodsName: goodName
        });
      },this.setting.phantomUrlName);
      return defer.promise;
    }
};