'use strict';

import {deleteAsync} from 'del';
import imagemin from 'gulp-imagemin';
import gulp from 'gulp';
import browserSync from 'browser-sync';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import uglify from 'gulp-uglify';
import usemin from 'gulp-usemin';
import rev from 'gulp-rev';
import cleanCss from 'gulp-clean-css';
import flatmap from 'gulp-flatmap';
import htmlmin from 'gulp-htmlmin';

var sass = gulpSass(dartSass);

gulp.task('sass', function() {
  return gulp.src('./css/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function() {
  gulp.watch('./css/*.scss', gulp.series('sass'));
});

gulp.task('browser-sync', function() {
  var files = [
    './*.html',
    './css/*.css',
    './js/*.js',
    './img/*.{png,jpg,gif}'
  ];

  browserSync.init(files, {
    server: {
      baseDir: './'
    }
  });
});

gulp.task('default', gulp.parallel('browser-sync', 'sass:watch'));

gulp.task('clean', function() {
  return deleteAsync(['dist']);
});

gulp.task('copyfonts', function() {
  return gulp.src('./node_modules/font-awesome/fonts/*.{ttf,woff,woff2,eot,svg,otf}')
  .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('imagemin', function() {
  return gulp.src('img/*.{png,jpg,gif}')
  .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true}))
  .pipe(gulp.dest('dist/img'));
});

gulp.task('usemin', function() {
  return gulp.src('./*.html')
  .pipe(flatmap(function(stream, file) {
    return stream
    .pipe(usemin({
      css: [rev()],
      html: [function() {
        return htmlmin({ collapseWhitespace: true })
      }],
      js: [uglify(), rev()],
      inlinejs: [uglify()],
      inlinecss: [cleanCss(), 'concat']
    }))
  }))
  .pipe(gulp.dest('dist/'));
});

gulp.task('build', gulp.series('clean', 'copyfonts', 'imagemin', 'usemin'));