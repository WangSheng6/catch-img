var siteCatch = require('./site');
// router goods/commentText  post
module.exports = function (req, res, next) {
    res.setTimeout(1000000, function () {
        console.log("响应超时.");
        res.send("响应超时");
    });
    siteCatch["commentWY"](req.body).then(function(data){
        res.render('commentText', {
            data: data
        });
    })
};