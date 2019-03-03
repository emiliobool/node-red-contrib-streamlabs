const { watch, src, dest, parallel, series } = require("gulp")
// const inject = require('gulp-inject-string')
const ts = require("gulp-typescript")
const del = require('del');

const tsProject = ts.createProject('./tsconfig.json')

const htmlTask = parallel([ 
    () => src("src/*.html")
        .pipe(dest("lib")),
    () => src('./src/icons/**')
        .pipe(dest('./lib/icons'))
])

function jsTask(){
    return src("src/*.ts")
        .pipe(tsProject())
        .pipe(dest("lib"))
}

const buildTask = series(cleanTask, parallel([htmlTask, jsTask]))

function watchTask(){
    return watch(["src/*.html", "src/*.ts"], buildTask)
}

function cleanTask(){
    return del(["lib/**"])
}

exports.html = htmlTask
exports.js = jsTask
exports.build = buildTask
exports.clean = cleanTask
exports.watch = watchTask
exports.default = buildTask