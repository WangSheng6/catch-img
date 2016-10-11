// 数据库
var db = require("../global").database;
var Q = require("q");
// 绑定 collection 表
// 所有项目的site集合
db.bind("site_list");

module.exports = {
  db: db,
  dbSiteList: db.site_list,
  // 获取对应的集合
  getCollection: function (collectionName){
    if(!db[collectionName]){
      db.bind(collectionName);
    }
    return db[collectionName];
  },
  // 判断site是否存在
  checkSiteExist: function(site){
    var defer = Q.defer();
    this.dbSiteList.findOne({key:site}, function (err, row) {
      if (err) {
        defer.reject(err);
        throw err;
      } else {
        if(row){
          defer.resolve(row);
        }else{
          defer.reject(err);
        }
      }
    });
    return defer.promise;
  },
  // 获取表的数据
  getCollectionItem: function(projectName, obj) {
    var defer = Q.defer();
    this.getCollection(projectName).findOne(obj, function (err, row) {
      if (err) {
        defer.reject(err);
        throw err;
      } else {
        if (row) {
          defer.resolve(row);
        } else {
          defer.reject(err);
        }
      }
    });
    return defer.promise;
  },
  // 获取所以数据并且以数组的方式展现
  getCollectionAllItem: function(projectName, obj, sortBy){
    var defer = Q.defer();
    sortBy = sortBy || {};
    obj = obj || {};
    this.getCollection(projectName).find(obj).sort(sortBy).toArray(function(err, list){
      if (err){
        console.log("err: " + err);
        defer.reject();
        throw err;
      }
      defer.resolve(list);
    });
    return defer.promise;
  }
};