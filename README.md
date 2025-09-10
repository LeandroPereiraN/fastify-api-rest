# Fastify API Rest - Grupo 02  

## Integrantes  
- Leandro Pereira
- Mauricio Segovia 
- Alejandro Hernandez

## Instalación de Dependencias  
1. Primero necesitamos tener **Node.js** para **windows** usando **volta** y **npm** instalado.  
2. despues de clonar el repo , hacemos **npm install** (esto instalará todas las dependencias necesarias)

## Levantar la base de datos de PostgreSQL con Docker
Necesitamos tener Docker instalado. Después, se debe ejecutar el comando **docker compose up** en la raíz del proyecto.
Esto iniciará la base de datos en el host y el puerto especificados en el **.env**

## Levantar el proyecto
Para levantar el proyecto debemos ejecutar el comando **npm run dev** en la raíz del proyecto.

## Resumenes de cosas echas
- Alejandro:
<details>
  <summary>Ver más info</summary>
  
  Use la documentacion de node / node-postgres y/e ejemplos dados por el mismo

  Sitios: 
  - https://node-postgres.com/
  - https://node-postgres.com/guides/project-structure
  - https://node-postgres.com/apis/ (casi todos los conceptos, no de memoria)
  - https://node-postgres.com/apis/pool#new-pool
  
  ### Explicacion de lo que hice:
    Descargar e instalar la dependencia de pg de node (use el comando dado por la pagina).
    
    Lo primero fue hacer un archivo que maneje las conexiones de la base de datos, en este caso fue db.ts (database.ts por que suena mejor en ingles).
    ahi lo que hice fue exportar una metodo { query } que es una pool y al exportarla hace que pueda ejecutar consultas, esta decision fue, por que si llegara a ser client solo manejaria una conexion a la vez,entonces la herramienta que proporciona pg es pg.pool .
    
    Que tiene la capacidad de manejar multiples conexiones casi al mismo tiempo (milisegundos de diferencia) asi las consultas no se interfieren.
  
  Como init.sql ya trae las tablas (User.ts lo transforma en tipos) fue usar los metodos proporcionados en la consigna para el codigo, la mayoria de cambios ocurren en user-repository.ts que en vez de usar los usuarios hardcodeados (antes) ahora se implementaron metodos para consumir la base de datos de forma async 
  Esto nos permitiria la conexion directa

  lo ideal es que termine siendo modular la estructura.
  de DB a Repository a auth pase a rutas y ahi al server.

  Los query son basado en los dados en clase:
  - getUsers
  - getUserByid
  - getUserByname - se usa like y % para la busqueda parcial
  - getUserByusername
  - getcredentialbyuserid - obtendria el hash de constraseña para login
  
</details>

- Errores o dificultades:
<details>
  <summary>Ver más info</summary>

  Se corrigió:
  - Uso de async/await para no devolver promesas sin resolver.

  La mayoria de errores fueron con Typescript, que no reconocia los metodos o que se "olvida de los imports".
  Lo que mas dificulto fue el echo de hacer algo totalmente nuevo, como es la conexion de la base de datos con node 
  y el entender que hizo cada compañero

</details>

- Leandro:
<details>
  <summary>Ver más info</summary>

  Generé la base del proyecto e implementé JWT con la autenticación por roles.
</details>

- Errores o dificultades:
<details>
  <summary>Ver más info</summary>

  El Typescript anda cuando quiere.
  En ocasiones da error el proyecto, al eliminar el los registers del **server.ts** y volverlos a poner funciona nuevamente.
</details>

- Mauricio:
<details>
  <summary>Ver más info</summary>

  Aquí va la explicacion
</details>

- Errores o dificultades:
<details>
  <summary>Ver más info</summary>

  Aquí va la explicacion
</details>