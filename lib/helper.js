var http = require("http");
var https = require("https");
var fs = require("fs");
var Q = require("q");
var _ = require("underscore");
var archiver = require('archiver');
var airRmdir = require('rimraf');
var iconv = require("iconv-lite");
var BufferHelper = require('bufferhelper');
var request = require('request');

/**
 * Returns array of file names from specified directory
 *
 * @param {dir} directory of source files.
 * return {array}
 */
var getDirectoryList = function(dir){
  var fileArray = [];
  var walk = function(path,childPath){
    var files = fs.readdirSync(path);
    files.forEach(function(item) {
      var tmpPath = path + "/" + item,
          stats = fs.statSync(tmpPath);
      if (stats.isDirectory()) {
        walk(tmpPath,childPath + item + '/');
      } else {
        var obj = {name: childPath + item, path: dir};
        fileArray.push(obj);
      }
    });
  };

  walk(dir,'');
  return fileArray;
};

// 生成zip文件
exports.writeZip = function (dir,name,callback) {
  var zipName = name + ".zip",
      fileArray = getDirectoryList(dir),
      output = fs.createWriteStream(zipName),
      archive = archiver('zip');

  archive.pipe(output);
  output.on('close', function() {
    console.log('archiver has been finalized and the output file descriptor has closed.');
    // 执行回调函数
    callback(zipName);
  });
  fileArray.forEach(function(item){
    var file = item.path + item.name;
    archive.append(fs.createReadStream(file), { name: item.name });
  });

  archive.finalize(function(err, written) {
    if (err) {
      throw err;
    }
  });
};

// 创建对应的文件夹
exports.createDir = function(path,cb){
  var dirArr = [];
  var pathArr = path.split(".")[0].replace(/\\/g,"/").split("/");
  if(path.split(".")[1]){
    // 如果存在后缀名，那么去掉最后一个
    pathArr.pop();
  }
  var tempArr = [];
  _.each(pathArr,function(item){
    tempArr.push(item);
    dirArr.push(tempArr.join("/"))
  });
  var count = 0;
  var makeDir = function(dirPath){
    if(dirPath){
      fs.exists(dirPath,function(exists) {
        count += 1;
        if (exists) {
          makeDir(dirArr[count]);
        } else {
          try{
            // 这边同步，防止提前回调
            fs.mkdirSync(dirPath);
            makeDir(dirArr[count]);
            console.log("创建"+ dirPath +"文件夹成功");
          }catch(e){
            console.log("创建"+ dirPath +"文件夹失败");
            makeDir(dirArr[count]);
          }
        }
      });
    }else{
      _.isFunction(cb) && cb(path);
    }
  };
  makeDir(dirArr[count]);
};

// 删除一个文件夹
exports.removeDir = function(filePath,callback){
  airRmdir(filePath,function(err){
    if(!err){
      console.log("删除=="+ filePath +"目录成功");
      _.isFunction(callback) && callback();
    }else{
      console.log("删除目录失败");
    }
  })
};

// 清空某一个文件夹
exports.clearDir = function(path,callback){
  fs.readdir(path, function(err, files){
    //err 为错误 , files 文件名列表包含文件夹与文件
    if(err){
      console.log('error:\n' + err);
      return;
    }
    var count = files.length;
    var delFinish =0;
    if(count == 0){
      _.isFunction(callback) && callback();
    }else{
      files.forEach(function(file,index){
        var filePath = path + '/' + file;
        fs.stat(filePath, function(err, stat){
          if(err){console.log(err); return;}
          if(stat.isDirectory()){
            // 如果是文件夹
            airRmdir(filePath,function(err){
              if(!err){
                console.log("删除=="+ filePath +"目录成功");
                delFinish += 1;
                // 判断是否是最后一个
                if(delFinish === count){
                  console.log("执行回调");
                  _.isFunction(callback) && callback();
                }
              }else{
                console.log("删除目录失败");
              }
            })
          }else{
            // 读出所有的文件
            // 如果是文件，就删除;
            fs.unlink(filePath, function (err) {
              delFinish += 1;
              if (err) {
                // 出错
                console.log("删除文件出错");
              }
              // 判断是否是最后一个
              if(delFinish === count){
                _.isFunction(callback) && callback();
              }
            });
          }
        });
      });
    }
  });
};
var header = {
  'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
}
exports.getPageData = function(url, encoding) {
  var defer = Q.defer();
  if(url.indexOf("www.amazon.com") > -1){
     http.get(url, function(res){
       var bufferHelper = new BufferHelper();
       console.log("Got response: " + res.statusCode);
       res.on('data',function(chunk){
         bufferHelper.concat(chunk);
       }).on('end',function(){
         var result = iconv.decode(bufferHelper.toBuffer(), encoding || 'utf8');
         defer.resolve(result);
       })

     },header).on('error',function(e){
       console.log("Got error: " + e.message);
     });

  }else{
    var req = request(url, {
      jar: true,
      pool: false
    });
    // 增加user-agent，防止被服务器当做机器人禁掉
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');

    req.on('error', function(err) {
      defer.reject(err);
    });
    req.on('response', function(res) {
      var bufferHelper = new BufferHelper();
      res.on('data', function (chunk) {
        bufferHelper.concat(chunk);
      });
      res.on('end',function(){
        var result = iconv.decode(bufferHelper.toBuffer(), encoding || 'utf8');
        defer.resolve(result);
      });
    });
  }

  return defer.promise;
};

// 获取并保存单张图片
exports.catchAndSaveImg = function(url, name){
  var defer = Q.defer();
  url.indexOf("//") === 0 && (url = "http:" + url);
  if(url.indexOf("www.amazon.com") > -1){
    http.get(url,function (res) {
      //console.log(res.headers.location);
      https.get(res.headers.location, function(res){
        //二进制（binary）
        res.setEncoding('binary');
        var re ='';
        res.on('data',function (data) {
          re += data;
        }).on('end', function () {
          //var b = new Buffer(re);
          console.log("加载图片成功：" + name);
          fs.writeFile(name + ".jpg", re, 'binary',function(err){
            if(err) throw err;
            defer.resolve();
          });
        })
      });
      res.on('data',function (data) {

      }).on('end', function () {

      })
    }).on('error', function (e) {
      defer.reject();
      console.log("Got error: " + e.message);
    });

  }else{
    console.log('123:'+url);
    http.get(url,function (res) {
      //二进制（binary）
      res.setEncoding('binary');
      var re ='';
      res.on('data',function (data) {
        re += data;
      }).on('end', function () {
        //var b = new Buffer(re);
        console.log("加载图片成功：" + name);
        fs.writeFile(name + ".jpg", re, 'binary',function(err){
          if(err) throw err;
          defer.resolve();
        });
      })
    }).on('error', function (e) {
      defer.reject();
      console.log("Got error: " + e.message);
    });
  }

  return defer.promise;
};
// 数组删除
exports.arrayRemove = function(arr, val){
  var index = arr.indexOf(val);
  if (index > -1) {
    arr.splice(index, 1);
  }
};

exports.arrayRemoveItems = function (arrs) {
  for (var i = 0, l = arrs.length; i < l; i++) {
    exports.arrayRemove.remove(arrs[i]);
  }
};

exports.getUrlParam = function (name, url) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url || window.location.href);
  if (results == null)
    return "";
  else
    return results[1];
};

exports.getUserName = function (name){
  var regexS = /<a[^>]* class="a-size-base a-link-normal author" href="([^"]*)"[^>]*>(.*?)<\/a>/g;
  var result = regexS.exec(name);
  if (result == null)
    return "";
  else
    return result[2];
}
