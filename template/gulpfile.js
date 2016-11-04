var gulp = require('gulp');
var shell = require('gulp-shell');
var install = require('gulp-install');
var path = require('path');
var json = require(path.join(__dirname,'package.json'));
var git = require('simple-git');
var fs = require('fs-extra');
// var iaas = require('gitbook-start-iaas-ull-es-josue-nayra');

//------------------------------------------------------------------------------------
// Repositorio Github

gulp.task('push', function(){
    if (!fs.existsSync(path.join(__dirname, '.git'))){
      git()
        .init()
        .add('./*')
        .commit("first commit")
        .addRemote('origin', json.repository.url)
        .push('origin', 'master');
    }
    else
    {
       git()
        .add('./*')
        .commit("Actualizando Gitbook.")
        .push('origin', 'master');   
    }
});

//------------------------------------------------------------------------------------
// Instalar dependencias y recursos

gulp.task('instalar_recursos',['instalar_dependencias','instalar_plugins']);

gulp.task('instalar_dependencias', function()
{
    gulp.src(['./package.json']).pipe(install())
});

gulp.task('instalar_plugins', function()
{
    return gulp.src('').pipe(shell([
        'gitbook install'    
    ])) 
});

//------------------------------------------------------------------------------------
//Building and deploying Gitbook to gh-pages
//Build-gitbook
gulp.task('build', function()
{
    return gulp.src(path.join(__dirname,'scripts'))
       .pipe(shell(['./scripts/losh generate-gitbook']))
});

//Build-wiki
gulp.task('build_wiki', function()
{
    return gulp.src(path.join(__dirname,'scripts'))
            .pipe(shell(['./scripts/losh generate-wiki']))
});

// Build- All
gulp.task('build_all', ['build', 'build_wiki']);

// Generate-Gitbook

gulp.task('deploy', function(){
    return gulp.src(path.join(__dirname,'scripts'))
       .pipe(shell(['./scripts/losh deploy-gitbook']))
       .pipe(shell(['./scripts/losh deploy-wiki']));
});

//------------------------------------------------------------------------------------
//Default
gulp.task('default', ['build']);