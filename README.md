# Práctica 6. Sistemas y Tecnologías Web

## Nueva funcionalidad para el paquete NPM: plugins (IAAS, API de Heroku y API de Github)

El objetivo de esta práctica es extender el package NodeJS desarrollado en la [pŕactica 4](https://github.com/ULL-ESIT-SYTW-1617/nueva-funcionalidad-para-el-paquete-npm-plugins-josue-nayra.git), publicado en npm con una nueva funcionalidad que permita que los usuarios con conocimientos de NodeJS puedan extender la conducta del ejecutable para que este realice el despliegue en plataformas distintas de las ya consideradas.
Además, la creación del repositorio en el que se alojará el gitbook se procurará de forma automática a través de la API de Github.

En esta práctica sólo se pide desarrollar el plugin para iaas.ull.es

[Plugin: gitbook-start-iaas-ull-es-josue-nayra](https://github.com/ULL-ESIT-SYTW-1617/gitbook-start-iaas-ull-es-josue-nayra)

[Plugin: gitbook-start-heroku-josue-nayra](https://github.com/ULL-ESIT-SYTW-1617/gitbook-start-heroku-josue-nayra)


### Aspectos a tener en cuenta:

El paquete principal **gitbook-start-josue-nayra** ha sido modificado para prácticas posteriores por lo se ha sobreescrito y puede tener comportamientos diferentes.

Al ejecutar el comando **gitbook-start -d <directorio> ...** sin introducir la opción de **-u <url>** se mostrará el prompt y pedirá las credenciales del usuario para la creación de un nuevo repositorio.




### Pasos a seguir para la utilización de los plugins

1- Descargar el paquete inicial: **gitbook-start**
    
```bash
$ npm install -g gitbook-start-josue-nayra 
```

2- Crear el libro mediante el comando:
    
```bash
$ gitbook-start -d <directorio> --autor <autor> --name <nombre_libro> --url <url_repo>
```
    
Opciones disponibles para la creación del libro:
    
    -d o --directorio <directorio en el que se desplegará el libro>
    
    --autor <autor del libro>
    
    --name  <nombre del libro>
    
    --url <url del repositorio en github>

    --help 
    
    --version

Se construye así la estructura inicial por **gitbook-start**, es decir, la jerarquía de directorios conteniendo los scripts y ficheros markdown para el libro.


3- Colocarse en la carpeta que contiene el libro.

```bash
$ cd <directorio en el que se ha desplegado el libro>
```

4- Instalar las dependencias necesarias mediante el comando:
    
```bash
$ npm install 
```

5- Instalar los plugins requeridos como dependendecias con la opción --save, como por ejemplo: **gitbook-start-iaas-ull-es-josue-nayra** o **gitbook-start-heroku-josue-nayra**, para el despliegue en iaas y heroku respectivamente.
    
```bash
$ npm install --save gitbook-start-iaas-ull-es-josue-nayra 
```

```bash
$ npm install --save gitbook-start-heroku-josue-nayra
```

6- Para la actualización de nuestro repositorio podemos ejecutar una de las tareas descritas en el gulpfile: **gulp push --mensaje <mensaje commit>**.


7- Generamos token. Para ello accedemos a los settings de nuestra cuenta personal en Github, hacemos click en "Personal access token" y finalmente generamos un nuevo token.

[Setting de nuestra cuenta en Github](https://github.com/settings/tokens)

8- Una vez generado, lo copiamos y lo añadimos al fichero config.json en el directorio oculto .gitbook-start:

**Fichero config.json:**

```json
{
    "token": "<token generado>"
}
```

9- Ejecutar la opción --deploy especificando la máquina remota dónde queremos hacer el despliegue:
   
```bash
$ gitbook-start --deploy [iaas-ull-es|heroku] [Opciones]
```

Además de llamar a los métodos initialize() de cada plugin de despliegue, se nos ha creado un **nuevo repositorio** que contendrá nuestro Gitbook
a través de Github. Si ejecutamos el comando *$ git remote -v* podremos observar que se ha añadido un nuevo repositorio remoto "origin".

Para conocer mejor las opciones disponibles para cada plugin de despliegue podemos acceder a los paquetes publicados en npm
para despliegues en iaas-ull-es o en Heroku. Los enlaces podemos encontrarlo en las siguientes secciones.



10- Una vez ejecutado el comando anterior, se generará automáticamente en el gulpfile.js una tarea llamada 
"deploy-<máquina en la que realizar el despliegue>" que permitirá al usuario actualizar el contenido de dicha máquina.

```javascript
gulp.task("deploy-<máquina en la que realizar el despliegue>", function(){
    require(path.join(basePath, 'node_modules','<plugin de depliegue>')).deploy(...);
});
```


### Tareas Gulp


* **push**

Tarea habilitada para que el usuario pueda actualizar el repositorio que contiene el gitbook. Está disponible una opción --mensaje para especificar el mensaje del commit.

```bash
$ gulp push --mensaje <mensaje del commit>
```

* **instalar_recursos**

Tarea que permite al usuario instalar plugins y dependencias necesarias para su gitbook.

```bash
& gulp instalar_recursos
```

* **deploy**

Tarea deploy genérica que actualiza las gh-pages del gitbook.
```
$ gulp deploy
```

* **deploy --iaas**

Tarea generada posteriormente a la realización y ejecución del comando gitbook-start --deploy, que permite al usuario realizar posteriores despliegues y actualizaciones de su gitbook en la máquina remota con gulp.
Por ejemplo, en el caso de que el usuario despliegue en el IAAS, después de haber desplegado con la opción gitbook-start --deploy iaas-ull-es, en el gulpfile se generará una tarea
con el nombre deploy-iaas-ull-es.

```
$ gulp deploy-<máquina en la se ha desplegado previamente>
```


### Enlaces

- [Campus virtual](https://campusvirtual.ull.es/1617/course/view.php?id=1175)

- [Descripción de la práctica](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/practicas/practicagithubapi.html)

- [Publicación del paquete gitbook-start-josue-nayra](https://www.npmjs.com/package/gitbook-start-josue-nayra)

- [Plugin para el despliegue en IAAS](https://www.npmjs.com/package/gitbook-start-iaas-ull-es-josue-nayra)

- [Plugin para el despliegue con Heroku](https://www.npmjs.com/package/gitbook-start-heroku-josue-nayra)

- [Repositorio del plugin Heroku](https://github.com/ULL-ESIT-SYTW-1617/gitbook-start-heroku-josue-nayra/) 

- [Repositorio del plugin IAAS](https://github.com/ULL-ESIT-SYTW-1617/gitbook-start-iaas-ull-es-josue-nayra) 




### Referencias

- [Tutorial para publicar paquetes nodejs](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/nodejspackages.html)

- [Gulp](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/gulp/)

- [Uso de templates](https://www.npmjs.com/package/ejs)

- [Fyle System de Nodejs para el manejo de archivos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/fs.html)

- [Construyendo package.json](https://docs.npmjs.com/files/package.json)



### Integrantes

- Josué Toledo Castro
    [Github personal](www.github.com/JosueTC94)
- María Nayra Rodríguez Pérez
    [Github personal](www.github.com/alu0100406122)