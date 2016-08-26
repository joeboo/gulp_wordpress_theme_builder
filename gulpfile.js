"use strict"

// Project configuration

// Project configuration
var project 		= 'neat', // Project name, used for build zip.
	url 		= 'localhost/mrtandcoffee/', // Local Development URL for BrowserSync. Change as-needed.
	bower 		= './assets/bower_components/', // Not truly using this yet, more or less playing right now. TO-DO Place in Dev branch
	build 		= './buildtheme/', // Files that you want to package into a zip go here
	buildInclude 	= [
				// include common file types
				'**/*.php',
				'**/*.html',
				'**/*.css',
				'**/*.js',
				'**/*.svg',
				'**/*.ttf',
				'**/*.otf',
				'**/*.eot',
				'**/*.woff',
				'**/*.woff2',

				// include specific files and folders
				'screenshot.png',

				// exclude files and folders
				'!node_modules/**/*',
				'!assets/bower_components/**/*',
				'!style.css.map',
				'!assets/js/custom/*',
				'!assets/css/partials/*'
];

var gulp 			= require('gulp'),
	browserSync  	= require('browser-sync'),
	reload       	= browserSync.reload,
	autoprefixer 	= require('gulp-autoprefixer'),
	minifycss    	= require('gulp-uglifycss'),
	filter       	= require('gulp-filter'),
	browserify 		= require('browserify'),
	source 			= require('vinyl-source-stream'),	
	uglify  		= require('gulp-uglify'),
	source  		= require('vinyl-source-stream'),
	buffer  		= require('vinyl-buffer'),
	notify      	= require('gulp-notify'),
	rename      	= require('gulp-rename'),
	imagemin     	= require('gulp-imagemin'),
	newer        	= require('gulp-newer'),
	cmq          	= require('gulp-combine-media-queries'),
	runSequence  	= require('gulp-run-sequence'),
	sass         	= require('gulp-sass'),
	plugins      	= require('gulp-load-plugins')({ camelize: true }),
	ignore       	= require('gulp-ignore'), // Helps with ignoring files and directories in our run tasks
	rimraf       	= require('gulp-rimraf'), // Helps with removing files and directories in our run tasks
	zip          	= require('gulp-zip'), // Using to zip up our packaged theme into a tasty zip file that can be installed in WordPress!
	plumber      	= require('gulp-plumber'), // Helps prevent stream crashing on errors
	cache        	= require('gulp-cache'),
	sourcemaps   	= require('gulp-sourcemaps');




gulp.task('browser-sync', function() {
	var files = [
					'**/*.php',
					'**/*.{png,jpg,gif}'
				];
	browserSync.init(files, {

		// Read here http://www.browsersync.io/docs/options/
		proxy: url,

		// port: 8080,

		// Tunnel the Browsersync server through a random Public URL
		// tunnel: true,

		// Attempt to use the URL "http://my-private-site.localtunnel.me"
		// tunnel: "ppress",

		// Inject CSS changes
		injectChanges: true

	});
});




gulp.task('browserifyVendorsJs', function() {
    return browserify('./js/vendors.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
        .pipe(uglify()) // now gulp-uglify works 
        	.pipe(rename( {
					basename: "vendors",
					suffix: '.min'
				}))
        .pipe(gulp.dest('./assets/'))
        .pipe(notify({ message: 'Custom scripts task complete', onLast: true }));

});



gulp.task('browserifyscriptsJs', function() {
    return browserify('./assets/js/custom/scripts.js')
        .bundle()
        .pipe(source('scripts.js'))
        .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
        .pipe(uglify()) // now gulp-uglify works 
        	.pipe(rename( {
					basename: "customs",
					suffix: '.min'
				}))
        .pipe(gulp.dest('./assets/'))
        .pipe(notify({ message: 'Custom scripts task complete', onLast: true }));

});

gulp.task('images', function() {
// Add the newer pipe to pass through newer images only
	return 	gulp.src(['./assets/img/raw/**/*.{png,jpg,gif}'])
			.pipe(newer('./assets/img/'))
			.pipe(rimraf({ force: true }))
			.pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
			.pipe(gulp.dest('./assets/img/'))
			.pipe( notify( { message: 'Images task complete', onLast: true } ) );
});

/**
 * Clean gulp cache
 */
 gulp.task('clear', function () {
   cache.clearAll();
 });

 /**
  * Clean tasks for zip
  *
 */
 gulp.task('cleanup', function() {
 	return 	gulp.src(['./assets/bower_components', '**/.sass-cache','**/.DS_Store'], { read: false }) // much faster
		 		.pipe(ignore('node_modules/**')) //Example of a directory to ignore
		 		.pipe(rimraf({ force: true }))
		 		.pipe(notify({ message: 'Clean task complete', onLast: true }));
 });


   gulp.task('buildFiles', function() {
  	return 	gulp.src(buildInclude)
 		 		.pipe(gulp.dest(build))
 		 		.pipe(notify({ message: 'Copy from buildFiles complete', onLast: true }));
  });


  /**
* Images
*
* Look at src/images, optimize the images and send them to the appropriate place
*/
gulp.task('buildImages', function() {
	return 	gulp.src(['assets/img/**/*', '!assets/images/raw/**'])
		 		.pipe(gulp.dest(build+'assets/img/'))
		 		.pipe(plugins.notify({ message: 'Images copied to buildTheme folder', onLast: true }));
});




 /**
  * Zipping build directory for distribution
  *
  * Taking the build folder, which has been cleaned, containing optimized files and zipping it up to send out as an installable theme
 */
 gulp.task('buildZip', function () {
 	// return 	gulp.src([build+'/**/', './.jshintrc','./.bowerrc','./.gitignore' ])
 	return 	gulp.src(build+'/**/')
		 		.pipe(zip(project+'.zip'))
		 		.pipe(gulp.dest('./'))
		 		.pipe(notify({ message: 'Zip task complete', onLast: true }));
 });




 // ==== TASKS ==== //
 /**
  * Gulp Default Task
  *
  * Compiles styles, fires-up browser sync, watches js and php files. Note browser sync task watches php files
  *
 */

 // Package Distributable Theme
 gulp.task('build', function(cb) {
 	runSequence('styles', 'cleanup', 'vendorsJs', 'scriptsJs',  'buildFiles', 'buildImages', 'buildZip','cleanupFinal', cb);
 });


 // Watch Task
 gulp.task('default', ['styles', 'vendorsJs', 'scriptsJs', 'images', 'browser-sync'], function () {
 	gulp.watch('./assets/img/raw/**/*', ['images']);
 	gulp.watch('./assets/css/**/*.scss', ['styles']);
 	gulp.watch('./assets/js/**/*.js', ['scriptsJs', browserSync.reload]);

 });
