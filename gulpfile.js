'use strict';

const fs = require('fs');
const gulp = require('gulp');
const browserify = require('browserify');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const cleancss = require('gulp-cleancss');
const autoprefixer = require('gulp-autoprefixer');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');

const src = './src/';
const dest = './build/';
const dict = './node_modules/eyo-kernel/dict/';

const uglifyOptions = {
	output: {
		ascii_only: true,
		comments: 'some'
	}
};

gulp.task('js', function() {
    return browserify([`${src}index.js`])
        .transform('babelify', {
            global: true,
            presets: [['es2015', {loose: true}]]
        })
        .bundle()
        .pipe(source('index.min.js'))
        .pipe(streamify(uglify(uglifyOptions)))
        .pipe(gulp.dest(dest));
});

gulp.task('safe-dict', function() {
    return gulp.src(`${dict}safe.txt`)
                .pipe(gulp.dest(dest));
});

gulp.task('not-safe-dict', function() {
    return gulp.src(`${dict}not_safe.txt`)
                .pipe(gulp.dest(dest));
});

gulp.task('css', function() {
    return gulp.src(`${src}index.css`)
           .pipe(autoprefixer())
           .pipe(cleancss())
           .pipe(rename('index.min.css'))
           .pipe(gulp.dest(dest));
});

gulp.task('html', function() {
    return gulp.src(`${src}index.html`)
       .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['js', 'css', 'html', 'safe-dict', 'not-safe-dict']);
