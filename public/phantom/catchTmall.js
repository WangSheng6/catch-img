// phantom.js 用于抓取天猫详细页

function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
      start = new Date().getTime(),
      condition = false,
      interval = setInterval(function() {
        if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
          // If not time-out yet and condition not yet fulfilled
          condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
        } else {
          if(!condition) {
            // If condition still not fulfilled (timeout but condition is 'false')
            console.log("'waitFor()' timeout");
            phantom.exit(1);
          } else {
            // Condition fulfilled (timeout and/or condition is 'true')
            console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
            typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
            clearInterval(interval); //< Stop this interval
          }
        }
      }, 250); //< repeat check every 250ms
}

var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36';
var url = "";
if (phantom.args.length === 0) {
  console.log(JSON.stringify({
    code : 0,
    msg : "no url"
  }));
  phantom.exit();
}else{
  url = phantom.args[0];
}
console.log(url);
page.open(url, function(status) {
  page.includeJs( '/public/javascripts/jquery.min.js', function() {
    // 处理数据
    // todo 天猫的详情页图片抓取不到，估计他们的服务端有做处理，因此只能获取详情页的url，然后再请求这个，最后再加载详情页图片
    var imgMsg = page.evaluate(function() {
      var imgArr = [];
      var lastIndex =  document.documentElement.innerHTML.lastIndexOf("httpsDescUrl");
      var tmpMsg = document.documentElement.innerHTML.substr(lastIndex-1, 500);
      // 得到详情页的链接
      imgArr.push(tmpMsg.replace(/(.*)(httpsDescUrl":")(.*)("},"api.*)/g,'$3'));
      return imgArr;
    });
    // 将数据返回
    console.log(JSON.stringify({
      code : 1,
      msg: imgMsg
    }));
    phantom.exit();
  });
});