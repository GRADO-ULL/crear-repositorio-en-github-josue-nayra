const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const basePath = process.cwd();
const myArgs = require('minimist')(process.argv.slice(2));

const gitconfig = require('git-config');
const github = require('octonode');
const git = require('simple-git');
const prompt = require('prompt');

// console.log("File src/creacion_gitbook.js");


//----------------------------------------------------------------------------------------------------
// Función para la asignación de variables

var asignacion_variables = (() =>
{
    return new Promise((result, reject) =>
    {
        gitconfig(function(err,config){
            if(err) console.error(err);
            
            var directorio;
            var autor;
            var url_repo;
            var nombre_gitbook;
            var url_wiki;
            var url_bugs;
            
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
                result({ autor: autor, directorio: directorio, nombre_gitbook: nombre_gitbook, url_repo: url_repo, url_wiki: url_wiki, url_bugs: url_bugs});
            }
            else
            {
                //Aqui podriamos crear un repo a través de la api de github
                crear_repo().then((resolve,reject) =>
                {
                    url_repo = resolve;
                    url_wiki = resolve.split(".git")[0].concat('.wiki.git');
                    url_bugs = resolve.split(".git")[0].concat('/issues');
                    result({ autor: autor, directorio: directorio, nombre_gitbook: nombre_gitbook, url_repo: url_repo, url_wiki: url_wiki, url_bugs: url_bugs});
                });
            }
        });
    });
});

//----------------------------------------------------------------------------------------------------

var crear_estructura = ((datos) =>
{
    return new Promise((result,reject) => 
    {
        fs.mkdirp(path.join(basePath, datos.directorio), function(err){
            if(err){
                console.error(err);
            }
            else{
                fs.copy(path.join(__dirname,'../template','.npmignore'), path.join(basePath, datos.directorio , '.gitignore'), function(err){
                    if(err) console.log("Error creando .gitignore:"+err);
                });
                
                fs.copy(path.join(__dirname,'../template','app.js'), path.join(basePath, datos.directorio , 'app.js'));
    
                fs.copy(path.join(__dirname,'../template','gulpfile.js'), path.join(basePath, datos.directorio , 'gulpfile.js'));
                
                fs.copy(path.join(__dirname,'../template','README.md'), path.join(basePath, datos.directorio , 'README.md'));   
                
                fs.copy(path.join(__dirname, '../template', 'VERSION'), path.join(basePath, datos.directorio , 'VERSION'));   
                       
                fs.mkdirp(path.join(basePath, datos.directorio , 'scripts'), function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
                      
                fs.copy(path.join(__dirname, '../template', 'scripts') , path.join(basePath, datos.directorio ,'scripts'), function(err){
                    if(err) return console.error(err)
                });  
                       
                fs.mkdirp(path.join(basePath, datos.directorio , '/txt'), function (err) {
                    if (err) {
                        console.error(err);
                    }
                    else {
                
                        fs.copy(path.join(__dirname, '../template', 'txt' , 'SUMMARY.md'), path.join(basePath, datos.directorio , 'txt', 'SUMMARY.md'));
                
                        fs.copy(path.join(__dirname,'../template', 'txt', 'section1'), path.join(basePath, datos.directorio , 'txt', 'section1'), function(err){
                            if(err) return console.error(err)
                        });   
                            
                        ejs.renderFile(path.join(__dirname, '../template', 'txt', 'README.ejs'), { name_gitbook: datos.nombre_gitbook}, function(err,str) {
                            if(err) {
                                console.error(err);
                                throw err;
                            }
                            else {
                                if(str) {
                                    //Creamos y escribimos en el fichero README.md
                                    fs.writeFile(path.join(basePath, datos.directorio ,'txt', 'README.md'), str);
                                }
                            }
                        });
                
                    }
                });
            }
        });
        
        // Construyendo "package.json"
        ejs.renderFile(path.join(__dirname, '../template', 'package.ejs'), { autor: datos.autor , name_gitbook: datos.nombre_gitbook, url: datos.url_repo, url_bugs: datos.url_bugs, url_wiki: datos.url_wiki}, function(err,str){
            if(err) {
                console.error("ERROR:"+err);
            }
            if(str) {
                fs.writeFile(path.join(basePath, datos.directorio , 'package.json'), str);
            }
        });
                
        // Construyendo "book.json"
        ejs.renderFile(path.join(__dirname, '../template', 'book.ejs'), { name_gitbook: datos.nombre_gitbook}, function(err,str){
            if(err) {
                console.error("ERROR:"+err);
            }
            if(str) {
                fs.writeFile(path.join(basePath, datos.directorio , 'book.json'), str);
            }
        });    
        result(datos);
    });
});

//----------------------------------------------------------------------------------------------------
// Asignación del repositorio remoto en el directorio del libro. 

var asignar_remoto = ((datos) =>
{
    console.log("Datos1:"+JSON.stringify(datos));
    
    return new Promise((resolve,reject) =>
    {
       //Añadimos remoto correspondiente
        git(path.join(basePath,myArgs.d))
          .init()
          .add('./*')
          .commit("first commit!")
          .addRemote('origin', datos.url_repo) 
    });
});

//----------------------------------------------------------------------------------------------------
// Función para la creación de un libro

var crear_gitbook = (() => {
    asignacion_variables().then((resolve,reject) =>
    {
    //   console.log("Variables:"+JSON.stringify(resolve)); 
       var  datos = resolve;
       crear_estructura(datos).then((resolve,reject) =>
       {
           asignar_remoto(datos).then(() =>
           {
             console.log("Gitbook built!");  
           });
       });
    });
});

//----------------------------------------------------------------------------------------------------
// Función para la creación de un token.

var schema = {
    properties: {
        name: {
            required: true
        },
        password: {
            hidden: true
        }
    }
};

var crear_token = (() =>
{
    return new Promise((resolve,reject) =>
    {
        prompt.start();
        
        prompt.get(schema, (err, result) =>
        {
           if(err) throw err;
           
          github.auth.config({ username: result.name, password: result.password }).login({
              scopes: ['user', 'repo'],
              note: 'Token para Gitbook'
            }, (err, id, token) => {
              if (err) return reject(err)
            //   console.log(err)
            //   console.log(id)
            //   console.log(token) // Ahora si tenemos el token de github!!
              resolve(token);
            })        
        });
    });
});

//----------------------------------------------------------------------------------------------------
// Función para el login

var login = (() =>
{
   return new Promise((result,reject) =>
   {
        if(fs.existsSync(path.join(process.env.HOME,'.gitbook-start','config.json')))
        {
            fs.readFile(path.join(process.env.HOME,'.gitbook-start','config.json'), (err, data) =>
            {
                if(err)
                {
                    throw err;
                }
                else
                {
                    if(JSON.parse(data).token)
                    {
                        console.log("Autenticación ya realizada previamente.");
                        var datos = JSON.parse(data);
                        // console.log("Token si existe config.json:"+datos.token);
                        result(datos.token);   
                    }
                }
            });
        }
        else
        {
            console.log("Autenticación:");
            crear_token().then((resolve,reject) =>
            {
                // console.log("TOKEEEEENNNN:"+resolve);
                if(!fs.existsSync(path.join(process.env.HOME,'.gitbook-start')))
                {
                    fs.mkdirp(path.join(process.env.HOME,'.gitbook-start'),(err) =>
                    {
                        if(err) throw err;
                    });
                }
                
                var config = `{ "token": "${resolve}" }`;
                
                fs.writeFile(path.join(process.env.HOME,'.gitbook-start','config.json'), config, (err) =>
                {
                  if(err) throw err;
                  result(resolve);
                });
            });
        }
   });
});

//----------------------------------------------------------------------------------------------------
// Función para la creación del repositorio

var crear_repo =(() =>
{
    return new Promise((result, reject) =>
    {
        login().then((resolve, reject) => 
        {
            // console.log("Resolve login:"+resolve);
            const client = github.client(resolve); //Obtengo el token
            const ghme = client.me();
            // const pkj = require(path.join(basePath,'package.json'));
        
            //Creando repositorio
            ghme.repo({
               "name": myArgs.d,
               "description": "Gitbook"
            },(error, stdout, stderr) => {
                if(error) throw error;
                console.log("Creando repositorio con el nombre:"+myArgs.d);
                console.log("Url repo:"+stdout.clone_url);
                  
                result(stdout.clone_url);  
            });  
        });
    });
});

//----------------------------------------------------------------------------------------------------

exports.crear_repo = crear_repo;
exports.crear_gitbook = crear_gitbook;