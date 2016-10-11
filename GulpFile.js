var path = require('path');
var gulp = require('gulp'),
    del = require("del"),
    _ = require("underscore"),
    seq = require("gulp-sequence"),
    replace = require("gulp-replace"),
    zip = require('gulp-zip'),
    gutil = require("gulp-util");

var BUILD_DIR = path.join(__dirname, 'build');
var WORKSPACE_DIR = path.join(__dirname, './');
var BUILD_TIME = gutil.date('yymmddHHMM');
var noCopyDir = [".git", "log", ".idea", "backup", "bower_components", "build", "node_modules"];
var noCopyFile = ["*.zip"];
// Clean
gulp.task('clean', function() {
    return del(BUILD_DIR);
});

gulp.task('copy_all', function() {
    var copydir = [WORKSPACE_DIR + '**/*'].concat(_.map(noCopyDir, function(item){
        return "!" + item + "/**/*";
    })).concat(_.map(noCopyFile,function(item){
        return "!" + item;
    }));
    console.log(copydir);
    return gulp.src(copydir).pipe(gulp.dest(BUILD_DIR));
});
// 去掉build目录的一些目录
gulp.task('del_empty', function() {
    return del(_.map(noCopyDir, function(item){
        return BUILD_DIR + "/" + item;
    }));
});
gulp.task('copy', seq('copy_all', 'del_empty'));

// 去掉 livereload的代码
gulp.task('removeCode_app', function() {
    return gulp.src([path.join(BUILD_DIR, 'app.js')]).
        pipe(replace(/<!-- REMOVE START -->[\s\S]+?<!-- REMOVE END -->/gi, "")).
        pipe(gulp.dest(BUILD_DIR));
});

// 去掉 livereload的代码
gulp.task('removeCode_view', function() {
    return gulp.src([path.join(BUILD_DIR, 'views/**/*.ejs')]).
        pipe(replace(/<!-- REMOVE START -->[\s\S]+?<!-- REMOVE END -->/gi, "")).
        pipe(gulp.dest(path.join(BUILD_DIR, 'views')));
});
// 打 zip 包
gulp.task('zip', function () {
    var zipName = "catch_util" + '_' + BUILD_TIME + '.zip';
    return gulp.src(BUILD_DIR + '/**')
        .pipe(zip(zipName))
        .pipe(gulp.dest('.'));
});

gulp.task('removeCode', seq('removeCode_app', 'removeCode_view'));

gulp.task('default', seq('clean', 'copy', 'removeCode', 'zip'));