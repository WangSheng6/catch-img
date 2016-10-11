var cheerio = require("cheerio");
var Q = require("q");
var _ = require("underscore");
var airHelper = require('../../../lib/helper');
var box;
// 抓取天猫的晒单图片
module.exports = {
    // 配置
    setting: {
      //天猫的页面是gbk编码，所以要带上gbk，不然中文会乱码
      encoding: "gbk"
    },
    // 从抓取的页面获取商品信息
    getGoodsData: function(data,url, opt){
      var defer = Q.defer();
      var $ = cheerio.load(data);
      var id = airHelper.getUrlParam("id", url);
      // 这边要用text，不然中文会乱码, 同时还要过滤掉一些敏感字符
      var goodName = $(".tb-detail-hd h1").text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "");
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
        return 'https://rate.tmall.com/list_detail_rate.htm?itemId='+ id +'&sellerId=1&order=3&currentPage='+ index +'&content=1&picture=1';
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
                data = "{" + data.trim() + "}";
                data = JSON.parse(data);
                data.rateDetail.paginator && (maxPage = Math.min(maxPage, data.rateDetail.paginator.lastPage));
                if(data.rateDetail.rateList && data.rateDetail.rateList.length > 0){
                  _.each(data.rateDetail.rateList,function(comments){
                    _.each(comments.pics,function(item){
                      // 先取400
                      originImgArr.push(item);
                    });
                  });
                  console.log(originImgArr);
                  box = originImgArr.join('\n');
                }
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