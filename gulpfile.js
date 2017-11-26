var gulp = require('gulp');
var pug = require('gulp-pug');

gulp.task('pug', () => {
    gulp.src(['**/*.pug', '!node_modules/**/*'])
        .pipe(pug())
        .pipe(gulp.dest('.'));
});