var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var minify = require('gulp-minify');
 
function processJs() {
  gulp.src('scripts/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('dist'))
};

function processCss() {
  return gulp.src('./*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
};

function processHtml() {
  return gulp.src('html/*.html')
    .pipe(gulp.dest('./'));
};

gulp.task('process-js', processJs);
gulp.task('process-css', processCss);
gulp.task('process-html', processHtml);

gulp.task('default', function() {
	processJs();
	processCss();
	processHtml();
});