const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const basePath = process.cwd();
const myArgs = require('minimist')(process.argv.slice(2));

const gitconfig = require('git-config');
const github = require('octonode');
const pkj = require(path.join(basePath,'package.json'));
const git = require('simple-git');

var directorio;
var autor;
var url_repo;
var nombre_gitbook;
var url_wiki;
var url_bugs;

// console.log("File src/creacion_gitbook.js");

var crear_gitbook = (() => {
        gitconfig(function(err,config){
            if(err) console.error(err);
    
            autor = myArgs.autor || config.user.name || "Usuario"; 
            directorio = myArgs.d || myArgs.dir || myArgs.name || 'Milibro';
            nombre_gitbook = myArgs.name || myArgs.d || myArgs.autor || "Milibro";
            directorio = directorio.toLowerCase();
            nombre_gitbook = nombre_gitbook.toLowerCase();
            
            if(myArgs.url)
            {
                url_repo = myArgs.url;
                url_wiki = myArgs.url.split(".git")[0].concat('.wiki.git');
                url_bugs = myArgs.url.split(".git")[0].concat('/issues');
                // console.log("Split:"+url_wiki);
            }
            else
            {
                //Aqui podriamos crear un repo a través de la api de github
                url_repo = " ";
                url_wiki = " ";
                url_bugs = " ";
            }
            
            fs.mkdirp(path.join(basePath, directorio), function(err){
                if(err){
                    console.error(err);
                }
                else{
                  
                  fs.copy(path.join(__dirname,'../template','.npmignore'), path.join(basePath, directorio , '.gitignore'), function(err){
                      if(err) console.log("Error creando .gitignore:"+err);
                  });
            
                  fs.copy(path.join(__dirname,'../template','app.js'), path.join(basePath, directorio , 'app.js'));

                  fs.copy(path.join(__dirname,'../template','gulpfile.js'), path.join(basePath, directorio , 'gulpfile.js'));
            
                  fs.copy(path.join(__dirname,'../template','README.md'), path.join(basePath, directorio , 'README.md'));   
            
                  fs.copy(path.join(__dirname, '../template', 'VERSION'), path.join(basePath, directorio , 'VERSION'));   
                   
                  fs.mkdirp(path.join(basePath, directorio , 'scripts'), function (err) {
                      if (err) {
                        console.error(err);
                      }
                  });
                   
                    fs.copy(path.join(__dirname, '../template', 'scripts') , path.join(basePath, directorio ,'scripts'), function(err){
                        if(err) return console.error(err)
                    });  
                   
                  fs.mkdirp(path.join(basePath, directorio , '/txt'), function (err) {
                      if (err) {
                        console.error(err);
                      }
                      else {
            
                        fs.copy(path.join(__dirname, '../template', 'txt' , 'SUMMARY.md'), path.join(basePath, directorio , 'txt', 'SUMMARY.md'));
            
                        fs.copy(path.join(__dirname,'../template', 'txt', 'section1'), path.join(basePath, directorio , 'txt', 'section1'), function(err){
                            if(err) return console.error(err)
            
                        });   
                        
                        ejs.renderFile(path.join(__dirname, '../template', 'txt', 'README.ejs'), { name_gitbook: nombre_gitbook}, function(err,str) {
                          if(err) {
                              console.error(err);
                              throw err;
                          }
                          else {
                              if(str) {
            
                                  //Creamos y escribimos en el fichero README.md
                                  fs.writeFile(path.join(basePath, directorio ,'txt', 'README.md'), str);
                              }
                          }
                        });
            
                      }
                    });
                }
            });
            
            // Construyendo "package.json"
            
            ejs.renderFile(path.join(__dirname, '../template', 'package.ejs'), { autor: autor , name_gitbook: nombre_gitbook, url: url_repo, url_bugs: url_bugs, url_wiki: url_wiki}, function(err,str){
                if(err) {
                    console.error("ERROR:"+err);
                }
                if(str) {
                    
                    fs.writeFile(path.join(basePath, directorio , 'package.json'), str);
                }
                
            });
            
            // Construyendo "book.json"
            
            ejs.renderFile(path.join(__dirname, '../template', 'book.ejs'), { name_gitbook: nombre_gitbook}, function(err,str){
                if(err) {
                    console.error("ERROR:"+err);
                }
                if(str) {
            
                    fs.writeFile(path.join(basePath, directorio , 'book.json'), str);
            
                }
                
        });
    });

    console.log("Gitbook built!");
    
});

var crear_repo =(() =>
{
    const config = require(path.join(basePath,'.gitbook-start','config.json'));
    const client = github.client(config.token); //Obtengo el token
    const ghme = client.me();

    //Creando repositorio
    ghme.repo({
       "name": pkj.name,
       "description": pkj.description
    },(error, stdout, stderr) => {
        if(error) throw error;
        console.log("Creando repositorio con el nombre:"+pkj.name);
        console.log("Url repo:"+stdout.clone_url);
        git(path.join(basePath, myArgs.d))
          .init()
           .add('./*')
           .commit("first commit!")
           .addRemote('origin', stdout.clone_url)
    });
});

exports.crear_repo = crear_repo;
exports.crear_gitbook = crear_gitbook;