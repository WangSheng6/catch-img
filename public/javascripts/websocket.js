(function(){
  // 创建一个Socket实例
  var socket = new WebSocket('ws://localhost:4008');

  var log = function(msg){
    if($("body .socketTip").length == 0){
      $("body").append('<div class="socketTip"></div>');
    }
    $("body .socketTip").html($("body .socketTip").html() + "<br>" + msg);
  };

  // 打开Socket
  socket.onopen = function(event) {
    // 监听消息
    socket.onmessage = function(event) {
      if(typeof(event.data)=="string"){
        // string的方式
        log(event.data);
      }
    };
    // 监听Socket的关闭
    socket.onclose = function(event) {
      log("socket 关闭");
    };
  };
})();