# Respuestas de la Práctica 10

## 1. ¿Por qué el filtro atrapa la clase base y no cada error por separado?
Porque `@Catch(ErrorDeDominio)` atrapa esa clase y **todas sus hijas**,
incluidas las que todavía no se han escrito.

Si el filtro listara los cuatro errores uno por uno, cada regla nueva
del gimnasio obligaría a volver a tocarlo. Y el día que alguien lo
olvidara, ese error no caería en ningún lado: saldría como 500 sin que
nadie lo notara hasta producción.


## 2. ¿Por qué este middleware no podría decidir si un usuario tiene permiso para una ruta?
Porque corre demasiado pronto. Un middleware se ejecuta antes de que
Nest resuelva qué controlador y qué método van a atender la petición.

Lo único que tiene en las manos es `req`: la URL, el método y los
encabezados. No sabe si `/inscripciones` va a caer en `listar()` o en
`crear()`, ni puede leer los decoradores de ese método, porque todavía
no hay método.


## 3. ¿Por qué la petición que responde 409 no aparece en ese registro?
Porque el `LoggingInterceptor` escribe dentro de un `tap()`, y `tap()`
solo corre cuando el observable **emite un valor**. Si el controlador
lanza un error, no emite nada: el observable termina en error y el flujo
se va directo al filtro, saltándose el `tap`.

Las dos inscripciones que salieron bien están en `[HTTP]`. La tercera,
la del cupo lleno, no aparece ahí: aparece en `[Dominio]`, que es el
logger del filtro.

Entre las dos etiquetas no se pierde ninguna petición, pero si uno
leyera solo `[HTTP]` creería que la API nunca falla. Para que el
interceptor también viera los errores habría que agregarle un
`catchError` junto al `tap`.


## 4. ¿Por qué este cambio rompe a cualquier cliente que ya estuviera usando la API?
Porque cambia la **forma** de todas las respuestas exitosas, no su
contenido.

Antes `GET /clases` devolvía un arreglo:

    [{"id":1,"nombre":"Yoga"}]

Ahora devuelve un objeto con el arreglo adentro:

    {"data":[{"id":1,"nombre":"Yoga"}],
     "meta":{"ruta":"/clases","duracionMs":0,"timestamp":"..."}}

Todo cliente que hacía `res[0].nombre` o `res.map(...)` deja de
funcionar, porque `res` ya no es un arreglo. Y falla de la peor manera:
no da error de red ni código distinto. Sigue siendo un **200**, con un
cuerpo que simplemente no tiene la forma esperada. El cliente truena más
adelante, con un `undefined`, lejos del lugar real del problema.

Por eso se decide ahora, antes de que el React de la Unidad III empiece
a consumirla. Un cambio así después tendría que hacerse por versiones
(`/v1` y `/v2`), manteniendo las dos vivas mientras los clientes migran.

## 5. Si el servidor respondió en los dos casos, ¿quién bloquea y a quién protege?
Bloquea el **navegador**. Protege al **usuario**, no al servidor.

CORS no es un candado: es una instrucción que el servidor manda y que el
navegador obedece. Cuando la cabecera no viene, el navegador recibe la
respuesta entera y la tira antes de que el JavaScript de la página la
pueda leer.

Por eso protege al usuario. Todo lo que no sea un navegador ignora CORS:
curl leyó el cuerpo desde el origen no autorizado sin ningún problema.
Lo que CORS evita es que una página maliciosa en otra pestaña llame a
esta API con tu sesión y lea lo que devuelve. La víctima serías tú.
Proteger la API es otro tema, y se llama autenticación.


# Respuestas de la Práctica 10 · Parte 2

## 1. ¿Por qué el campo se llama passwordHash y no password?
Porque el nombre es la única defensa que funciona cuando alguien va con
prisa.

Con un campo llamado `password`, escribir `password: dto.password` se ve
natural y guarda la contraseña en claro sin que nada se queje. Con
`passwordHash`, esa misma línea se lee mal de inmediato: el nombre dice
que ahí va un hash, no un texto.

No es documentación, es prevención. El compilador no distingue un hash
de una contraseña, los dos son `string`. El nombre sí.

Y hay una razón práctica más: `bcrypt.compare()` nunca "descifra" nada.
Vuelve a calcular el hash de lo que llegó y lo compara con el guardado.
Nadie, ni siquiera el servidor, puede recuperar la contraseña original.


## 2. ¿Por qué los dos errores del inicio de sesión dicen exactamente lo mismo?
Para no revelar qué correos existen.

Si el correo inexistente dijera "ese usuario no existe" y la contraseña
mala dijera "contraseña incorrecta", cualquiera podría probar correos uno
por uno y armar la lista de las cuentas reales. Eso se llama enumeración
de usuarios, y convierte un ataque de fuerza bruta en algo mucho más
barato: ya no hay que adivinar dos cosas, solo una.

## 3. Si el contenido se puede leer, ¿qué es lo que protege la firma?
La firma no protege el **secreto** del contenido. Protege que no se
pueda **cambiar**.

Lo que la firma garantiza es que ese payload salió del servidor y nadie
lo tocó en el camino. Es el resultado de pasar header y payload por
HMAC-SHA256 con `JWT_SECRET`. Cambiar un solo carácter del payload
cambia la firma que debería tener, y el servidor lo detecta porque la
recalcula en cada petición.

## 4. ¿Por qué es más seguro proteger todo y abrir a mano, que al revés?
Por cómo falla cada opción cuando alguien se equivoca.

Si todo es público y se protege a mano, olvidar un `@UseGuards` deja una
ruta abierta. No hay error, no hay aviso, nada se ve distinto: la ruta
responde 200 como siempre. El hueco puede durar meses y lo encuentra
quien lo busca.

Si todo está protegido y se abre a mano, olvidar un `@Publico()` deja una
ruta cerrada. Eso responde 401 y se nota en el primer minuto de pruebas.
Alguien reclama y se arregla.

## 5. ¿Cuál es la diferencia entre un 401 y un 403?
**401 es "no sé quién eres".** Falta el token, viene vencido o la firma
no cuadra. El servidor no pudo identificarte. La salida es conseguir
credenciales válidas.

**403 es "sé quién eres, y aun así no puedes".** El token estaba perfecto
y el servidor te identificó. Lo que falla es el permiso. Volver a iniciar
sesión no cambia nada.

En la segunda, el servidor leyó el token, supo que era Karla y que es
miembro 1, y por eso mismo la detuvo. El admin, con el mismo cuerpo de
petición, sí pudo: 201.


## 8. ¿Por qué tomar al usuario de los claims del token y no de la URL o del cuerpo?
Porque la URL y el cuerpo los escribe el cliente, y el token lo firma el
servidor.

Si la API confiara en `GET /miembros/3/inscripciones`, cualquiera con una
cuenta cambiaría el 3 por el número que quisiera. Karla pediría
`/miembros/2/inscripciones` y leería las de Omar. No haría falta ningún
ataque: basta con editar la barra de direcciones. Ese agujero tiene
nombre, IDOR, y es de los más comunes que hay.
