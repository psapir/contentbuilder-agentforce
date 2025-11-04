var gulp = require('gulp');

function movecss(done) {
 
  return  gulp.src("node_modules/@salesforce-ux/design-system/assets/**/*.*")
  .pipe(gulp.dest('dist/lib/salesforce-lightning-design-system'));
}

var build = gulp.series(movecss);
var test = gulp.series(movecss);

exports.test = test;
exports.default = build;
