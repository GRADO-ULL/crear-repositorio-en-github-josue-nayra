#!/usr/bin/env node
"use strict"

const path = require('path');
const basePath = process.cwd();
const myArgs = require('minimist')(process.argv.slice(2));
const creacion = require(path.join(__dirname,'../src/creacion_gitbook.js'));
const json = require(path.join(__dirname,'../package.json'));
const fs = require('fs-extra');

if(myArgs.h || myArgs.help)
{
    console.log("Seccion de ayuda.");
    console.log("Comando: gitbook-start [options]");
    console.log("Opciones disponibles:");
    console.log("\t"+"-d <directorio en el que se desplegara el gitbook>");
    console.log("\t"+"--autor <autor del gitbook>");
    console.log("\t"+"--name <nombre del gitbook>");
    console.log("\t"+"--url <url del repositorio>");
    console.log("\t"+"--version");
    console.log("\t"+"--deploy");
}
else
{
    if(myArgs.v || myArgs.version)
    {
        console.log("Version:"+json.version);
    }
    else
    {
        if(myArgs.deploy)
        {
            // creacion.crear_repo();

            const packagejson = require(path.join(basePath, 'package.json'));
            console.log("Desplegando en... "+myArgs.deploy);
            var dependencias = packagejson.dependencies;

            try {
                for (var d in dependencias){
                    if(d.search(myArgs.deploy) != -1){
                        
                        require(path.join(basePath,'node_modules',d)).initialize(myArgs.IP,myArgs.path,packagejson.repository.url,myArgs.usuarioremoto);
                        break;
                        
                    }

                }
            } catch(e){
                console.log("No se ha encontrado el plugin. Error: "+ e);
            }
        }
        else
        {
            creacion.crear_gitbook();   
        }
    }
}
