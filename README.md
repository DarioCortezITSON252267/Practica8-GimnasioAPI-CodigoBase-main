# Respuestas de la Práctica 8

## 1. ¿Por qué el paquete del adaptador se llama adapter-mariadb si usamos MySQL?
Porque MariaDB nació como una division de MySQL y las dos hablan el
mismo protocolo por la red. Un cliente escrito para una entiende a la
otra.


## 2. ¿Editar schema.prisma cambió algo en la base de datos antes de migrar?
No, no cambio nada.

`schema.prisma` es un archivo de texto dentro del proyecto. Escribir
`model Clase` ahí no abre ninguna conexión ni ejecuta ningún SQL. Es
una declaración de intención: así quiero que se vea la base.


## 3. ¿La carpeta de migraciones es una foto del esquema o un historial?
Un historial.

Una foto sería un solo archivo que siempre dice cómo se ve la base hoy.
Eso ya existe y es `schema.prisma`.


## 4. ¿Por qué Horario.clase sí crea columna y Clase.horarios no?
Porque solo uno de los dos lados tiene algo que guardar.

En SQL, una relación de uno a muchos se guarda en el lado de "muchos",
con una columna que apunta al otro. Un horario pertenece a exactamente
una clase, así que en la fila del horario cabe un solo número:
`claseId`. Eso es una columna.

Una clase, en cambio, puede tener muchos horarios. En la fila de la
clase no cabría "los horarios 1, 4 y 7": una columna guarda un valor,
no una lista.


## 5. ¿De dónde sale la relación de muchos a muchos entre Miembro y Horario, si nunca se declaró?
Sale de `Inscripcion`, que es esa relación convertida en tabla.

Nunca se escribió un muchos a muchos. Lo que se escribieron fueron dos
relaciones de uno a muchos: un horario tiene muchas inscripciones, y un
miembro tiene muchas inscripciones. `Inscripcion` queda en medio, con
las dos columnas: `horarioId` y `miembroId`.

Eso es una tabla intermedia. En SQL un muchos a muchos no se puede
guardar de otra forma, porque no existe la columna capaz de guardar una
lista. Siempre hay una tercera tabla con las dos llaves.
