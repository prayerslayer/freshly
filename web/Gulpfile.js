var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    traceur = require('gulp-traceur'),
    watch = require('gulp-watch'),
    jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    prefix = require('gulp-autoprefixer'),
    less = require('gulp-less');

gulp.task('default', ['build']);

gulp.task( 'jshint', function() {
    return gulp
        .src('app/assets/**/*.js')
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task( 'watch', ['build'], function() {
    watch( 'app/assets/**/*.js', { emitOnGlob: true }, function() {
        gulp.run('build:js');
    });
});

gulp.task('build', ['build:js']);

gulp.task('build:css', ['less']);

gulp.task('build:js', ['jshint'], function() {
    return gulp
        .src('app/assets/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(traceur({
            modules: 'amd',
            moduleName: true
        }))
        .pipe(concat('javascripts/freshly.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest( 'target/web/public/main/'));
});
