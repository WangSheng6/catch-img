var cheerio = require("cheerio");
var Q = require("q");
var _ = require("underscore");
var airHelper = require('../../../lib/helper');
var box;
// 抓取苏宁的晒单数据
module.exports = {
    // 配置
    setting: {

    },
    // 从抓取的页面获取商品信息
    getGoodsData: function(data,url, opt){
      var defer = Q.defer();
      var $ = cheerio.load(data);
      var id = $("#curPartNumber").val();
      var supplierID = url.replace(/(.*suning.com\/)(.*)(\/.*html.*)/,'$2');
      supplierID = supplierID !== url ? supplierID : "";
      // 这边要用text，不然中文会乱码, 同时还要过滤掉一些敏感字符
      var goodName = $("#itemDisplayName").text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "");
      var originImgArr = [];
      var urlSetting = opt.urlsSetting[url];
      var count = Math.max(urlSetting.start || 1, 1);
      // 最大页数
      var maxPage = urlSetting.end;
      if(maxPage < count){
        maxPage = count + 10;
      }
      var getPageUrl = function(index){
        // 有图的评价
        var nextUrl = 'http://review.suning.com/ajax/review_lists/general-'+ id +'-'+ supplierID +'-show-'+ index +'-default-10-----reviewList.htm?callback=reviewList';
        console.log(nextUrl);
        return nextUrl;
      };
      var doCatch = function(){
        if(count > maxPage){
          defer.resolve({
            imgArr: [
              {
                key: '400X400',
                value: _.map(originImgArr, function (item) {
                  return (item + '_400x400.jpg').replace("https:", "http");
                })
              }
            ],
            goodsName: goodName,
            picUrl: box
          });
        }else{
          console.log(count);
          airHelper.getPageData(getPageUrl(count)).then(function(data) {
            // 获取数据并下载
            //console.log(data);
            try{
              if(data){
                data = data.substring(11,data.length-1);
                data = JSON.parse(data);
                _.each(data.commodityReviews, function(reviewItem){
                  reviewItem.picVideInfo && _.each(reviewItem.picVideInfo.imageInfo,function(item){
                    originImgArr.push(item.url);
                  });
                  reviewItem.againReviewImgList && _.each(reviewItem.againReviewImgList,function(item){
                    originImgArr.push(item.imgId);
                  });
                });
                console.log(originImgArr);
                box = originImgArr.join('\n');
              }else{
                count = maxPage;
              }
            }catch(e){
              count = maxPage;
            }
            count += 1;
            doCatch();
          },function(){
            console.log("error");
          });
        }
      };
      doCatch();
      return defer.promise;
    }
};