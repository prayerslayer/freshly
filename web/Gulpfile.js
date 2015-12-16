var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    watch = require('gulp-watch'),
    shell = require('shelljs'),
    spawn = require('child_process').spawn,
    cssmin = require('gulp-cssmin'),
    prefix = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    node;

gulp.task('default', ['build']);

gulp.task('less', function() {
    return gulp.src('style/main.less')
            .pipe(less())
            .pipe(plumber())
            .pipe(prefix())
            .pipe(concat('freshly.css'))
            .pipe(cssmin())
            .pipe(gulp.dest('dist'));
});

gulp.task('build:css', ['less']);

gulp.task('build:js', function() {
    // “All problems in computer science can be solved by another level of indirection”
    shell.exec('npm run build');
});

gulp.task('watch:js', ['build'], function() {
    watch('client/**/*.js', { emitOnGlob: true }, function() {
        gulp.run('build:js');
    });
});

gulp.task('watch:css', ['build'], function() {
    watch('style/**/*.less', { emitOnGlob: true }, function() {
        gulp.run('build:css');
    });
});

gulp.task('watch:server', function() {
    gulp.start('server');
    gulp.watch(['./server/*.js', './server/**/*.js'], ['server']);
});

gulp.task('watch', ['watch:js', 'watch:css', 'watch:server']);

gulp.task('build', ['build:js', 'build:css']);

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function () {
  if (node) node.kill();

  node = spawn('node', ['server/bootstrap.js'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill();
});
