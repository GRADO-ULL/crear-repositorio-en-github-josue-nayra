const fs = require('fs-extra');
const path = require('path');

const github = require('octonode');
const inquirer = require('inquirer');


//----------------------------------------------------------------------------------------------------
// Función para la creación de un token.

var schema = [
    {
        name: "name",
        message: "Github Username:"
    },    
    {
        name: "password",
        message: "Github password:",
        type: "password"
    },
    {
        name: "descripcion",
        message: "Enter the description for your token:",
        default: "Token para Gitbook"
    }
];

var crear_token = (() =>
{
    return new Promise((resolve,reject) =>
    {
        inquirer.prompt(schema).then((result) =>
        {
          github.auth.config({ username: result.name, password: result.password }).login({
              scopes: ['user', 'repo'],
              note: result.descripcion
            }, (err, id, token) => {
              if (err) throw err;
            //   console.log(err)
            //   console.log(id)
            //   console.log(token) // Ahora si tenemos el token de github!!
              resolve(token);
            });              
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
            console.log("Autenticación. Introduzca su usuario y password de GitHub:");
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

exports.login = login;
exports.crear_token = crear_token;