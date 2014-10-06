gulp      = require('gulp')
uglify    = require('gulp-uglifyjs')
coffee    = require('gulp-coffee')
jade      = require('gulp-jade')
clean     = require('gulp-clean')
wrap      = require('gulp-wrap')
rename    = require('gulp-rename')
jasmine   = require('gulp-jasmine')
concat    = require('gulp-concat')
mochaPhantomJS = require('gulp-mocha-phantomjs')
watch     = require('gulp-watch')
gutil     = require('gulp-util')
notify    = require('gulp-notify')

handleError = (level, error)->
  gutil.log(error.message)

gulp.task 'default', ['scripts', 'specs:compile'], ->
  gulp
    .src('spec/runner.html')
    .pipe(mochaPhantomJS())
    .on("error", notify.onError())
    .on("error", ->
      this.emit('end')
    )
    .pipe(notify("Tests Passed :-)"))

gulp.task 'watch', ->
  gulp.watch(['src/**/*', 'spec/src/**/*', '!src/templates/**/*'], ["default"])
    .on("error", handleError)

gulp.task "scripts", ['templates:compile', 'templates:wrap'], ->
  gulp.src(["./src/json-interfaces.coffee", "./src/elements/base-element.coffee", "./src/elements/collection-element.coffee", "./src/elements/scalar-element.coffee", "./src/elements/textfield.coffee", "./src/**/*.js", "./src/**/*.coffee"])
    .pipe(coffee({bare: true}))
    #.pipe(wrap({src: 'return-exports-template.tpl.txt'}))
    #.pipe(uglify())
    .pipe(concat('json-interfaces.js'))
    .pipe(gulp.dest("lib"))

gulp.task "templates:compile", ['clean'], ->
  gulp.src(["./templates/*.jade"])
  .pipe(jade())
  .pipe(gulp.dest('./tmp'))

gulp.task "templates:wrap", ["templates:compile"], ->
  gulp.src(["./tmp/*.html"])
  .pipe(wrap("JsonInterfaces.templates.<%= file.path.replace(file.base, '').replace('.html', '') %> = '<%= contents %>'"))
  .pipe(rename({extname: '.js'}))
  .pipe(gulp.dest('./src/templates'))

gulp.task "clean", ->
  gulp.src(['./lib/*', './tmp/*', './src/templates/*'], {read: false})
    .pipe(clean())

gulp.task "specs:compile", ->
  gulp.src("./spec/src/**/*.coffee")
    .pipe(coffee({bare: true}))
    .pipe(concat('specs.js'))
    .pipe(gulp.dest("./spec"))