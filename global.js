mongoskin = require('mongoskin');
// 数据库名
exports.database = mongoskin.db(process.env.MONGOLAB_URI || "mongodb://localhost/catchUtil");