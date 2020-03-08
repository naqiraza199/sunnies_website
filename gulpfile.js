// Load plugins
const browsersync = require("browser-sync").create();
const gulp = require("gulp");
var nunjucksRender = require("gulp-nunjucks-render");
var data = require("gulp-data");
var path = require("path");
var fs = require("fs");
var netlify = require("gulp-netlify");
var merge = require("gulp-merge-json");
var jsonConcat = require('gulp-json-concat');

var git = require("gulp-git");

const imagemin = require("gulp-imagemin");

var manageEnvironment = function (env) {
  env.addFilter("split", function (str, seperator) {
    return str.split(seperator);
  });
};

var findFiles = function (folder) {
  var posts = [];
  // var postsfolder = './posts';

  var files = fs.readdirSync(folder);

  files.forEach(file => {
    let fileStat = fs.statSync(folder + "/" + file).isDirectory();
    if (!fileStat) {
      if (file.includes("json")) {
        posts.push(JSON.parse(fs.readFileSync(folder + "/" + file)));
      }
    }
  });

  return posts;
};

gulp.task("render_content_dev", function (cb) {
  // Copy assets to dist folder
  gulp.src(["./assets/**/*"]).pipe(gulp.dest("./build/assets/"));
  gulp.src(["pages/**/*.yml"]).pipe(gulp.dest("./build/"));

  //Render nunjucks to html
  gulp
    .src("pages/**/*.+(html|njk)")
    // Adding data to Nunjucks

    .pipe(
      data(function () {
        var contents = {
          products: findFiles("./products"),
          lens: findFiles("./lens"),
          branches: findFiles("./branches"),
          events: findFiles("./events"),
          featured_products: findFiles("./featured_products"),
          blog: findFiles("./posts"),
          siteinfo: findFiles("./site"),
          staff: findFiles("./staff")
        };
        return contents;
      })
    )
    .pipe(
      nunjucksRender({
        path: ["templates/"], // String or Array
        data: {
          environment: "test",
          site_title: "Sunnies By Richie Dev",
          stripe_key: 'pk_test_ujOhdb12UPkmWbya4ghecbTW',
          functions_api: "http://localhost:9000/sheets",
          success_url: "http://localhost:3000/success.html",
          cancel_url: "http://localhost:3000/cart.html"
        },
        envOptions: {
          watch: false
        },
        manageEnv: manageEnvironment
      })
    )
    .pipe(gulp.dest("build"));
  cb();
});

gulp.task("render_content_prod", function (cb) {
  // Copy assets to dist folder
  gulp.src(["./assets/**/*"]).pipe(gulp.dest("./build/assets/"));
  gulp.src(["pages/**/*.yml"]).pipe(gulp.dest("./build/"));

  //Render nunjucks to html
  gulp
    .src("pages/**/*.+(html|njk)")
    // Adding data to Nunjucks

    .pipe(
      data(function () {
        var contents = {
          products: findFiles("./products"),
          lens: findFiles("./lens"),
          branches: findFiles("./branches"),
          events: findFiles("./events"),
          featured_products: findFiles("./featured_products"),
          blog: findFiles("./posts"),
          siteinfo: findFiles("./site"),
          staff: findFiles("./staff")
        };
        return contents;
      })
    )
    .pipe(
      nunjucksRender({
        path: ["templates/"], // String or Array
        data: {
          environment: "production",
          site_title: "Sunnies By Richie Prod",
          stripe_key: 'pk_live_6JxSfq1ltlJKfDJfMj2cTGNn00fmKxrq3i',
          functions_api: "/.netlify/functions/sheets",
          success_url: 'https://sunniesbyrichie.com/success.html',
          cancel_url: 'https://sunniesbyrichie.com/cart.html',
        },
        envOptions: {
          watch: false
        },
        manageEnv: manageEnvironment
      })
    )
    .pipe(gulp.dest("build"));
  cb();
});

gulp.task("render_images", function (cb) {
  gulp
    .src("./assets/images/**/*")
    .pipe(imagemin())
    .pipe(gulp.dest("build/assets/images"));
  cb();
});

// gulp.task("merge_json", function (cb) {
//   gulp.src('products/*.json')
//     .pipe(merge())
//     .pipe(gulp.dest('./dist'));
//   cb()
// })

gulp.task('merge_blog', function () {
  return gulp.src('posts/*.json')
    .pipe(jsonConcat('posts.json', function (data) {
      return new Buffer(JSON.stringify(data));
    }))
    .pipe(gulp.dest('assets/data'));
});

gulp.task('merge_products', function () {
  return gulp.src('products/*.json')
    .pipe(jsonConcat('products.json', function (data) {
      return new Buffer(JSON.stringify(data));
    }))
    .pipe(gulp.dest('assets/data'));
});

gulp.task('merge_lens', function () {
  return gulp.src('lens/*.json')
    .pipe(jsonConcat('lens.json', function (data) {
      return new Buffer(JSON.stringify(data));
    }))
    .pipe(gulp.dest('assets/data'));
});

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./build"
    }
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  // gulp.parallel("vendor");
  browsersync.reload();
  done();
}

// Watch files
function watchFiles(done) {
  gulp.watch("./posts/**/*", gulp.series("render_content_dev"));
  gulp.watch("./site/**/*", gulp.series("render_content_dev"));
  gulp.watch("./featured_products/**/*", gulp.series("render_content_dev"));
  gulp.watch("./branches/**/*", gulp.series("render_content_dev"));
  gulp.watch("./assets/**/*", gulp.series("render_content_dev"));
  gulp.watch("./templates/**/*", gulp.series("render_content_dev"));
  gulp.watch("./pages/**/*", gulp.series("render_content_dev"));
  gulp.watch("./build/*.html", browserSyncReload);
  done();
}

gulp.task("default", gulp.parallel("render_content_prod", "merge_products", "merge_lens", "merge_blog", "render_images"));

// dev task
gulp.task("dev", gulp.parallel("render_content_dev", "merge_products", "merge_lens", "merge_blog", watchFiles, browserSync));
