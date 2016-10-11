/**
 * author:ws
 * date:2016/08/03
 * function:抓取亚马逊商品评论(用户头像/昵称)
 */
var cheerio = require("cheerio");
var Q = require("q");
var _ = require("underscore");
var airHelper = require('../../../lib/helper');
var fs = require('fs');
// 抓取京东的晒单数据
module.exports = {
    // 配置
    setting: {
        //amazon的页面是utf-8编码，所以要带上utf-8，不然中文会乱码
        encoding: "utf-8"
    },
    // 从抓取的页面获取商品信息
    getGoodsData: function(data,url, opt){
        var defer = Q.defer();
        var $ = cheerio.load(data);
        //1 var id = url.replace(/(.*item\.jd\.com\/)(\S+)(\.html.*)/g, '$2');
        //var id = airHelper.getUrlParam("id", url);
        //var getID = url.split('/')[3].split('.')[0];
        var name = [];
        // 这边要用text，不然中文会乱码, 同时还要过滤掉一些敏感字符
        var goodName = $(".product-title h1 a").text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "");
        //var userName = $(".review-byline a").text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "");

        var originImgArr = [];
        var urlSetting = opt.urlsSetting[url];
        var count = urlSetting.start || 1;
        var box;
        // 最大页数
        var maxPage = urlSetting.end;
        if(maxPage < count){
            maxPage = count + 10;
        }
        var getPageUrl = function(index){
            // 有图的评价
            //return 'http://club.jd.com/productpage/p-'+ id +'-s-4-t-3-p-'+ index +'.html';
            // 总的评价， 不一定有图
            // 2 return 'http://club.jd.com/productpage/p-'+ id +'-s-0-t-3-p-'+ index +'.html';
            //有图的评价
            return url+'&pageNumber='+index+'&pageSize=50';
        };
        var doCatch = function(){
            if(count > maxPage){
                defer.resolve({
                    imgArr: [
                        {
                            key: '200X200',
                            value: _.map(originImgArr, function (item) {
                                // 3 return item.replace("128x96", '340x400').replace("https:", "http");
                                return 'http://www.amazon.com/avatar/default/'+ item.split('/')[4]+'?square=true&max_width=200';
                            })
                        }
                    ],
                    goodsName: goodName,
                    picUrl: name
                });
            }else{
                console.log(count);
                airHelper.getPageData(getPageUrl(count)).then(function(data) {
                    // 获取数据并下载
                    //console.log(data);
                    try{
                        if(data){
                            var userName = data.match(/<a[^>]* class=\"a-size-base a-link-normal author\" href="([^"]*)"[^>]*>(.*?)<\/a>/g);
                            console.log(userName.length);
                            _.map(userName,function(item){
                                name.push({
                                    author_name:airHelper.getUserName(item)
                                });
                            });
                            console.log(name);
                            var img = JSON.stringify(data).match(/(\/gp\/pdp\/profile.*?ie=UTF8)/g);
                            _.each(img,function(item){
                                originImgArr.push(item);
                            });
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
