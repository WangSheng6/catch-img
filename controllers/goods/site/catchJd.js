var cheerio = require("cheerio");
var Q = require("q");
var _ = require("underscore");
var catchCommon = require('../common');
// 抓取京东的商品数据
module.exports = {
  // 配置
  setting: {
    //京东的页面是gbk编码，所以要带上gbk，不然中文会乱码
    encoding: "gbk",
    // phantom 脚本的名字
    phantomUrlName: "catchJd"
  },
  // 从抓取的页面获取商品信息
  getGoodsData: function(data,url){
    var defer = Q.defer();
    var $ = cheerio.load(data);
    var imgSrcArr = [];
    //var detailUrl = 'http://d.3.cn/desc/'+url.match(/[0-9]+/g)[0]+'?cdn=2&callback=showdesc';
    var detailUrl = 'http:'+data.match(/(\/\/d\.3\.cn\/desc.*?cdn=2)/g);//获取详情图链接
    console.log('准备抓去详情列表:'+ detailUrl);
    $(".spec-items li img").each(function(i, e) {
      imgSrcArr.push("http:" + $(e).attr("src"));
    });
    // 这边要用text，不然中文会乱码, 同时还要过滤掉一些敏感字符
    var goodName = $('#name h1').text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "")|| $(".sku-name").text().trim().replace(/[`~!@#$^&*()+=|\[\]\{\}:;'\,.<>/?]/g, "");
    // todo http://img14.360buyimg.com/n5/jfs/t2053/317/924464287/25158/b0e589f2/5631d1a9N4668d62a.jpg
    // 只要把链接中的n5，改成n4，n3，n2，n1，就可以下载对应的图片
    // 目前只抓n1，并把n1改成 intro_big_pics
    //自营 //img14.360buyimg.com/n1/s450x450_jfs/t2815/250/3157154743/122751/b31945e7/57848875N5f821af9.jpg
    //非自营 http://img12.360buyimg.com/n1/jfs/t3172/210/1543050973/163848/4fbedd60/57cf65d7Nf9d05f44.jpg
    var allImgSrcArr = [
      {
        key: 'intro_big_pics',
        value: _.map(imgSrcArr, function (item) {
          return item.replace("/n5/", '/n1/').replace("https:", "http").replace('s54x54_jfs','s450x450_jfs');
        })
      }
    ];
    console.log(JSON.stringify(allImgSrcArr));
    // 使用phantom js 或者详情图片
    /*catchCommon.getDetailImg(url,function(arr){
      allImgSrcArr.push({
        key: "descr",
        value: arr
      });
      defer.resolve({
        imgArr: allImgSrcArr,
        goodsName: goodName
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
