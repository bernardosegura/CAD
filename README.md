# <img src="https://github.com/bernardosegura/CAD/blob/master/icon.svg" alt="Logo Docker" style="width: 40px; height: 40px;" /> Consola de Administración para Docker

Este proyecto surge de la necesidad de simplificar la gestión de contenedores Docker y sus imágenes, sin incurrir en complicados procesos burocráticos que a menudo obstaculizan el control de los servidores en las organizaciones. Solo se requiere proporcionar un usuario con permisos de administración de Docker para ejecutar la aplicación y permitir una administración remota. Esto es útil tanto para entornos locales de desarrollo como para ambientes de desarrollo y pruebas.

Es importante tener en cuenta que esta herramienta no se recomienda para entornos productivos, ya que está diseñada exclusivamente como un soporte para el desarrollo de aplicaciones Docker. Para ambientes productivos, existen numerosas herramientas especializadas que abordan aspectos que esta herramienta no cubre.

Confio en que esta herramienta sea de gran utilidad y que pueda maximizar su potencial.

# Ejecucion Binaria
Se puede ejecutar mediante el [binario](https://github.com/bernardosegura/CAD/releases/tag/v0.1-Beta) ya compilado y listo para usar tanto en Windows 💻 y Linux 🐧.

💻 __Windows__
```cmd
C:\Users\usuario\CAD>cad.exe [puerto de escucha http, si se omite por default es 3000] 
```
🐧 __Linux__
```bash
usuario@equipo:~/CAD$cad [puerto de escucha http, si se omite por default es 3000] 
```

# Ejecución de código fuente

💻 __Windows__
```cmd
C:\Users\usuario\CAD>npm install 
C:\Users\usuario\CAD>node app.js [puerto de escucha http, si se omite por default es 3000] 
```
🐧 __Linux__
```bash
usuario@equipo:~/CAD$npm install
usuario@equipo:~/CAD$node app.js [puerto de escucha http, si se omite por default es 3000] 
```
