// phantom.js 用于抓取京东详细页
console.log(123456);
var page = require('webpage').create();
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
  // 加载 jquery
  page.includeJs( '/public/javascripts/jquery.min.js', function() {
    // 处理数据
    var imgMsg = page.evaluate(function() {
      //return document.title;
      var imgArr = [];
      $("#J-detail-content img").each(function(){
        var imgSrc = $(this).attr("data-lazyload") || $(this).attr("src");
        if(imgSrc.substr(0,2) === '//'){
          imgSrc = 'http:' + imgSrc;
        }
        imgSrc = imgSrc.replace("https:","http:");
        imgArr.push(imgSrc);
      });
      return imgArr;
    });
    //console.log(imgArr);
    // 将数据返回
    console.log(JSON.stringify({
      code : 1,
      msg: imgMsg
    }));
    phantom.exit();
  });
});