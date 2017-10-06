const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge2 = require('merge2');
const del = require('del');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');
const tsProj = ts.createProject('tsconfig.json', {

});

const tsProj2 = ts.createProject('tsconfig.json', {

});


gulp.task('clean', function() {
    return gulp.src('dist').pipe(clean());
});

gulp.task('build', ["clean"], function() {
    var compiledTs = gulp.src(['src/**/*.ts'], {base: "src"})
        .pipe(sourcemaps.init())
        .pipe(tsProj())
        .pipe(sourcemaps.write('./', {
            destPath : 'dist/',
            sourceRoot : path.resolve(__dirname + "/src")
        }))
        .pipe(gulp.dest("dist/"));

    return merge2(compiledTs);
});

gulp.task('watch', ["clean", 'build'], function() {
    gulp.watch(["src/**/*.ts", "src/**/*.js", "__tests__/**/*.ts"], ["build"]);
});