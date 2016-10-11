var cheerio = require("cheerio");
var airHelper = require('../../lib/helper');

module.exports = function (req, res, next) {
    var url = req.body["url"];
    var pageData = {
        title: "",
        time: "",
        th: ['名次','图标','名字','厂商'],
        td: []
    };
    console.log("aso 开始抓取数据");
    // 获取dom
    airHelper.getPageData(url).then(function(data) {
        // 获取数据并下载
        var $ = cheerio.load(data);
        pageData.time = $(".date-range-picker span").html();
        pageData.title = $("title").html();
        var tdArr = [];
        $(".rank-list .thumbnail").each(function(i, e) {
            var name = $(e).find(".caption h5").html();
            var num = name.split(".")[0];
            tdArr.push({
                // 这边不需要总榜
                //num: $(e).find(".caption h6 span").html(),
                num: num,
                icon: $(e).find("img").attr("data-original") || $(e).find("img").attr("src"),
                name: name.substr(num.length + 1),
                company: $($(e).find(".caption h6")[0]).html()
            })
        });
        pageData.td = tdArr;
        res.render('aso', {
            data: pageData
        });
    },function(){
        console.log("error");
    });
};