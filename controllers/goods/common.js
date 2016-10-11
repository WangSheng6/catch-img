// 商品抓取的共用方法
var Q = require("q");
var airHelper = require('../../lib/helper');
var _ = require("underscore");
var path = require('path');
var childProcess = require('child_process');
//var phantomjs = require('phantomjs-prebuilt');
//var binPath = phantomjs.path;
var fs = require('fs');
var cheerio = require("cheerio");
var request = require('request');

module.exports = {
  // 下载每一个url对应的图片
  doCatchTheImg: function (url, option) {
    var defer = Q.defer();
    console.log("开始抓取：" + url);
    airHelper.getPageData(url, option && option.encoding).then(function (data) {
      defer.resolve(data);
    }, function () {
      console.log("error");
    });

    return defer.promise;
  },
  // 通过 phantom.js 获取页面中用js加载的东西
  // todo 京东的详情图片是不包含在页面的源代码里面的，而是通过页面的js加载出来的，因此要用phantom.js等页面加载完之后，再从dom里面取
 /* getDetailImg: function (url, callback, phantomUrlName, count) {
    count = count || 0;
    var self = this;
    var childArgs = [
      path.join(__dirname, '../../public/phantom/' + phantomUrlName + '.js'),
      url
    ];
    console.log(binPath);
    console.log(childArgs);

      childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        console.log(12345678999);
        var firstIndex = stdout.indexOf('{"code');
        var lastIndex = stdout.indexOf('"]}');
        var target = stdout.substr(firstIndex, lastIndex - firstIndex + 3);

        try {
          target = JSON.parse(target);
          if (target.code == 1) {
            // 返回详情图片数组
            console.log("使用phantom抓取图片成功：" + url);
            _.isFunction(callback) && callback(target.msg);
          }
        } catch (e) {
          console.log("使用phantom抓取图片失败：" + url);
          if (count < 3) {
            console.log("phantom 抓取重试");
            self.getDetailImg(url, callback, phantomUrlName, count + 1);
          } else {
            // 有问题，返回为空
            _.isFunction(callback) && callback([]);
          }
        }
      });
  },*/
  getDetailImg: function (detailUrl,url, callback, phantomUrlName, count) {
    var arr = [];
    var img;
    if(url.indexOf("item.jd.com") > -1){
      request(detailUrl, function(e,res,body){
        if(!e && res.statusCode== 200){
           img = body.match(/(\/\/img\d+.*?jpg)/g);

          if(img === null){
            img = body.match(/(\/\/img\d+.*?png)/g);
          }

          for(var i=0;i<img.length;i++){
            arr.push('http:'+img[i]);
          }
        }
      });
      _.isFunction(callback) && callback(arr);
    }else if(url.indexOf("detail.tmall.com") > -1){
      request(detailUrl, function(e,res,body){
        if(!e && res.statusCode== 200){
          var img = body.match(/(\/\/.*?jpg)/g);
          for(var i=0;i<img.length;i++){
            arr.push('http:'+img[i]);
          }
        }
      });
      _.isFunction(callback) && callback(arr);
    }
  },
  // 获取全部图片
  getAllImg: function (imgArr, fileName) {
    var defer = Q.defer();
    // 接下来就循环一张一张下载
    var doCatchAllImage = function () {
      if (imgArr.length > 0) {
        //console.log(imgArr.length);
        var imgSrcObj = imgArr.shift();
        var imgSrcArr = imgSrcObj.value;
        var detailFileName = fileName + "/" + imgSrcObj.key;
          airHelper.createDir(detailFileName, function () {
            // 接下来一张张下载
            var count = -1;
            var doCatchAndSaveImg = function () {
              if (imgSrcArr.length > 0) {
                count = count + 1;
                setTimeout(function(){
                  console.log(imgSrcArr.length);
                  airHelper.catchAndSaveImg(imgSrcArr.shift(), detailFileName + "/" + count).then(doCatchAndSaveImg, doCatchAndSaveImg);
                },50);
              } else {
                doCatchAllImage();
              }
            };
            doCatchAndSaveImg();
          })

      } else {
        // 成功返回
        defer.resolve();
      }
    };
    doCatchAllImage();
    return defer.promise;
  },
  //获取picUrl文件
  getPicUrl: function(allPicUrlData, fileName){
    var defer = Q.defer();
    //var urlPic = fileName.split('/')[2];
    fs.writeFile(fileName + '/'+ 'picData.txt', JSON.stringify(allPicUrlData), {flag: 'a'}, function (err) {
      if (err) throw err;
      console.log('write picUrl into TEXT');
    });
    return defer.promise;
  },
  // 抓取图片的常规操作
  catchImgSimpleHandle: function (req, res, next, opt) {
    var siteCatch = require("./site");
    var self = this;
    var TMPFILE = 'tmp';
    // 根据换行符分行
    opt = opt || {};
    opt.active = opt.active || "catch";
    var urls = opt.urls || (req.body["url"].split("\n"));
    var total = urls.length;
    // 是否超时
    var isTimeout = false;
    res.setTimeout(Math.max(total * (opt.timeout || 60000000), 30000000), function () {
      console.log("响应超时.");
      //isTimeout = true;
      res.send("响应超时");
    });
    var unionId = "goodsCatch_" + new Date().getTime();
    var parentFileName = TMPFILE + "/" + unionId;
    var doSuccess = function () {
      // 接下来是保存
      if (isTimeout) {
        // 超时，直接删掉资源文件
        airHelper.removeDir(parentFileName, function () {

        });
      } else {
        airHelper.writeZip(parentFileName + "/", TMPFILE + "/" + unionId, function (zipName) {
          // 最后下载到本地
          // 清掉这个临时的目录，然后下载zip
          airHelper.removeDir(parentFileName, function () {
            console.log("成功抓取" + total + "个商品");
            res.download(zipName);
          });
        });
      }
    };
    // 改为单进程
    var doCatch = function () {
      if (!isTimeout) {
        if (urls.length > 0) {
          var url = urls.shift().trim();
          if (url) {
            var catchHandler = null;
            if(url.indexOf("https") == 0){
              url = url.replace('https', 'http');
            }
            // 判断处理方式
            // 默认京东的处理方式
            switch (opt.active) {
              case "comment":
                catchHandler = siteCatch["commentJd"];
                if (url.indexOf("detail.tmall.com") > -1) {
                  catchHandler = siteCatch["commentTmall"];
                }else if(url.indexOf("product.suning.com") > -1){
                  catchHandler = siteCatch["commentSN"];
                }else if(url.indexOf("item.taobao.com")> -1){
                  catchHandler = siteCatch["commentTaobao"];
                }
                break;
              case "user":
                catchHandler = siteCatch["userAmazon"]; //todo 目前只有一个来源,默认亚马逊
                break;

              default:
                // 判断是否是天猫
                catchHandler = siteCatch["catchJd"];
                if (url.indexOf("detail.tmall.com") > -1) {
                  catchHandler = siteCatch["catchTmall"];
                }else if(url.indexOf("item.taobao.com") > -1){
                  catchHandler = siteCatch["catchTaobao"];
                }
                break;
            }
            self.doCatchTheImg(url, catchHandler.setting).then(function (data) {
              catchHandler.getGoodsData(data, url, opt).then(function (goodsData) {
                var fileName = parentFileName + "/" + goodsData.goodsName;
                console.log(fileName);
                // 接下来创建一个对应文件夹
                airHelper.createDir(fileName, function () {
                  // 获取数据并下载
                  self.getAllImg(goodsData.imgArr, fileName).then(function () {
                    console.log("成功抓取：" + goodsData.goodsName);
                    doCatch();
                  });
                  //获取picUrl
                  if(goodsData.picUrl){
                    self.getPicUrl(goodsData.picUrl, fileName).then(function(){
                      console.log("成功抓取picUrl!");
                      doCatch();
                    });
                  }

                });
              });
            });
          } else {
            doCatch();
          }
        } else {
          doSuccess();
        }
      } else {
        console.log("不应该进入到这里来");
      }
    };
    // 接下来创建文件夹
    // 接下来创建一个对应文件
    airHelper.createDir(parentFileName, function () {
      // 改为单进程，一条一条执行
      doCatch();
    });
  }
};
