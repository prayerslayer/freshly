var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    eslint = require('gulp-eslint'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    cssmin = require('gulp-cssmin'),
    sourcemaps = require('gulp-sourcemaps'),
    prefix = require('gulp-autoprefixer'),
    less = require('gulp-less');

gulp.task('default', ['build']);

gulp.task('less', function() {
    return gulp.src('src/stylesheets/main.less')
            .pipe(less())
            .pipe(prefix())
            .pipe(concat('freshly.css'))
            .pipe(cssmin())
            .pipe(gulp.dest('dist'));
});

gulp.task('build:css', ['less']);

gulp.task('lint', function () {
    return gulp.src('src/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build:js', ['lint'], function() {
    return gulp
        .src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(babel())
        .pipe(concat('freshly.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], function() {
    watch('app/assets/**/*.js', { emitOnGlob: true }, function() {
        gulp.run('build:js');
    });
});

gulp.task('build', ['build:js', 'build:css']);
