const gulp        = require('gulp');
const browserSync = require('browser-sync');
const sass        = require('gulp-sass');
const prefix      = require('gulp-autoprefixer');
const cp          = require('child_process');
const run         = require('gulp-run');
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify-es').default;
const htmlmin     = require('gulp-htmlmin');
const rev         = require('gulp-rev');

const jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
const messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    //browserSync.notify(messages.jekyllBuild);
   var shellCommand = 'bundle exec jekyll build';
   return gulp.src('')
        .pipe(run(shellCommand));
});

gulp.task('jekyll-watch', function (done) {
    browserSync.notify(messages.jekyllBuild);
    var shellCommand = 'bundle exec jekyll build';
    return gulp.src('')
         .pipe(run(shellCommand));
});

gulp.task('jekyll-docker', function (done) {
    //browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['serve', '--host=0.0.0.0'], {stdio: 'inherit'})
        .on('close', done)
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-watch'], function () {

    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jekyll-watch', 'sass-fast', 'scripts', 'page-scripts', 'critical',], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});


/**
 * Bundles JS
 */

 gulp.task('scripts', function(){
   return gulp.src([
     'src/js/vendor/fetch.js',
     'src/js/vendor/es6-promise.min.js',
     'src/js/objects/**/*.js'
   ])
   .pipe(concat('bundle.js'))
   .pipe(uglify())
  //  .pipe(gulp.dest('static-assets/js'));
   .pipe(gulp.dest('static-assets/js'));
 });

 /**
 * Page Specific JS
 */


 gulp.task("page-scripts", function () {
    return gulp.src("src/js/page/**/*.js")
        .pipe(uglify(/* options */))
        .pipe(gulp.dest('static-assets/js'));
});




/**
 * Minify HTML
 */
gulp.task('minify', function() {
  return gulp.src('_site/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('_site'));
});


/**
 * Compile files from _sass into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass-fast', function () {
    return gulp.src('src/sass/*.sass')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['sass'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 3 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('static-assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('_site/static-assets/css'));
});



/**
 * Compile files from _sass into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('critical', function () {
    return gulp.src('src/sass/critical/*.sass')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['sass'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 3 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_includes/critical'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('_includes/critical'));
});


//Versioned Assets
gulp.task('prod-assets-css', function () {
    return gulp.src('static-assets/css/*.css')
        .pipe(rev())
        .pipe(gulp.dest('static-assets/dist'));
});

gulp.task('prod-assets-js', function () {
    return gulp.src('static-assets/js/home.js')
        .pipe(rev())
        .pipe(gulp.dest('static-assets/dist'));
});

gulp.task('prod-assets', ['prod-assets-css', 'prod-assets-js']);

//Watch Tasks
gulp.task('watch', function () {
    gulp.watch('src/**/*.sass', ['sass-fast', 'critical']);
    gulp.watch('src/js/**/*.js', ['scripts', 'page-scripts']);
    gulp.watch(['*.html','pages/**/*.html','src/js/**/*.js', 'src/sass/**/*.sass', '_layouts/*.html', '_includes/*.html', 'service-worker.js'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['scripts', 'page-scripts', 'critical', 'sass-fast', 'browser-sync', 'watch']);

/**
 * Gulp task for new homepage
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('new-home', ['critical', 'sass-fast', 'browser-sync', 'watch']);
