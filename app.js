var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var routes = require('./routes/index');
var goods = require('./routes/goods');
var aso = require('./routes/aso');
var duobao = require('./routes/duobao');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var logger = require("./lib/log")(app.get('env')).logger;
app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));

app.use('/', routes);
app.use('/goods', goods);
app.use('/aso', aso);
app.use('/duobao', duobao);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


<!-- REMOVE START -->
//livereload = require('livereload');
//server = livereload.createServer();
//server.watch(__dirname + "/public");
<!-- REMOVE END -->
module.exports = app;
