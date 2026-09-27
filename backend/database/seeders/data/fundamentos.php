<?php

/*
 * Cursos de fundamentos: programación, algoritmos y SQL.
 * Cada curso define módulos, lecciones (blocks + quiz).
 * Formato de blocks: ['h', texto] | ['p', texto] | ['code', lenguaje, texto] | ['list', [items]]
 */

return [
    // =====================================================================
    // 1. Introducción a la Programación
    // =====================================================================
    [
        'slug' => 'introduccion-programacion',
        'title' => 'Introducción a la Programación',
        'description' => 'Aprende los fundamentos absolutos de la programación. Sin experiencia previa requerida. Cubriremos variables, tipos de datos, estructuras de control y funciones básicas con ejemplos prácticos.',
        'category' => 'programacion-basica',
        'difficulty' => 'beginner',
        'duration_hours' => 12,
        'is_free' => true,
        'learning_path' => 'fundamentos-programacion',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'Variables y Tipos de Datos',
                'description' => 'Todo lo que necesitas saber sobre cómo almacenar información en un programa.',
                'lessons' => [
                    [
                        'slug' => 'que-es-una-variable',
                        'title' => '¿Qué es una variable?',
                        'type' => 'article',
                        'duration' => 10,
                        'preview' => true,
                        'blocks' => [
                            ['h', '¿Qué es una variable?'],
                            ['p', 'Una variable es un espacio en la memoria del ordenador que tiene un nombre y guarda un valor que puede cambiar durante la ejecución del programa. Piensa en ella como una caja etiquetada: la etiqueta es el nombre y el contenido es el dato.'],
                            ['p', 'Al crear una variable estás reservando memoria para guardar información. La ventaja de usar variables es que puedes reutilizar ese dato muchas veces sin repetirlo y puedes modificarlo cuando el programa lo necesite.'],
                            ['code', 'php', <<<'PHP'
<?php
// Declarar y asignar una variable
$nombre = "Ada";
$edad = 36;

// Usar la variable más tarde
echo "Hola, " . $nombre;
echo "Tienes " . $edad . " años.";
PHP],
                            ['h', 'Reglas para nombrar variables'],
                            ['p', 'Los nombres de variables deben ser descriptivos para que el código se lea como una frase. Un buen nombre explica qué contiene la variable sin necesidad de comentarios.'],
                            ['list', [
                                'Usa nombres descriptivos: $totalCarrito en vez de $x',
                                'Mantén un estilo consistente: camelCase o snake_case',
                                'Evita palabras reservadas del lenguaje',
                                'No uses nombres demasiado cortos ni ambiguos',
                            ]],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Una variable tiene nombre, tipo y valor',
                                'Se puede reasignar su valor durante la ejecución',
                                'Los nombres descriptivos mejoran la legibilidad',
                                'Cada lenguaje tiene su propia sintaxis para declararlas',
                            ]],
                            ['p', 'Saber declarar y usar variables es el primer paso para escribir cualquier programa. En la siguiente lección verás qué tipos de datos puedes guardar en ellas.'],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es una variable en programación?', 'type' => 'single', 'answers' => [
                                    ['Un espacio con nombre en memoria que guarda un valor', true, 'Exacto: la variable reserva memoria y asocia un nombre a un valor.'],
                                    ['Un tipo de dato que solo guarda números', false, 'No: las variables pueden guardar números, texto, booleanos y más.'],
                                    ['Una función que calcula resultados', false, 'Las funciones ejecutan código; las variables almacenan datos.'],
                                    ['Un archivo donde se guarda el programa', false, 'El archivo es código fuente; la variable vive en memoria al ejecutarse.'],
                                ]],
                                ['q' => '¿Por qué es importante elegir buenos nombres de variables?', 'type' => 'single', 'answers' => [
                                    ['Porque el código se lee como una frase y es más fácil de mantener', true, 'Los nombres descriptivos comunican la intención del código.'],
                                    ['Porque el programa corre más rápido', false, 'El rendimiento no depende del nombre de la variable.'],
                                    ['Porque es obligatorio en todos los lenguajes', false, 'Es una buena práctica, no una regla del lenguaje.'],
                                    ['Porque ocupa menos memoria', false, 'El nombre no afecta al consumo de memoria en ejecución.'],
                                ]],
                                ['q' => '¿Cuál de estas acciones es válida con una variable?', 'type' => 'single', 'answers' => [
                                    ['Cambiar su valor durante la ejecución', true, 'Esa es la característica principal de una variable: su valor puede variar.'],
                                    ['Eliminar un archivo del disco', false, 'Las variables no manipulan archivos directamente.'],
                                    ['Definir la estructura de una tabla de base de datos', false, 'Eso corresponde al modelo de datos, no a las variables.'],
                                    ['Crear una rama en Git', false, 'Git gestiona versiones del código; las variables son datos en memoria.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'tipos-de-datos-basicos',
                        'title' => 'Tipos de datos básicos',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Tipos de datos básicos'],
                            ['p', 'Los tipos de datos dicen qué clase de información guarda una variable y qué operaciones se pueden hacer con ella. Los más comunes son enteros, decimales, texto y booleanos.'],
                            ['p', 'Elegir el tipo correcto evita errores sutiles: sumar números no es lo mismo que concatenar texto, y comparar valores de tipos distintos suele dar resultados inesperados.'],
                            ['code', 'php', <<<'PHP'
<?php
$entero = 42;          // int
$precio = 19.99;       // float
$nombre = "Ada";       // string
$activo = true;        // bool

var_dump($entero, $precio, $nombre, $activo);
PHP],
                            ['h', 'Tipos más usados'],
                            ['list', [
                                'int: números enteros, como 42 o -7',
                                'float: números decimales, como 3.14',
                                'string: cadenas de texto, como "hola"',
                                'bool: verdadero o falso (true / false)',
                            ]],
                            ['p', 'Muchos lenguajes son de tipado fuerte y detectan errores al mezclar tipos; otros convierten automáticamente. Conocer el sistema de tipos de tu lenguaje te ahorra depuraciones largas.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El tipo define qué valores y operaciones son válidos',
                                'Texto y números se comportan de forma distinta',
                                'Los booleanos representan condiciones verdaderas o falsas',
                                'Cada lenguaje implementa los tipos con sus propias reglas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué tipo de dato usarías para guardar el precio de un producto?', 'type' => 'single', 'answers' => [
                                    ['float', true, 'Los precios suelen tener decimales y se guardan como float.'],
                                    ['int', false, 'int no admite decimales, perderías los céntimos.'],
                                    ['bool', false, 'bool solo guarda verdadero o falso.'],
                                    ['string', false, 'string es texto; operar con precios como texto es incorrecto.'],
                                ]],
                                ['q' => '¿Qué representa el tipo bool?', 'type' => 'single', 'answers' => [
                                    ['Un valor verdadero o falso', true, 'bool es el tipo lógico con dos estados posibles.'],
                                    ['Un número entero positivo', false, 'Eso es int.'],
                                    ['Una cadena de caracteres', false, 'Eso es string.'],
                                    ['Un array de datos', false, 'Un array es una colección, no un bool.'],
                                ]],
                                ['q' => '¿Por qué importa conocer el sistema de tipos de un lenguaje?', 'type' => 'single', 'answers' => [
                                    ['Porque evita errores al mezclar operaciones incompatibles', true, 'Entender los tipos te permite predecir el comportamiento del código.'],
                                    ['Porque todos los lenguajes se comportan igual', false, 'Cada lenguaje tiene reglas de conversión y tipado distintas.'],
                                    ['Porque los tipos no afectan al resultado final', false, 'Los tipos afectan directamente a los resultados.'],
                                    ['Porque solo sirve para entrevistas técnicas', false, 'Es una herramienta diaria para escribir código correcto.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'operadores-y-expresiones',
                        'title' => 'Operadores y expresiones',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Operadores y expresiones'],
                            ['p', 'Los operadores son símbolos que combinan valores para producir resultados nuevos. Una expresión es cualquier combinación de valores y operadores que se puede evaluar.'],
                            ['p', 'Existen operadores aritméticos para calcular, de comparación para decidir y lógicos para combinar condiciones. Dominarlos te permite expresar cualquier regla de negocio.'],
                            ['code', 'php', <<<'PHP'
<?php
$a = 10;
$b = 3;

echo $a + $b;    // 13 suma
echo $a % $b;    // 1 módulo (resto)
echo $a > $b;    // true comparación
echo ($a > 5) && ($b < 5); // true lógico
PHP],
                            ['h', 'Familias de operadores'],
                            ['list', [
                                'Aritméticos: +, -, *, /, %',
                                'Comparación: ==, !=, <, >, <=, >=',
                                'Lógicos: && (y), || (o), ! (no)',
                                'Asignación: =, +=, -=',
                            ]],
                            ['p', 'El orden de evaluación importa: primero se resuelven paréntesis, luego multiplicaciones y divisiones, después sumas y restas. Usa paréntesis para que la intención sea explícita.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Una expresión siempre produce un valor',
                                'Los operadores lógicos combinan condiciones',
                                'El orden de precedencia determina el resultado',
                                'Los paréntesis hacen explícita la prioridad',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el resultado de la expresión 10 + 3 * 2?', 'type' => 'single', 'answers' => [
                                    ['16', true, 'La multiplicación tiene prioridad: 3 * 2 = 6, luego 10 + 6 = 16.'],
                                    ['26', false, 'Eso sería (10 + 3) * 2, pero sin paréntesis la multiplicación va primero.'],
                                    ['13', false, 'Te falta multiplicar 3 por 2 antes de sumar.'],
                                    ['36', false, 'No es un resultado posible para esta expresión.'],
                                ]],
                                ['q' => '¿Qué operador usarías para saber si un número es par?', 'type' => 'single', 'answers' => [
                                    ['El módulo % comparando el resto con 0', true, 'Si n % 2 == 0 el número es par; el resto divide exacto.'],
                                    ['El operador de concatenación .', false, 'Ese operador une texto, no analiza números.'],
                                    ['El operador de asignación =', false, 'La asignación guarda un valor, no comprueba paridad.'],
                                    ['El operador de incremento ++', false, '++ solo suma uno al valor.'],
                                ]],
                                ['q' => '¿Cuándo es verdadera la expresión (a > 5) && (b < 5)?', 'type' => 'single', 'answers' => [
                                    ['Solo cuando ambas condiciones son verdaderas a la vez', true, 'El && exige que las dos condiciones se cumplan simultáneamente.'],
                                    ['Cuando al menos una condición es verdadera', false, 'Eso describe al operador || (o).'],
                                    ['Cuando ninguna condición se cumple', false, 'Con && ambas deben cumplirse.'],
                                    ['Siempre, sin importar los valores', false, 'El resultado depende de los valores de a y b.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Flujo y Funciones',
                'description' => 'Controla el orden de ejecución con condicionales y ciclos, y reutiliza lógica con funciones.',
                'lessons' => [
                    [
                        'slug' => 'condicionales-if-else',
                        'title' => 'Condicionales: if, else, elif',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Condicionales: if, else, elif'],
                            ['p', 'Los condicionales permiten que el programa tome decisiones: ejecuta un bloque de código solo cuando se cumple una condición. Son el mecanismo básico para expresar reglas en código.'],
                            ['p', 'La condición se evalúa como verdadera o falsa; si es verdadera se ejecuta el bloque del if, si no, el del else cuando existe. Los else if encadenan varias alternativas.'],
                            ['code', 'php', <<<'PHP'
<?php
$edad = 17;

if ($edad >= 18) {
    echo "Eres mayor de edad";
} elseif ($edad >= 13) {
    echo "Eres adolescente";
} else {
    echo "Eres niño";
}
PHP],
                            ['h', 'Consejos para condicionales limpios'],
                            ['list', [
                                'Ordena las condiciones de la más específica a la más general',
                                'Evita condiciones anidadas muy profundas: extrae funciones',
                                'Considera return temprano para salir antes de anidar',
                                'Usa nombres de variables que hagan la condición legible',
                            ]],
                            ['p', 'Un error común es confundir asignación con comparación. En muchos lenguajes una sola igualdad asigna y una doble compara, así que revisa siempre el símbolo usado.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'if ejecuta un bloque cuando la condición es verdadera',
                                'else cubre el caso contrario',
                                'elseif permite múltiples alternativas',
                                'La legibilidad de las condiciones importa tanto como su lógica',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace el bloque else en un condicional?', 'type' => 'single', 'answers' => [
                                    ['Se ejecuta cuando la condición del if es falsa', true, 'El else captura el caso contrario a la condición principal.'],
                                    ['Se ejecuta siempre, sin importar la condición', false, 'Si la condición es verdadera, solo corre el bloque del if.'],
                                    ['Se ejecuta antes que el if', false, 'El if se evalúa primero y decide qué rama corre.'],
                                    ['Se ejecuta solo si hay un error', false, 'Para errores se usan excepciones, no el else.'],
                                ]],
                                ['q' => '¿Cuál es un error común al escribir condicionales?', 'type' => 'single', 'answers' => [
                                    ['Confundir = (asignar) con == (comparar)', true, 'Usar una igualdad donde se necesita comparación cambia el valor y el flujo.'],
                                    ['Usar nombres descriptivos', false, 'Eso es una buena práctica, no un error.'],
                                    ['Escribir la condición en una línea', false, 'Es válido; el estilo no cambia la lógica.'],
                                    ['Incluir un else final', false, 'El else final es opcional y correcto.'],
                                ]],
                                ['q' => '¿Cuándo tiene sentido encadenar elseif?', 'type' => 'single', 'answers' => [
                                    ['Cuando hay varias alternativas excluyentes que evaluar en orden', true, 'elseif recorre las opciones hasta encontrar la primera verdadera.'],
                                    ['Cuando quieres repetir un bloque varias veces', false, 'Para repetir se usan ciclos, no condicionales.'],
                                    ['Cuando necesitas almacenar muchos datos', false, 'Para datos se usan variables y colecciones.'],
                                    ['Cuando la condición puede ser verdadera y falsa a la vez', false, 'Una condición es booleana: una sola de las dos ramas corre.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'ciclos-for-while',
                        'title' => 'Ciclos: for y while',
                        'type' => 'article',
                        'duration' => 13,
                        'blocks' => [
                            ['h', 'Ciclos: for y while'],
                            ['p', 'Los ciclos repiten un bloque de código mientras se cumple una condición. Son la herramienta perfecta para recorrer listas, contar elementos o esperar a que algo cambie.'],
                            ['p', 'El for se usa cuando sabes cuántas veces repetir; el while cuando la repetición depende de una condición que puede cambiar dentro del bloque. Elegir el correcto hace el código más natural.'],
                            ['code', 'php', <<<'PHP'
<?php
// for: número fijo de repeticiones
for ($i = 0; $i < 5; $i++) {
    echo $i;
}

// while: repite mientras la condición sea verdadera
$turnos = 0;
while ($turnos < 3) {
    echo "Turno " . $turnos;
    $turnos++;
}
PHP],
                            ['h', 'Riesgo principal: ciclos infinitos'],
                            ['p', 'Un ciclo infinito ocurre cuando la condición nunca se vuelve falsa. En el while debes asegurarte de que algo dentro del bloque modifique la variable de control; de lo contrario el programa no termina.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'for es ideal cuando el número de repeticiones es conocido',
                                'while se usa cuando la condición cambia dentro del bloque',
                                'Siempre debe haber una forma de salir del ciclo',
                                'Recorrer colecciones es el uso más frecuente de los ciclos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuándo conviene usar un while en lugar de un for?', 'type' => 'single', 'answers' => [
                                    ['Cuando no sabemos cuántas veces se repetirá y depende de una condición dinámica', true, 'El while evalúa la condición en cada iteración y no exige un contador fijo.'],
                                    ['Cuando siempre queremos repetir exactamente 10 veces', false, 'Ese caso clásico es de for.'],
                                    ['Cuando queremos recorrer un array completo', false, 'Recorrer una colección se resuelve bien con for o foreach.'],
                                    ['Cuando tenemos una sola instrucción', false, 'La cantidad de instrucciones no define el tipo de ciclo.'],
                                ]],
                                ['q' => '¿Qué provoca un ciclo infinito?', 'type' => 'single', 'answers' => [
                                    ['Que la condición nunca se vuelva falsa', true, 'Si nada modifica la condición, el ciclo no tiene salida.'],
                                    ['Que el ciclo tenga muchas iteraciones', false, 'Muchas iteraciones no son infinitas; terminan en algún momento.'],
                                    ['Que el bloque tenga comentarios', false, 'Los comentarios no afectan al flujo del ciclo.'],
                                    ['Que se use echo dentro del bloque', false, 'Salida por pantalla no influye en la condición.'],
                                ]],
                                ['q' => 'En for ($i = 0; $i < 5; $i++), ¿cuántas veces se ejecuta el bloque?', 'type' => 'single', 'answers' => [
                                    ['5 veces', true, 'Con $i desde 0 hasta 4 inclusive, la condición se cumple 5 veces.'],
                                    ['4 veces', false, 'Al empezar en 0, los valores 0,1,2,3,4 suman 5 iteraciones.'],
                                    ['6 veces', false, 'La condición es < 5, así que el valor 5 no entra.'],
                                    ['Infinitas veces', false, 'El ++ avanza el contador; el ciclo termina.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'funciones-y-parametros',
                        'title' => 'Funciones y parámetros',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'Funciones y parámetros'],
                            ['p', 'Una función es un bloque de código con nombre que recibe entradas, las procesa y devuelve un resultado. Permite escribir una vez y reutilizar muchas veces, además de dividir el problema en piezas pequeñas.'],
                            ['p', 'Los parámetros son los valores que la función recibe; los argumentos son los valores concretos que pasas al llamarla. Definir funciones pequeñas y con una sola responsabilidad mejora enormemente la calidad del código.'],
                            ['code', 'php', <<<'PHP'
<?php
function calcularPrecioConIva(float $precio, float $iva = 0.21): float
{
    return $precio * (1 + $iva);
}

echo calcularPrecioConIva(100);      // 121.0
echo calcularPrecioConIva(100, 0.10); // 110.0
PHP],
                            ['h', 'Ventajas de usar funciones'],
                            ['list', [
                                'Evitan duplicar código: escribe la lógica una sola vez',
                                'Aíslan errores: cada función se prueba por separado',
                                'Dan nombre a las operaciones y documentan la intención',
                                'Facilitan los tests automáticos',
                            ]],
                            ['p', 'Un buen ejercicio es refactorizar: cuando repites el mismo cálculo tres veces, conviértelo en función. El código resultante es más corto y más fácil de mantener.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Una función recibe parámetros y devuelve un resultado',
                                'Los parámetros opcionales tienen valores por defecto',
                                'La responsabilidad única hace las funciones más fiables',
                                'Llamar una función ejecuta su bloque cuantas veces quieras',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué son los parámetros de una función?', 'type' => 'single', 'answers' => [
                                    ['Las entradas declaradas que la función espera para trabajar', true, 'Los parámetros definen qué datos necesita la función.'],
                                    ['Los valores que retorna al terminar', false, 'Eso es el valor de retorno, no los parámetros.'],
                                    ['Los comentarios que documentan la función', false, 'Los comentarios explican; los parámetros son datos de entrada.'],
                                    ['Los errores que puede lanzar', false, 'Los errores son otra cosa; los parámetros son entradas.'],
                                ]],
                                ['q' => '¿Por qué conviene dividir el problema en funciones pequeñas?', 'type' => 'single', 'answers' => [
                                    ['Porque cada pieza se entiende, prueba y reutiliza por separado', true, 'La modularidad reduce la complejidad y facilita el mantenimiento.'],
                                    ['Porque el programa siempre corre más rápido', false, 'No garantiza velocidad; sí mejora organización y pruebas.'],
                                    ['Porque elimina la necesidad de variables', false, 'Las funciones siguen usando variables internamente.'],
                                    ['Porque evita escribir condiciones', false, 'Las condiciones siguen siendo necesarias dentro de las funciones.'],
                                ]],
                                ['q' => '¿Qué devuelve la llamada calcularPrecioConIva(100) si el iva por defecto es 0.21?', 'type' => 'single', 'answers' => [
                                    ['121.0', true, 'El precio por defecto aplica iva 0.21: 100 * 1.21 = 121.'],
                                    ['100.0', false, 'Eso sería sin aplicar ningún iva.'],
                                    ['21.0', false, '21 es solo el importe del iva, no el total.'],
                                    ['110.0', false, '110 corresponde al iva del 10%, no al 21% por defecto.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Primeros Programas',
                'description' => 'Pon en práctica lo aprendido: estructura de un programa, depuración y una primera mirada a la POO.',
                'lessons' => [
                    [
                        'slug' => 'que-es-un-programa',
                        'title' => '¿Qué es un programa?',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', '¿Qué es un programa?'],
                            ['p', 'Un programa es una secuencia de instrucciones que un ordenador ejecuta para resolver una tarea. El código fuente es el texto que escribes; el compilador o intérprete lo convierte en acciones reales.'],
                            ['p', 'Todo programa sigue un ciclo: recibe una entrada, la procesa siguiendo la lógica que definiste y produce una salida. Incluso los sistemas más complejos son esa idea con muchas capas.'],
                            ['code', 'php', <<<'PHP'
<?php
// Entrada
$nombre = "Ana";

// Proceso
$saludo = "Hola, " . $nombre;

// Salida
echo $saludo;
PHP],
                            ['h', 'Partes de un programa'],
                            ['list', [
                                'Entrada: datos que llegan del usuario, archivos o sensores',
                                'Proceso: la lógica que transforma esos datos',
                                'Salida: resultado mostrado, guardado o enviado',
                                'Errores: casos inesperados que el programa debe manejar',
                            ]],
                            ['p', 'Antes de escribir código, describe el flujo en papel o con comentarios. Esta práctica, llamada diseño del algoritmo, evita reescribir y hace visible la solución antes de programarla.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Un programa traduce instrucciones en acciones',
                                'El ciclo entrada-proceso-salida está en casi todo software',
                                'Diseñar antes de codificar ahorra tiempo',
                                'El manejo de errores es parte del programa',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es el código fuente?', 'type' => 'single', 'answers' => [
                                    ['El texto de instrucciones que escribe el programador', true, 'El código fuente es la representación legible del programa.'],
                                    ['El resultado que muestra la pantalla', false, 'La salida es el resultado; el fuente es el texto que lo produce.'],
                                    ['El hardware donde corre el programa', false, 'El hardware es físico; el código fuente es texto.'],
                                    ['La documentación del usuario final', false, 'La documentación explica; el código fuente define el comportamiento.'],
                                ]],
                                ['q' => '¿Cuál es el ciclo básico de un programa?', 'type' => 'single', 'answers' => [
                                    ['Entrada, proceso y salida', true, 'Los datos entran, se transforman y se entrega un resultado.'],
                                    ['Compilar, instalar y desinstalar', false, 'Eso describe acciones del entorno, no el flujo del programa.'],
                                    ['Diseñar, dibujar y borrar', false, 'No es el flujo de datos de un programa.'],
                                    ['Teclado, ratón y monitor', false, 'Son periféricos, no el flujo lógico.'],
                                ]],
                                ['q' => '¿Por qué conviene diseñar el algoritmo antes de escribir código?', 'type' => 'single', 'answers' => [
                                    ['Porque aclara la solución y evita reescribir', true, 'Pensar el flujo antes reduce errores y cambios de rumbo.'],
                                    ['Porque el ordenador exige un diseño previo', false, 'El ordenador ejecuta cualquier código válido, con o sin diseño.'],
                                    ['Porque sin diseño el programa no compila', false, 'La compilación depende de la sintaxis, no del diseño.'],
                                    ['Porque reduce el número de archivos', false, 'El diseño no cambia la cantidad de archivos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'depurando-tu-codigo',
                        'title' => 'Depurando tu código',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Depurando tu código'],
                            ['p', 'Depurar es encontrar y corregir errores. Los errores de sintaxis impiden ejecutar; los de lógica producen resultados incorrectos sin romper el programa. Aprender a depurar es tan importante como escribir código.'],
                            ['p', 'La estrategia básica consiste en localizar la zona sospechosa, observar los valores de las variables y comprobar si coinciden con lo esperado. Los depuradores permiten pausar la ejecución e inspeccionar el estado.'],
                            ['code', 'php', <<<'PHP'
<?php
function dividir($a, $b) {
    if ($b === 0) {
        throw new InvalidArgumentException("No dividas entre cero");
    }
    return $a / $b;
}

echo dividir(10, 2); // 5
PHP],
                            ['h', 'Tipos de errores comunes'],
                            ['list', [
                                'Sintaxis: faltan símbolos o el orden es inválido',
                                'Lógica: el programa corre pero el resultado es incorrecto',
                                'Tiempo de ejecución: falla con ciertos datos (división entre cero)',
                                'Estado: una variable tiene un valor inesperado en un momento dado',
                            ]],
                            ['p', 'Lee el mensaje de error completo: casi siempre indica archivo y línea. Después, reproduce el fallo con la entrada mínima y aísla cada variable hasta encontrar la que no coincide con lo esperado.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los errores de lógica no rompen el programa pero dan malos resultados',
                                'Inspeccionar variables es la técnica principal de depuración',
                                'El mensaje de error indica archivo y línea: empieza por ahí',
                                'Reproducir el fallo con una entrada mínima acelera el diagnóstico',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un error de lógica?', 'type' => 'single', 'answers' => [
                                    ['El programa corre pero produce un resultado incorrecto', true, 'La lógica falla aunque la ejecución no se detenga.'],
                                    ['El código no compila por mala sintaxis', false, 'Ese es un error de sintaxis.'],
                                    ['El ordenador se queda sin memoria', false, 'Eso es un problema del entorno, no de lógica.'],
                                    ['El usuario introduce datos equivocados', false, 'Son datos de entrada inválidos, no un error del programa.'],
                                ]],
                                ['q' => '¿Cuál es el primer paso al leer un error?', 'type' => 'single', 'answers' => [
                                    ['Ver el archivo y la línea que indica el mensaje', true, 'El mensaje suele apuntar directamente al origen del fallo.'],
                                    ['Reescribir todo el programa', false, 'Escribir de cero sin diagnóstico suele repetir el error.'],
                                    ['Cambiar el lenguaje de programación', false, 'El lenguaje no es el problema; la lógica o sintaxis sí.'],
                                    ['Apagar el ordenador', false, 'No resuelve el error en el código.'],
                                ]],
                                ['q' => '¿Por qué es útil reproducir el fallo con una entrada mínima?', 'type' => 'single', 'answers' => [
                                    ['Porque reduce las variables a observar y aísla la causa', true, 'Con menos datos es más fácil ver qué condición dispara el error.'],
                                    ['Porque hace el programa más rápido', false, 'El objetivo es diagnosticar, no medir rendimiento.'],
                                    ['Porque evita usar el depurador', false, 'El depurador sigue siendo útil en cualquier caso.'],
                                    ['Porque borra el error automáticamente', false, 'Reproducir no corrige; solo ayuda a encontrar la causa.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'primeros-pasos-en-poo',
                        'title' => 'Primeros pasos en Programación Orientada a Objetos',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Primeros pasos en Programación Orientada a Objetos'],
                            ['p', 'La Programación Orientada a Objetos (POO) organiza el código alrededor de objetos: estructuras que combinan datos (propiedades) y comportamiento (métodos). Una clase es la receta; un objeto es la instancia concreta.'],
                            ['p', 'La POO favorece el modelado del mundo real: un Usuario, un Pedido o un Carrito se convierten en clases con atributos y acciones. Esto mejora la organización en proyectos grandes.'],
                            ['code', 'php', <<<'PHP'
<?php
class Usuario {
    public function __construct(
        public string $nombre,
        public int $edad
    ) {}

    public function saludar(): string {
        return "Hola, soy " . $this->nombre;
    }
}

$ada = new Usuario("Ada", 36);
echo $ada->saludar();
PHP],
                            ['h', 'Conceptos esenciales'],
                            ['list', [
                                'Clase: definición de tipo con propiedades y métodos',
                                'Objeto (instancia): un ejemplar concreto creado con new',
                                'Propiedades: datos que guarda cada objeto',
                                'Métodos: funciones que el objeto puede ejecutar',
                            ]],
                            ['p', 'Tres pilares acompañan a la POO: encapsulación (proteger los datos), herencia (reutilizar comportamiento) y polimorfismo (mismos métodos, comportamientos distintos). Conocerlos llega después de dominar la sintaxis básica.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La clase define el molde; el objeto es la instancia',
                                'Las propiedades guardan estado y los métodos comportamiento',
                                'Encapsulación, herencia y polimorfismo son los pilares',
                                'La POO destaca en proyectos grandes y colaborativos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es la diferencia entre clase y objeto?', 'type' => 'single', 'answers' => [
                                    ['La clase es la definición y el objeto es una instancia concreta', true, 'Con new creas objetos a partir del molde de la clase.'],
                                    ['Son exactamente lo mismo', false, 'Son conceptos distintos: plantilla vs. ejemplar.'],
                                    ['El objeto es la definición y la clase la instancia', false, 'Es al revés: la clase define, el objeto instancia.'],
                                    ['La clase solo existe en Java', false, 'La POO existe en muchos lenguajes.'],
                                ]],
                                ['q' => '¿Qué son los métodos de una clase?', 'type' => 'single', 'answers' => [
                                    ['Funciones que definen el comportamiento del objeto', true, 'Los métodos ejecutan acciones sobre los datos del objeto.'],
                                    ['Los datos que guarda cada objeto', false, 'Los datos son las propiedades, no los métodos.'],
                                    ['Los archivos donde se guarda la clase', false, 'El archivo contiene código; los métodos son funciones.'],
                                    ['Los errores que puede lanzar la clase', false, 'Los métodos pueden lanzar errores, pero no son lo mismo.'],
                                ]],
                                ['q' => '¿Qué ventaja principal aporta la encapsulación?', 'type' => 'single', 'answers' => [
                                    ['Proteger los datos internos y controlar cómo se accede a ellos', true, 'Ocultar detalles internos evita estados inconsistentes.'],
                                    ['Hacer los programas más cortos', false, 'La encapsulación ordena, no necesariamente acorta.'],
                                    ['Eliminar los condicionales', false, 'La lógica condicional sigue siendo necesaria.'],
                                    ['Conectar el programa con la base de datos', false, 'La conexión a BD es responsabilidad de otra capa.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Estructuras de Datos: Arrays y Colecciones',
                'description' => 'Aprende cómo organizar colecciones de datos en memoria, indexación 0-based y operaciones de recorrido según los estándares de la computación.',
                'lessons' => [
                    [
                        'slug' => 'arrays-y-listas-en-memoria',
                        'title' => 'Arreglos y listas en memoria',
                        'type' => 'article',
                        'duration' => 12,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'Arreglos y representación en memoria contigua'],
                            ['p', 'Un arreglo (o array) es una colección ordenada de elementos almacenados en posiciones contiguas de memoria. Cada elemento tiene asignado un número llamado índice (index), que por convención universal comienza en 0.'],
                            ['p', 'La gran ventaja de la indexación contigua es el acceso aleatorio O(1): la computadora calcula la dirección de memoria exacta multiplicando el índice por el tamaño de bytes del dato.'],
                            ['code', 'php', <<<'PHP'
<?php
// Declaración e inicialización de un array
$lenguajes = ["Python", "PHP", "JavaScript", "TypeScript"];

// Acceso directo por índice (base 0)
echo $lenguajes[0]; // Imprime: Python
echo $lenguajes[2]; // Imprime: JavaScript

// Longitud del array
echo "Total de tecnologías: " . count($lenguajes);
PHP],
                            ['h', 'Operaciones comunes sobre arrays'],
                            ['list', [
                                'Acceso directo por índice: tiempo constante O(1)',
                                'Búsqueda secuencial (Linear Search): recorre elemento por elemento en O(n)',
                                'Inserción al final: rápida y directa',
                                'Modificación de elementos: asignando un nuevo valor a $array[indice]',
                            ]],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los índices inician siempre en 0',
                                'Acceder fuera de los límites genera errores de tipo IndexOutOfBounds o Undefined index',
                                'Son la base para construir estructuras más complejas como pilas, colas y tablas hash',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué los arreglos empiezan a indexarse en 0 en la mayoría de lenguajes?', 'type' => 'single', 'answers' => [
                                    ['Porque el índice representa el desplazamiento (offset) de memoria desde el inicio', true, 'El primer elemento tiene desplazamiento 0 respecto al puntero base.'],
                                    ['Porque ahorra memoria en el disco duro', false, 'El índice en el código no afecta el espacio en disco.'],
                                    ['Por una limitación técnica de los teclados antiguos', false, 'Es una convención matemática de cálculo de punteros de memoria.'],
                                    ['Para que el programa sea más corto', false, 'La razón es matemática y de arquitectura de hardware.'],
                                ]],
                                ['q' => '¿Qué complejidad temporal tiene acceder a un elemento por su índice en un array?', 'type' => 'single', 'answers' => [
                                    ['O(1) - Tiempo constante inmediato', true, 'El procesador salta directamente a la dirección de memoria calculada.'],
                                    ['O(n) - Tiempo lineal', false, 'O(n) es cuando tienes que buscar sin conocer el índice.'],
                                    ['O(log n) - Tiempo logarítmico', false, 'El acceso directo no requiere búsqueda binaria.'],
                                    ['O(n²) - Tiempo cuadrático', false, 'El acceso por índice es la operación más rápida posible.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'recorrido-y-transformacion-de-arrays',
                        'title' => 'Recorrido y transformación de datos',
                        'type' => 'article',
                        'duration' => 14,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'Iteración y filtrado de datos'],
                            ['p', 'En el desarrollo profesional rara vez trabajamos con datos aislados. Casi todas las aplicaciones procesan listas: listas de estudiantes, productos en un carrito, transacciones financieras o registros de bases de datos.'],
                            ['p', 'Para procesar estas listas combinamos bucles for / foreach con condicionales para filtrar o calcular acumulados.'],
                            ['code', 'php', <<<'PHP'
<?php
$calificaciones = [85, 92, 58, 74, 99, 45, 88];
$aprobados = [];
$sumaTotal = 0;

foreach ($calificaciones as $nota) {
    $sumaTotal += $nota;
    if ($nota >= 60) {
        $aprobados[] = $nota; // Agregar al nuevo array
    }
}

$promedio = $sumaTotal / count($calificaciones);
echo "Promedio general: " . round($promedio, 2);
echo "Aprobados: " . count($aprobados);
PHP],
                            ['h', 'Buenas prácticas al manipular colecciones'],
                            ['list', [
                                'Evita modificar el tamaño de un array mientras lo estás iterando',
                                'Usa nombres en plural para colecciones y en singular para el elemento actual: foreach ($usuarios as $usuario)',
                                'Prefiere generar nuevos arreglos limpios en vez de mutar destructivamente los datos originales',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué estructura es ideal para recorrer todos los elementos de un array sin necesidad de gestionar manualmente el contador?', 'type' => 'single', 'answers' => [
                                    ['El bucle foreach o for...of', true, 'Se encarga internamente de avanzar y extraer cada elemento secuencialmente.'],
                                    ['Un condicional if anidado', false, 'Los condicionales evalúan una sola vez, no repiten código.'],
                                    ['Una función recursiva sin caso base', false, 'Una función recursiva sin caso base provoca un desbordamiento de pila (Stack Overflow).'],
                                    ['Una sentencia switch', false, 'Switch sirve para ramificar decisiones, no para iterar.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Algoritmia y Resolución de Problemas',
                'description' => 'Desarrolla el pensamiento computacional: aprende a descomponer problemas complejos, identificar casos borde y diseñar soluciones robustas antes de escribir código.',
                'lessons' => [
                    [
                        'slug' => 'pensamiento-computacional-y-descomposicion',
                        'title' => 'Pensamiento computacional y descomposición',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'Las cuatro fases del pensamiento computacional'],
                            ['p', 'Aprender a programar no se trata de memorizar sintaxis, sino de aprender a resolver problemas de forma sistemática. La metodología estándar de la ingeniería consta de 4 fases:'],
                            ['list', [
                                '1. Descomposición: dividir un problema gigante en subproblemas pequeños e independientes.',
                                '2. Reconocimiento de patrones: identificar qué partes del problema se parecen a otros problemas ya resueltos anteriormente.',
                                '3. Abstracción: filtrar los detalles irrelevantes y concentrarse únicamente en la información necesaria.',
                                '4. Diseño de algoritmos: escribir las instrucciones paso a paso (pseudocódigo) para llegar a la solución.',
                            ]],
                            ['h', 'Ejemplo: Diseñar un sistema de validación de contraseñas'],
                            ['p', 'En vez de intentar resolver todo con una expresión gigante e incomprensible, descomponemos las reglas en funciones atómicas:'],
                            ['code', 'php', <<<'PHP'
<?php
function tieneLongitudMinima(string $clave, int $min = 8): bool {
    return strlen($clave) >= $min;
}

function tieneNumero(string $clave): bool {
    return preg_match('/[0-9]/', $clave) === 1;
}

function tieneMayuscula(string $clave): bool {
    return preg_match('/[A-Z]/', $clave) === 1;
}

function esContrasenaSegura(string $clave): bool {
    return tieneLongitudMinima($clave) 
        && tieneNumero($clave) 
        && tieneMayuscula($clave);
}
PHP],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Divide y vencerás: cada función debe tener una sola responsabilidad (Principio SRP)',
                                'El código limpio se explica por sí mismo a través del nombre de sus componentes',
                                'Siempre prueba los valores límite (cadenas vacías, números negativos, valores máximos)',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es la descomposición en el pensamiento computacional?', 'type' => 'single', 'answers' => [
                                    ['Dividir un problema complejo en subproblemas más manejables', true, 'Permite abordar cada parte de manera aislada y verificable.'],
                                    ['Apagar y encender el servidor cuando falla', false, 'Eso es un reinicio, no análisis computacional.'],
                                    ['Borrar el código que tiene errores', false, 'Borrar no diagnostica ni diseña soluciones.'],
                                    ['Compilar el código a lenguaje máquina', false, 'La compilación es un proceso del compilador, no del pensamiento humano.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'evaluacion-final-fundamentos',
                        'title' => 'Evaluación Integradora de Fundamentos',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'Evaluación final del curso'],
                            ['p', 'Has llegado al final de Introducción a la Programación. Este cuestionario valida que comprendes los conceptos troncales de variables, control de flujo, funciones y estructuras de datos antes de avanzar a la ruta de Programación Orientada a Objetos o Desarrollo Web.'],
                            ['p', 'Tómate tu tiempo para analizar cada pregunta y las posibles trampas de tipos y orden de ejecución.'],
                        ],
                        'quiz' => [
                            'title' => 'Examen Final de Fundamentos',
                            'questions' => [
                                ['q' => 'Si declaras un array con 5 elementos, ¿cuál es el índice del último elemento?', 'type' => 'single', 'answers' => [
                                    ['4', true, 'Dado que la indexación es base 0, los índices van del 0 al 4.'],
                                    ['5', false, 'El índice 5 estaría fuera de rango (causaría IndexOutOfBounds).'],
                                    ['1', false, '1 es el segundo elemento.'],
                                    ['-1 en todos los lenguajes', false, 'Solo algunos lenguajes como Python admiten índices negativos.'],
                                ]],
                                ['q' => '¿Qué sucede si un bucle while nunca actualiza su condición de parada?', 'type' => 'single', 'answers' => [
                                    ['Se produce un bucle infinito y bloquea el hilo de ejecución', true, 'La condición siempre es verdadera y el programa queda congelado.'],
                                    ['El programa salta automáticamente al siguiente módulo', false, 'El procesador continuará ejecutando el bucle sin detenerse.'],
                                    ['El ordenador se reinicia inmediatamente', false, 'El sistema operativo detecta el alto consumo pero no se reinicia.'],
                                    ['La variable se convierte en booleano', false, 'Las variables no cambian de tipo por un bucle.'],
                                ]],
                                ['q' => '¿Cuál es la función principal del valor de retorno (return) en una función?', 'type' => 'single', 'answers' => [
                                    ['Devolver el resultado computado al punto donde fue invocada', true, 'Permite reutilizar la salida de la función en otras expresiones.'],
                                    ['Imprimir el texto en la pantalla', false, 'Imprimir es responsabilidad de echo o print, no de return.'],
                                    ['Detener la ejecución de todo el sistema operativo', false, 'Return solo finaliza la ejecución de la función actual.'],
                                    ['Borrar las variables de la base de datos', false, 'No tiene relación con bases de datos.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 2. Algoritmos de Ordenamiento
    // =====================================================================
    [
        'slug' => 'algoritmos-ordenamiento',
        'title' => 'Algoritmos de Ordenamiento',
        'description' => 'Estudia los algoritmos de ordenamiento más importantes: Bubble Sort, Selection Sort, Merge Sort, Quick Sort. Aprende a analizar su complejidad temporal y espacial con Big-O notation.',
        'category' => 'algoritmos',
        'difficulty' => 'intermediate',
        'duration_hours' => 8,
        'is_free' => true,
        'learning_path' => 'fundamentos-programacion',
        'learning_path_level' => 3,
        'order' => 1,
        'modules' => [
            [
                'title' => 'Análisis de Algoritmos',
                'description' => 'Aprende a medir y comparar la eficiencia de los algoritmos con la notación Big-O.',
                'lessons' => [
                    [
                        'slug' => 'notacion-big-o',
                        'title' => 'Notación Big-O',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Notación Big-O'],
                            ['p', 'La notación Big-O describe cómo crece el tiempo de ejecución de un algoritmo cuando crece la entrada. No mide segundos: mide la tasa de crecimiento en el peor caso, lo que permite comparar algoritmos de forma independiente de la máquina.'],
                            ['p', 'O(1) significa tiempo constante, O(n) tiempo proporcional a la entrada y O(n²) tiempo cuadrático. La misma máquina puede tardar milisegundos u horas según el algoritmo elegido.'],
                            ['code', 'python', <<<'PY'
# O(n): el tiempo crece linealmente con la entrada
def buscar_maximo(datos):
    maximo = datos[0]
    for valor in datos:
        if valor > maximo:
            maximo = valor
    return maximo
PY],
                            ['h', 'Complejidades comunes'],
                            ['list', [
                                'O(1): constante, no depende del tamaño (acceder a un array)',
                                'O(log n): logarítmica, crece muy lento (búsqueda binaria)',
                                'O(n): lineal, recorre la entrada una vez',
                                'O(n log n): casi lineal, típico de ordenamientos eficientes',
                                'O(n²): cuadrática, recorre en pares (algoritmos básicos)',
                            ]],
                            ['p', 'Cuando la entrada es pequeña, todas las complejidades son rápidas. La diferencia se nota con miles o millones de elementos: ahí O(n log n) vence claramente a O(n²).'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Big-O describe la tasa de crecimiento, no tiempo real',
                                'El peor caso es la referencia habitual',
                                'Las constantes y los casos pequeños importan menos que el orden de crecimiento',
                                'Elegir el algoritmo correcto marca una diferencia enorme en datos grandes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué describe la notación Big-O?', 'type' => 'single', 'answers' => [
                                    ['Cómo crece el tiempo de ejecución según crece la entrada', true, 'Mide la tasa de crecimiento asintótica del algoritmo.'],
                                    ['El tiempo exacto en segundos que tarda la máquina', false, 'Big-O ignora las constantes y el hardware concreto.'],
                                    ['La cantidad de memoria física del ordenador', false, 'Eso es hardware; Big-O describe crecimiento del algoritmo.'],
                                    ['El número de líneas del código fuente', false, 'Las líneas de código no determinan la complejidad.'],
                                ]],
                                ['q' => '¿Qué complejidad tiene un algoritmo que recorre la entrada una sola vez?', 'type' => 'single', 'answers' => [
                                    ['O(n)', true, 'Recorrer n elementos una vez es lineal.'],
                                    ['O(1)', false, 'O(1) no depende del tamaño de la entrada.'],
                                    ['O(n²)', false, 'O(n²) aparece con bucles anidados, no con un solo recorrido.'],
                                    ['O(log n)', false, 'O(log n) divide la entrada, no la recorre completa.'],
                                ]],
                                ['q' => '¿Por qué O(n log n) supera a O(n²) en listas grandes?', 'type' => 'single', 'answers' => [
                                    ['Porque su tasa de crecimiento es mucho menor cuando n crece', true, 'Con n = 1.000.000, n log n es ~20 millones; n² es un billón.'],
                                    ['Porque siempre tarda lo mismo sin importar n', false, 'Eso sería O(1).'],
                                    ['Porque usa menos memoria siempre', false, 'La complejidad temporal no garantiza menos memoria.'],
                                    ['Porque no necesita comparar elementos', false, 'Los ordenamientos eficientes siguen comparando.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'comparando-algoritmos',
                        'title' => 'Comparando algoritmos en la práctica',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Comparando algoritmos en la práctica'],
                            ['p', 'La complejidad teórica es el punto de partida, pero la práctica añade matices: el tamaño real de los datos, el caso promedio y las constantes de cada implementación también importan.'],
                            ['p', 'Un algoritmo O(n log n) con constantes altas puede perder contra uno O(n²) con constantes bajas si la entrada es pequeña. Por eso se miden ambas cosas: análisis asintótico y benchmarks reales.'],
                            ['code', 'python', <<<'PY'
import time

def medir(funcion, datos):
    inicio = time.perf_counter()
    funcion(datos)
    return time.perf_counter() - inicio

# Comparar implementaciones reales con la misma entrada
PY],
                            ['h', 'Criterios de comparación'],
                            ['list', [
                                'Complejidad temporal en el peor y mejor caso',
                                'Complejidad espacial (memoria adicional usada)',
                                'Estabilidad: si preserva el orden de elementos iguales',
                                'Comportamiento con datos casi ordenados o con duplicados',
                            ]],
                            ['p', 'Ningún algoritmo es el mejor en todo: Merge Sort es estable y predecible; Quick Sort es rapidísimo en promedio pero puede degradarse; Insertion Sort brilla con listas pequeñas o casi ordenadas.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Big-O guía, pero el benchmark confirma',
                                'Los datos reales (casi ordenados, duplicados) cambian el resultado',
                                'La estabilidad importa cuando ordenas por varios criterios',
                                'Elige según el caso de uso, no solo por la fama del algoritmo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué puede un O(n²) ganar a un O(n log n) en la práctica?', 'type' => 'single', 'answers' => [
                                    ['Porque con entradas pequeñas las constantes y la sobrecarga dominan', true, 'El análisis asintótico domina cuando n es grande; para n pequeño, las constantes mandan.'],
                                    ['Porque O(n²) siempre es peor, sin excepciones', false, 'En teoría sí, pero en la práctica los tamaños importan.'],
                                    ['Porque el O(n log n) está mal escrito', false, 'No hace falta que esté mal: las constantes pueden ser muy altas.'],
                                    ['Porque la máquina hace trampa', false, 'La máquina es neutral; el tamaño de entrada decide.'],
                                ]],
                                ['q' => '¿Qué significa que un algoritmo de ordenamiento sea estable?', 'type' => 'single', 'answers' => [
                                    ['Que preserva el orden relativo de los elementos iguales', true, 'Si dos elementos son iguales, mantienen su orden original.'],
                                    ['Que siempre termina en el mismo tiempo', false, 'Eso sería complejidad constante, no estabilidad.'],
                                    ['Que nunca falla con datos vacíos', false, 'Manejar entradas vacías es robustez, no estabilidad.'],
                                    ['Que no usa memoria extra', false, 'Eso es complejidad espacial O(1) in-place.'],
                                ]],
                                ['q' => '¿Qué algoritmo suele ser la mejor opción para una lista casi ordenada?', 'type' => 'single', 'answers' => [
                                    ['Insertion Sort', true, 'Su coste se acerca a O(n) cuando la lista ya está casi ordenada.'],
                                    ['Quick Sort con pivote al inicio', false, 'Con pivote al inicio y lista ordenada, Quick Sort se degrada a O(n²).'],
                                    ['Bubble Sort', false, 'Técnicamente mejora con listas casi ordenadas, pero Insertion Sort lo supera en la práctica.'],
                                    ['Ninguno: hay que ordenar sí o sí', false, 'Hay algoritmos adaptativos que aprovechan el orden parcial.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'complejidad-espacial',
                        'title' => 'Complejidad espacial',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'Complejidad espacial'],
                            ['p', 'La complejidad espacial mide cuánta memoria adicional consume un algoritmo según crece la entrada. Un algoritmo puede ser rapidísimo en tiempo pero inviable por la memoria que requiere.'],
                            ['p', 'Los algoritmos in-place ordenan dentro del propio array sin copias grandes; otros, como Merge Sort, construyen arreglos auxiliares. La elección depende de los recursos del sistema.'],
                            ['code', 'python', <<<'PY'
# In-place: sin copias adicionales (memoria O(1) extra)
def invertir(lista):
    izq, der = 0, len(lista) - 1
    while izq < der:
        lista[izq], lista[der] = lista[der], lista[izq]
        izq += 1
        der -= 1
PY],
                            ['h', 'Comparación típica'],
                            ['list', [
                                'Bubble Sort y Selection Sort: O(1) extra, in-place',
                                'Insertion Sort: O(1) extra, in-place y estable',
                                'Merge Sort: O(n) extra por los arrays auxiliares',
                                'Quick Sort: O(log n) extra por la pila de recursión',
                            ]],
                            ['p', 'Recuerda que Big-O espacial excluye la memoria de la propia entrada; mide lo adicional. En sistemas con límites de memoria estrictos, la complejidad espacial puede ser el factor decisivo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Complejidad espacial: memoria adicional según n',
                                'In-place usa O(1) memoria extra',
                                'Menos tiempo suele costar más memoria y viceversa',
                                'Evalúa ambos ejes antes de elegir algoritmo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué mide la complejidad espacial?', 'type' => 'single', 'answers' => [
                                    ['La memoria adicional que consume el algoritmo según crece la entrada', true, 'Mide el uso de memoria extra, no el tiempo.'],
                                    ['El tiempo que tarda en ejecutarse', false, 'Eso es complejidad temporal.'],
                                    ['El espacio en disco que ocupa el código', false, 'El código fuente no es lo que mide el algoritmo.'],
                                    ['La cantidad de variables del programa', false, 'Se mide el crecimiento en memoria, no el número de variables.'],
                                ]],
                                ['q' => '¿Qué significa que un algoritmo sea in-place?', 'type' => 'single', 'answers' => [
                                    ['Que ordena los datos dentro del mismo array sin copias grandes', true, 'In-place usa O(1) memoria adicional, ignorando la recurrencia.'],
                                    ['Que se ejecuta en memoria del procesador', false, 'Todo código corre en memoria; in-place habla de copias de datos.'],
                                    ['Que necesita un array auxiliar del mismo tamaño', false, 'Eso sería memoria extra O(n), como Merge Sort.'],
                                    ['Que no usa variables', false, 'Incluso in-place necesita variables temporales.'],
                                ]],
                                ['q' => '¿Qué algoritmo clásico usa O(n) de memoria extra?', 'type' => 'single', 'answers' => [
                                    ['Merge Sort', true, 'Necesita arrays auxiliares para combinar las mitades.'],
                                    ['Selection Sort', false, 'Selection Sort ordena in-place sin copias grandes.'],
                                    ['Insertion Sort', false, 'Es in-place con O(1) extra.'],
                                    ['Bubble Sort', false, 'Intercambia en el mismo array con O(1) extra.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Ordenamiento Básico',
                'description' => 'Los algoritmos cuadráticos clásicos: fáciles de entender e implementar, útiles para listas pequeñas.',
                'lessons' => [
                    [
                        'slug' => 'bubble-sort',
                        'title' => 'Bubble Sort',
                        'type' => 'code_challenge',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Bubble Sort'],
                            ['p', 'Bubble Sort compara elementos adyacentes y los intercambia si están en el orden incorrecto. En cada pasada, el elemento más grande "flota" hasta su posición final, de ahí el nombre de burbuja.'],
                            ['p', 'Su complejidad es O(n²) en el peor caso, pero si hacemos una pasada sin intercambios podemos terminar antes: el mejor caso es O(n) con una lista ya ordenada.'],
                            ['code', 'python', <<<'PY'
def bubble_sort(lista):
    n = len(lista)
    for i in range(n):
        intercambios = False
        for j in range(n - i - 1):
            if lista[j] > lista[j + 1]:
                lista[j], lista[j + 1] = lista[j + 1], lista[j]
                intercambios = True
        if not intercambios:
            break
    return lista

print(bubble_sort([5, 2, 9, 1]))
PY],
                            ['h', 'Características'],
                            ['list', [
                                'Complejidad: O(n²) peor caso, O(n) mejor caso',
                                'Memoria: O(1), ordena in-place',
                                'Estable: preserva el orden de elementos iguales',
                                'Ideal para aprender, no para listas grandes',
                            ]],
                            ['p', 'La bandera intercambios es una optimización sencilla: si en una pasada no hubo cambios, la lista ya está ordenada y se evita trabajo innecesario.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Compara pares adyacentes y los intercambia',
                                'Cada pasada coloca el mayor elemento en su sitio',
                                'O(n²) en el peor caso, O(n) con lista ordenada',
                                'Es estable y usa memoria O(1)',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es la complejidad temporal de Bubble Sort en el peor caso?', 'type' => 'single', 'answers' => [
                                    ['O(n²)', true, 'Con la lista invertida hace n pasadas con comparaciones por pasada.'],
                                    ['O(n log n)', false, 'Ese orden pertenece a Merge Sort o Quick Sort.'],
                                    ['O(log n)', false, 'Bubble Sort no divide la entrada.'],
                                    ['O(1)', false, 'No puede ordenar en tiempo constante.'],
                                ]],
                                ['q' => '¿Para qué sirve la bandera de intercambios?', 'type' => 'single', 'answers' => [
                                    ['Para terminar antes si una pasada no hizo cambios', true, 'Si no hubo intercambios, la lista ya está ordenada.'],
                                    ['Para contar cuántos elementos hay', false, 'El tamaño se conoce por separado.'],
                                    ['Para convertir el algoritmo en estable', false, 'La estabilidad depende de usar < o <=, no de la bandera.'],
                                    ['Para reducir la memoria a O(1)', false, 'Bubble Sort ya usa O(1) sin la bandera.'],
                                ]],
                                ['q' => '¿Qué elemento queda colocado al final de cada pasada?', 'type' => 'single', 'answers' => [
                                    ['El mayor de la porción restante', true, 'La burbuja más grande flota hasta el final de la zona activa.'],
                                    ['El menor de la porción restante', false, 'Eso es lo que hace Selection Sort al inicio.'],
                                    ['El elemento del medio', false, 'No hay ninguna razón para que el medio quede fijo.'],
                                    ['Ninguno', false, 'Cada pasada fija al menos el mayor de la porción.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'selection-sort',
                        'title' => 'Selection Sort',
                        'type' => 'code_challenge',
                        'duration' => 13,
                        'blocks' => [
                            ['h', 'Selection Sort'],
                            ['p', 'Selection Sort busca el elemento mínimo de la porción no ordenada y lo intercambia con la primera posición de esa porción. Así construye la lista ordenada de izquierda a derecha.'],
                            ['p', 'Siempre hace el mismo número de comparaciones, sin importar el orden de entrada: O(n²) en todos los casos. Es simple, in-place y con pocos intercambios.'],
                            ['code', 'python', <<<'PY'
def selection_sort(lista):
    n = len(lista)
    for i in range(n):
        minimo = i
        for j in range(i + 1, n):
            if lista[j] < lista[minimo]:
                minimo = j
        lista[i], lista[minimo] = lista[minimo], lista[i]
    return lista

print(selection_sort([5, 2, 9, 1]))
PY],
                            ['h', 'Características'],
                            ['list', [
                                'Complejidad: O(n²) siempre, mejor, peor y promedio',
                                'Memoria: O(1), in-place',
                                'No es estable: puede saltar elementos iguales',
                                'Hace pocos intercambios: a lo sumo n - 1',
                            ]],
                            ['p', 'Al hacer a lo sumo n-1 intercambios, Selection Sort puede ser útil cuando escribir en memoria es caro, aunque las comparaciones sean muchas.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Selecciona el mínimo y lo coloca al inicio de la zona no ordenada',
                                'O(n²) en todos los casos',
                                'In-place con O(1) memoria extra',
                                'Pocos intercambios, pero muchas comparaciones',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace Selection Sort en cada iteración?', 'type' => 'single', 'answers' => [
                                    ['Busca el mínimo de la porción restante y lo coloca al inicio', true, 'Esa es la selección que da nombre al algoritmo.'],
                                    ['Compara pares adyacentes e intercambia', false, 'Eso es Bubble Sort.'],
                                    ['Divide la lista en mitades recursivamente', false, 'Eso es Merge Sort.'],
                                    ['Inserta cada elemento en su posición dentro de lo ordenado', false, 'Eso es Insertion Sort.'],
                                ]],
                                ['q' => '¿Cuál es la complejidad de Selection Sort con una lista ya ordenada?', 'type' => 'single', 'answers' => [
                                    ['O(n²), igual que en cualquier otro caso', true, 'No se adapta: siempre recorre todos los pares.'],
                                    ['O(n)', false, 'Solo los algoritmos adaptativos mejoran con listas ordenadas.'],
                                    ['O(log n)', false, 'No divide la entrada.'],
                                    ['O(1)', false, 'Ordenar requiere al menos mirar los datos.'],
                                ]],
                                ['q' => '¿Qué propiedad le falta a Selection Sort respecto a Bubble Sort?', 'type' => 'single', 'answers' => [
                                    ['La estabilidad', true, 'Selection Sort puede alterar el orden de elementos iguales.'],
                                    ['La complejidad O(n²)', false, 'Ambos la tienen en el peor caso.'],
                                    ['El uso de memoria O(1)', false, 'Ambos son in-place.'],
                                    ['La comparación de elementos', false, 'Ambos comparan elementos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'insertion-sort',
                        'title' => 'Insertion Sort',
                        'type' => 'code_challenge',
                        'duration' => 13,
                        'blocks' => [
                            ['h', 'Insertion Sort'],
                            ['p', 'Insertion Sort construye la lista ordenada elemento a elemento: toma cada nuevo elemento y lo inserta en la posición correcta dentro de la parte ya ordenada, desplazando los mayores a la derecha.'],
                            ['p', 'Es el algoritmo que usamos de forma natural al ordenar cartas en la mano. Su mejor caso es O(n) con datos casi ordenados, lo que lo hace muy útil como ordenamiento adaptativo o híbrido.'],
                            ['code', 'python', <<<'PY'
def insertion_sort(lista):
    for i in range(1, len(lista)):
        actual = lista[i]
        j = i - 1
        while j >= 0 and lista[j] > actual:
            lista[j + 1] = lista[j]
            j -= 1
        lista[j + 1] = actual
    return lista

print(insertion_sort([5, 2, 9, 1]))
PY],
                            ['h', 'Características'],
                            ['list', [
                                'Complejidad: O(n²) peor caso, O(n) mejor caso',
                                'Memoria: O(1), in-place',
                                'Estable: preserva el orden de los iguales',
                                'Excelente para listas pequeñas o casi ordenadas',
                            ]],
                            ['p', 'Muchos ordenamientos avanzados lo usan como base: cuando la recursión deja particiones pequeñas, Insertion Sort las remata más rápido que seguir dividiendo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Inserta cada elemento en su lugar dentro de lo ya ordenado',
                                'O(n) con datos casi ordenados: es adaptativo',
                                'Estable e in-place',
                                'Base de los híbridos de ordenamiento eficientes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿En qué situación brilla Insertion Sort?', 'type' => 'single', 'answers' => [
                                    ['Con listas pequeñas o casi ordenadas', true, 'Su coste se acerca a O(n) cuando hay poco desorden.'],
                                    ['Con listas gigantes aleatorias', false, 'Para eso conviene Merge Sort o Quick Sort.'],
                                    ['Cuando no hay suficiente memoria para el código', false, 'La memoria del código no es el criterio.'],
                                    ['Con datos binarios solamente', false, 'Ordena cualquier tipo comparable.'],
                                ]],
                                ['q' => '¿Cómo funciona la inserción de un elemento?', 'type' => 'single', 'answers' => [
                                    ['Desplaza los mayores a la derecha y coloca el elemento en el hueco', true, 'El while mueve valores hasta encontrar la posición correcta.'],
                                    ['Intercambia con el vecino hasta llegar al inicio', false, 'Eso es más parecido a Bubble Sort.'],
                                    ['Lo copia a un array nuevo', false, 'Inserta in-place sin arrays auxiliares.'],
                                    ['Lo compara solo con el primer elemento', false, 'Compara con toda la parte ordenada según haga falta.'],
                                ]],
                                ['q' => '¿Cuál es la complejidad de Insertion Sort con una lista ya ordenada?', 'type' => 'single', 'answers' => [
                                    ['O(n)', true, 'Cada elemento se compara una vez y no hay desplazamientos.'],
                                    ['O(n²)', false, 'Eso es el peor caso con la lista invertida.'],
                                    ['O(n log n)', false, 'Nunca alcanza ese orden.'],
                                    ['O(1)', false, 'Debe recorrer los elementos al menos una vez.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Ordenamiento Avanzado y Búsqueda',
                'description' => 'Divide y vencerás: Merge Sort, Quick Sort y la búsqueda binaria.',
                'lessons' => [
                    [
                        'slug' => 'merge-sort',
                        'title' => 'Merge Sort',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Merge Sort'],
                            ['p', 'Merge Sort aplica divide y vencerás: divide la lista en mitades, las ordena por separado y luego las combina. Su complejidad garantizada es O(n log n) en todos los casos.'],
                            ['p', 'La operación de mezcla compara los primeros elementos de cada mitad y toma el menor, construyendo una lista ordenada. Requiere O(n) de memoria extra para las copias temporales.'],
                            ['code', 'python', <<<'PY'
def merge_sort(lista):
    if len(lista) <= 1:
        return lista
    medio = len(lista) // 2
    izq = merge_sort(lista[:medio])
    der = merge_sort(lista[medio:])
    return mezclar(izq, der)

def mezclar(izq, der):
    resultado = []
    i = j = 0
    while i < len(izq) and j < len(der):
        if izq[i] <= der[j]:
            resultado.append(izq[i]); i += 1
        else:
            resultado.append(der[j]); j += 1
    return resultado + izq[i:] + der[j:]
PY],
                            ['h', 'Características'],
                            ['list', [
                                'Complejidad: O(n log n) garantizado en todos los casos',
                                'Memoria: O(n) extra por las copias temporales',
                                'Estable: la comparación <= preserva el orden de iguales',
                                'Determinista: el rendimiento no depende de los datos',
                            ]],
                            ['p', 'Por su estabilidad y comportamiento predecible, Merge Sort es la base del ordenamiento por defecto de Python y Java para objetos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Divide, ordena mitades y mezcla',
                                'O(n log n) garantizado',
                                'Estable, pero con O(n) de memoria extra',
                                'Ideal cuando el peor caso debe estar acotado',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué estrategia usa Merge Sort?', 'type' => 'single', 'answers' => [
                                    ['Divide y vencerás: partir, ordenar y combinar', true, 'Divide la lista en mitades y mezcla los resultados ordenados.'],
                                    ['Intercambio de adyacentes', false, 'Eso es Bubble Sort.'],
                                    ['Inserción de cada elemento en su lugar', false, 'Eso es Insertion Sort.'],
                                    ['Selección del mínimo repetida', false, 'Eso es Selection Sort.'],
                                ]],
                                ['q' => '¿Cuál es la complejidad garantizada de Merge Sort?', 'type' => 'single', 'answers' => [
                                    ['O(n log n) en todos los casos', true, 'Divide en log n niveles y mezcla n elementos en cada uno.'],
                                    ['O(n²) en el peor caso', false, 'Merge Sort nunca llega a O(n²).'],
                                    ['O(log n) en promedio', false, 'Debe procesar todos los elementos.'],
                                    ['O(1) siempre', false, 'No puede ordenar sin mirar los datos.'],
                                ]],
                                ['q' => '¿Por qué Merge Sort usa O(n) de memoria extra?', 'type' => 'single', 'answers' => [
                                    ['Por las copias temporales al dividir y mezclar', true, 'Cada nivel crea arreglos auxiliares para las mitades y el resultado.'],
                                    ['Porque guarda un índice por elemento', false, 'No necesita una estructura así.'],
                                    ['Porque duplica toda la lista cinco veces', false, 'Solo las copias de las mitades en cada nivel.'],
                                    ['Porque la recursión guarda el código completo', false, 'La pila de recursión es O(log n); las copias son O(n).'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'quick-sort',
                        'title' => 'Quick Sort',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Quick Sort'],
                            ['p', 'Quick Sort elige un pivote, particiona la lista en menores y mayores que el pivote, y ordena cada partición de forma recursiva. Es uno de los algoritmos más rápidos en la práctica.'],
                            ['p', 'Su promedio es O(n log n), pero con un mal pivote (por ejemplo, el primero en una lista ya ordenada) se degrada a O(n²). Elegir el pivote aleatorio o la mediana de tres reduce ese riesgo.'],
                            ['code', 'python', <<<'PY'
def quick_sort(lista):
    if len(lista) <= 1:
        return lista
    pivote = lista[len(lista) // 2]
    menores = [x for x in lista if x < pivote]
    iguales = [x for x in lista if x == pivote]
    mayores = [x for x in lista if x > pivote]
    return quick_sort(menores) + iguales + quick_sort(mayores)

print(quick_sort([5, 2, 9, 1]))
PY],
                            ['h', 'Características'],
                            ['list', [
                                'Promedio: O(n log n); peor caso: O(n²)',
                                'Memoria extra: O(log n) por la pila de recursión',
                                'In-place en la versión clásica con partición de Lomuto o Hoare',
                                'El pivote determina en gran medida el rendimiento',
                            ]],
                            ['p', 'La elección del pivote es la clave: pivotes que dividen la lista en mitades balanceadas producen el comportamiento óptimo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Particiona alrededor de un pivote y recursiona',
                                'Promedio O(n log n), peor caso O(n²)',
                                'El peor caso aparece con pivotes desbalanceados',
                                'Aleatorizar o tomar mediana de tres protege el rendimiento',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿De qué depende en gran medida el rendimiento de Quick Sort?', 'type' => 'single', 'answers' => [
                                    ['De la elección del pivote', true, 'Un pivote balanceado da O(n log n); uno extremo degrada a O(n²).'],
                                    ['De la memoria de la máquina', false, 'El hardware no cambia la complejidad asintótica.'],
                                    ['Del lenguaje de programación', false, 'El lenguaje afecta constantes, no el orden de crecimiento.'],
                                    ['De si los números son positivos', false, 'El signo no influye en el ordenamiento.'],
                                ]],
                                ['q' => '¿Qué sucede si Quick Sort usa como pivote el primer elemento y la lista ya está ordenada?', 'type' => 'single', 'answers' => [
                                    ['Se degrada a O(n²)', true, 'Cada partición separa un solo elemento y el resto queda desbalanceado.'],
                                    ['Sigue en O(n log n)', false, 'El pivote extremo siempre crea particiones muy desiguales.'],
                                    ['Se vuelve O(n)', false, 'Solo los algoritmos adaptativos alcanzan O(n) ahí.'],
                                    ['No ordena correctamente', false, 'Ordena, pero muy lento: el resultado es correcto.'],
                                ]],
                                ['q' => '¿Qué estrategia ayuda a evitar el peor caso de Quick Sort?', 'type' => 'single', 'answers' => [
                                    ['Pivote aleatorio o mediana de tres', true, 'Reduce la probabilidad de particiones extremas.'],
                                    ['Usar siempre el último elemento', false, 'Con datos ordenados, el último también es extremo.'],
                                    ['Ordenar primero con Bubble Sort', false, 'Añade una pasada O(n²), empeorando todo.'],
                                    ['No usar recursión', false, 'El problema no es la recursión sino el desbalanceo.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'busqueda-binaria',
                        'title' => 'Búsqueda binaria',
                        'type' => 'code_challenge',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Búsqueda binaria'],
                            ['p', 'La búsqueda binaria encuentra un elemento en una lista ordenada descartando la mitad de las opciones en cada paso: compara con el centro y decide si seguir a la izquierda o a la derecha.'],
                            ['p', 'Su complejidad es O(log n): con un millón de elementos basta con unas veinte comparaciones. Es uno de los mejores ejemplos del poder de reducir el espacio de búsqueda.'],
                            ['code', 'python', <<<'PY'
def busqueda_binaria(lista, objetivo):
    izq, der = 0, len(lista) - 1
    while izq <= der:
        medio = (izq + der) // 2
        if lista[medio] == objetivo:
            return medio
        elif lista[medio] < objetivo:
            izq = medio + 1
        else:
            der = medio - 1
    return -1

datos = [1, 3, 5, 7, 9, 11]
print(busqueda_binaria(datos, 7))  # índice 3
PY],
                            ['h', 'Requisitos y variantes'],
                            ['list', [
                                'La lista debe estar ordenada de antemano',
                                'O(log n) en el peor caso',
                                'Variantes: primer/último elemento igual, inserción ordenada',
                                'Se implementa iterativa o recursivamente',
                            ]],
                            ['p', 'Si la lista no está ordenada, la búsqueda binaria no funciona: devuelve resultados incorrectos. Por eso primero ordenas, y el coste de ordenar se compensa con búsquedas posteriores rapidísimas.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Descarta la mitad del espacio en cada paso',
                                'Requiere datos ordenados',
                                'O(log n): crecimiento de tiempo casi plano',
                                'Base de muchas estructuras como los árboles de búsqueda',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué requisito es imprescindible para la búsqueda binaria?', 'type' => 'single', 'answers' => [
                                    ['Que la lista esté ordenada', true, 'Sin orden, descartar mitades no tiene sentido.'],
                                    ['Que no haya duplicados', false, 'Los duplicados no rompen la búsqueda binaria.'],
                                    ['Que sea de números enteros', false, 'Funciona con cualquier tipo comparable.'],
                                    ['Que sea pequeña', false, 'Es justo en listas grandes donde más brilla.'],
                                ]],
                                ['q' => '¿Cuál es la complejidad de la búsqueda binaria?', 'type' => 'single', 'answers' => [
                                    ['O(log n)', true, 'Cada paso divide el espacio de búsqueda a la mitad.'],
                                    ['O(n)', false, 'Eso es la búsqueda lineal.'],
                                    ['O(n log n)', false, 'Ese es el coste de ordenar, no de buscar.'],
                                    ['O(n²)', false, 'No hace comparaciones por pares.'],
                                ]],
                                ['q' => 'Con un millón de elementos ordenados, ¿cuántas comparaciones hace como máximo la búsqueda binaria?', 'type' => 'single', 'answers' => [
                                    ['Alrededor de 20', true, 'El logaritmo base 2 de un millón es aproximadamente 20.'],
                                    ['Un millón', false, 'Eso sería una búsqueda lineal.'],
                                    ['Cien mil', false, 'La búsqueda binaria descarta mitades, no décimas.'],
                                    ['Diez', false, 'Diez comparaciones alcanzan para unos mil elementos, no un millón.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 3. SQL desde Cero
    // =====================================================================
    [
        'slug' => 'sql-desde-cero',
        'title' => 'SQL desde Cero',
        'description' => 'Aprende SQL de manera práctica. Desde SELECT básicos hasta JOINs complejos, subconsultas, índices y optimización de consultas. Ideal para cualquier estudiante de ingeniería.',
        'category' => 'bases-de-datos',
        'difficulty' => 'beginner',
        'duration_hours' => 10,
        'is_free' => true,
        'modules' => [
            [
                'title' => 'SELECT y Filtros',
                'description' => 'Consulta los datos con SELECT, filtralos con WHERE y domina los operadores.',
                'lessons' => [
                    [
                        'slug' => 'que-es-sql-y-bases-de-datos',
                        'title' => '¿Qué es SQL y las bases de datos relacionales?',
                        'type' => 'article',
                        'duration' => 12,
                        'preview' => true,
                        'blocks' => [
                            ['h', '¿Qué es SQL y las bases de datos relacionales?'],
                            ['p', 'SQL (Structured Query Language) es el lenguaje estándar para trabajar con bases de datos relacionales. Con él consultas, insertas, actualizas y borras datos de forma declarativa: describes qué quieres, no cómo hacerlo.'],
                            ['p', 'Las bases de datos relacionales organizan la información en tablas con filas y columnas, y conectan las tablas mediante claves. Es el modelo detrás de PostgreSQL, MySQL y SQLite.'],
                            ['code', 'sql', <<<'SQL'
-- Una tabla típica con columnas y filas
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    creado_en TIMESTAMP DEFAULT NOW()
);
SQL],
                            ['h', 'Conceptos clave'],
                            ['list', [
                                'Tabla: conjunto de filas con la misma estructura',
                                'Columna: un atributo con nombre y tipo',
                                'Fila (registro): una entrada concreta de datos',
                                'Clave primaria: identificador único de cada fila',
                            ]],
                            ['p', 'SQL se divide en subconjuntos: DDL define la estructura (CREATE, ALTER), DML manipula los datos (SELECT, INSERT, UPDATE, DELETE) y DCL controla permisos. El resto del curso se centrará en DML.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'SQL es declarativo: describes el resultado deseado',
                                'Las tablas guardan datos con filas y columnas',
                                'Las claves conectan tablas entre sí',
                                'DDL, DML y DCL son las familias de sentencias',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué significa que SQL sea declarativo?', 'type' => 'single', 'answers' => [
                                    ['Que describes qué datos quieres, no el procedimiento paso a paso', true, 'SQL declara el resultado y el motor decide cómo obtenerlo.'],
                                    ['Que solo sirve para borrar datos', false, 'SQL consulta, inserta, actualiza y borra.'],
                                    ['Que no necesita una base de datos', false, 'SQL opera sobre bases de datos relacionales.'],
                                    ['Que obliga a programar en un lenguaje de bajo nivel', false, 'SQL es de alto nivel y declarativo.'],
                                ]],
                                ['q' => '¿Qué es una clave primaria?', 'type' => 'single', 'answers' => [
                                    ['El identificador único de cada fila de la tabla', true, 'Garantiza que cada registro se pueda identificar sin ambigüedad.'],
                                    ['Una columna que puede ser NULL', false, 'La clave primaria no permite NULL.'],
                                    ['Un índice que acelera todas las consultas', false, 'Ayuda a acceder rápido, pero su función es identificar.'],
                                    ['Una tabla que guarda las contraseñas', false, 'Es un concepto estructural, no un almacén de secretos.'],
                                ]],
                                ['q' => '¿A qué familia pertenece la sentencia SELECT?', 'type' => 'single', 'answers' => [
                                    ['DML (Data Manipulation Language)', true, 'SELECT modifica nada; manipula la lectura de datos, dentro de DML.'],
                                    ['DDL (Data Definition Language)', false, 'DDL define estructura: CREATE, ALTER, DROP.'],
                                    ['DCL (Data Control Language)', false, 'DCL gestiona permisos: GRANT, REVOKE.'],
                                    ['TCL (Transaction Control Language)', false, 'TCL controla transacciones: COMMIT, ROLLBACK.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'primer-select',
                        'title' => 'Tu primer SELECT',
                        'type' => 'code_challenge',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Tu primer SELECT'],
                            ['p', 'SELECT es la sentencia más usada de SQL: elige columnas de una o más tablas y devuelve las filas que cumplen las condiciones. Su forma básica es SELECT columnas FROM tabla.'],
                            ['p', 'Puedes seleccionar todas las columnas con el comodín *, columnas concretas separadas por comas, y columnas calculadas con expresiones. Los alias con AS hacen los resultados más legibles.'],
                            ['code', 'sql', <<<'SQL'
-- Todas las columnas
SELECT * FROM usuarios;

-- Columnas concretas con alias
SELECT nombre, email AS correo FROM usuarios;

-- Columna calculada
SELECT nombre, LENGTH(email) AS longitud_email FROM usuarios;
SQL],
                            ['h', 'Buenas prácticas'],
                            ['list', [
                                'Evita SELECT * en producción: trae columnas innecesarias',
                                'Usa alias claros para columnas calculadas',
                                'Escribe los nombres en minúsculas y consistentes',
                                'Revisa primero la estructura con \d tabla en psql',
                            ]],
                            ['p', 'Cuanto más precisa sea tu consulta, menos datos viajan por la red y más rápido responde la base. Seleccionar solo lo necesario es una disciplina de rendimiento.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'SELECT elige columnas; FROM indica la tabla',
                                'El comodín * trae todas las columnas',
                                'Los alias con AS mejoran la legibilidad',
                                'Seleccionar solo lo necesario mejora el rendimiento',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué devuelve SELECT * FROM productos;?', 'type' => 'single', 'answers' => [
                                    ['Todas las columnas de la tabla productos', true, 'El comodín * selecciona todas las columnas.'],
                                    ['Solo la columna productos', false, 'Las columnas se listan por nombre; * las trae todas.'],
                                    ['La tabla llamada SELECT', false, 'SELECT es la sentencia, no un nombre de tabla.'],
                                    ['Un error porque falta el WHERE', false, 'WHERE es opcional; sin él se devuelven todas las filas.'],
                                ]],
                                ['q' => '¿Para qué sirve un alias AS en una consulta?', 'type' => 'single', 'answers' => [
                                    ['Para renombrar columnas o expresiones en el resultado', true, 'AS da un nombre legible a la salida.'],
                                    ['Para borrar una columna', false, 'Para borrar se usa ALTER TABLE DROP COLUMN.'],
                                    ['Para acelerar la consulta', false, 'Los alias son cosméticos, no afectan al plan de ejecución.'],
                                    ['Para crear una tabla nueva', false, 'Para crear tablas se usa CREATE TABLE.'],
                                ]],
                                ['q' => '¿Por qué se recomienda evitar SELECT * en producción?', 'type' => 'single', 'answers' => [
                                    ['Porque trae columnas innecesarias y consume más recursos', true, 'Seleccionar solo lo necesario reduce red y memoria.'],
                                    ['Porque el comodín no funciona en PostgreSQL', false, 'Funciona perfectamente; es cuestión de buenas prácticas.'],
                                    ['Porque siempre devuelve un error', false, 'No devuelve errores; es válido sintácticamente.'],
                                    ['Porque obliga a escribir más código', false, 'Es justo al revés: SELECT * es más corto.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'filtros-where-y-operadores',
                        'title' => 'Filtros con WHERE y operadores',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Filtros con WHERE y operadores'],
                            ['p', 'WHERE filtra las filas que cumplan una condición. Sin él, SELECT devuelve toda la tabla; con él, la consulta se centra en el subconjunto relevante.'],
                            ['p', 'Los operadores de comparación (=, !=, <, >, <=, >=) y los lógicos (AND, OR, NOT) se combinan para expresar condiciones complejas. ILIKE busca texto sin distinguir mayúsculas.'],
                            ['code', 'sql', <<<'SQL'
SELECT nombre, precio
FROM productos
WHERE precio > 100
  AND categoria_id = 3
  AND nombre ILIKE '%pro%';
SQL],
                            ['h', 'Operadores útiles'],
                            ['list', [
                                '= != < > <= >= para comparar valores',
                                'AND, OR, NOT para combinar condiciones',
                                'ILIKE / LIKE para búsquedas de texto con % y _',
                                'IN, BETWEEN, IS NULL para casos frecuentes',
                            ]],
                            ['p', 'Ten cuidado con NULL: comparar con = nunca da verdadero frente a NULL; se usa IS NULL o IS NOT NULL. Este detalle causa muchos errores en consultas reales.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'WHERE filtra antes de devolver resultados',
                                'AND y OR combinan condiciones con precedencia clara',
                                'NULL no se compara con =; se usa IS NULL',
                                'ILIJE(LIKE) permite búsquedas flexibles de texto',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace la cláusula WHERE?', 'type' => 'single', 'answers' => [
                                    ['Filtra las filas que cumplen la condición indicada', true, 'Reduce el conjunto de resultados a las filas que la cumplen.'],
                                    ['Ordena los resultados de la consulta', false, 'Para ordenar se usa ORDER BY.'],
                                    ['Agrupa filas por una columna', false, 'Para agrupar se usa GROUP BY.'],
                                    ['Une dos tablas', false, 'Para unir se usan los JOIN.'],
                                ]],
                                ['q' => '¿Cómo se comprueba si una columna tiene valor nulo?', 'type' => 'single', 'answers' => [
                                    ['Con IS NULL o IS NOT NULL', true, 'NULL no es un valor comparable con =, por eso existen estos operadores.'],
                                    ['Con = NULL', false, 'La comparación con NULL nunca es verdadera.'],
                                    ['Con == NULL', false, 'SQL no usa == y tampoco compara NULL así.'],
                                    ['Con LIKE \'NULL\'', false, 'LIKE busca texto, no el estado nulo.'],
                                ]],
                                ['q' => '¿Qué condición seleccionaría productos de la categoría 3 que cuesten más de 100?', 'type' => 'single', 'answers' => [
                                    ['WHERE categoria_id = 3 AND precio > 100', true, 'Ambas condiciones deben cumplirse a la vez con AND.'],
                                    ['WHERE categoria_id = 3 OR precio > 100', false, 'OR aceptaría productos de otra categoría con precio alto.'],
                                    ['WHERE categoria_id != 3 AND precio < 100', false, 'Invierte ambas condiciones.'],
                                    ['WHERE categoria_id = 3 OR precio < 100', false, 'Mezcla condiciones incorrectas.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Relaciones y JOINs',
                'description' => 'Conecta tablas con claves foráneas y combina sus datos con JOIN.',
                'lessons' => [
                    [
                        'slug' => 'llaves-primarias-y-foraneas',
                        'title' => 'Llaves primarias y foráneas',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Llaves primarias y foráneas'],
                            ['p', 'La llave primaria identifica de forma única cada fila de una tabla. La llave foránea es una columna que apunta a la primaria de otra tabla, creando la relación entre ambas.'],
                            ['p', 'Gracias a las llaves foráneas no duplicas datos: un pedido guarda el id del cliente en vez de copiar sus datos. Esto se llama normalización y evita inconsistencias.'],
                            ['code', 'sql', <<<'SQL'
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    total NUMERIC(10,2) NOT NULL
);
SQL],
                            ['h', 'Tipos de relaciones'],
                            ['list', [
                                'Uno a muchos: un cliente tiene muchos pedidos',
                                'Muchos a muchos: estudiantes y cursos, vía tabla puente',
                                'Uno a uno: un perfil por usuario',
                            ]],
                            ['p', 'Las restricciones de integridad referencial protegen los datos: no puedes crear un pedido de un cliente inexistente, y borrar un cliente con pedidos requiere decidir qué hacer con ellos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La primaria identifica; la foránea relaciona',
                                'Las foráneas evitan duplicar información',
                                'Existen relaciones 1:N, N:M y 1:1',
                                'La integridad referencial protege la consistencia',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué papel cumple una llave foránea?', 'type' => 'single', 'answers' => [
                                    ['Apuntar a la primaria de otra tabla para relacionarlas', true, 'La foránea conecta filas entre tablas.'],
                                    ['Identificar de forma única cada fila', false, 'Esa es la función de la llave primaria.'],
                                    ['Acelerar todas las consultas automáticamente', false, 'Las foráneas no son índices automáticos de rendimiento.'],
                                    ['Guardar contraseñas cifradas', false, 'No tiene relación con el cifrado.'],
                                ]],
                                ['q' => '¿Qué relación describe que un cliente tenga muchos pedidos?', 'type' => 'single', 'answers' => [
                                    ['Uno a muchos (1:N)', true, 'Un cliente se relaciona con muchos pedidos.'],
                                    ['Muchos a muchos (N:M)', false, 'N:M exige una tabla puente y ambos lados múltiples.'],
                                    ['Uno a uno (1:1)', false, '1:1 une una fila con exactamente otra.'],
                                    ['Ninguna, no es válida', false, 'Es una de las relaciones más comunes en bases de datos.'],
                                ]],
                                ['q' => '¿Qué garantiza la integridad referencial?', 'type' => 'single', 'answers' => [
                                    ['Que las referencias entre tablas apunten a filas existentes', true, 'Imposibilita huérfanos como un pedido sin cliente.'],
                                    ['Que las contraseñas estén cifradas', false, 'Eso es seguridad de datos, no integridad referencial.'],
                                    ['Que las consultas sean rápidas', false, 'El rendimiento lo gestionan índices y planes, no las claves.'],
                                    ['Que los nombres estén en mayúsculas', false, 'No tiene que ver con formatos de texto.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'joins-inner-y-left',
                        'title' => 'JOINs: INNER y LEFT',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'JOINs: INNER y LEFT'],
                            ['p', 'Los JOIN combinan filas de dos tablas según una condición de relación. INNER JOIN devuelve solo las filas que coinciden en ambas; LEFT JOIN devuelve todas las de la izquierda y las coincidencias de la derecha, con NULL si no hay.'],
                            ['p', 'Elegir el JOIN correcto cambia el resultado: si quieres clientes aunque no tengan pedidos, necesitas LEFT JOIN; si solo clientes con pedidos, INNER JOIN.'],
                            ['code', 'sql', <<<'SQL'
-- Solo clientes con al menos un pedido
SELECT c.nombre, p.total
FROM clientes c
INNER JOIN pedidos p ON p.cliente_id = c.id;

-- Todos los clientes, con o sin pedidos
SELECT c.nombre, p.total
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id;
SQL],
                            ['h', 'Cómo se lee un JOIN'],
                            ['list', [
                                'ON define la condición de emparejamiento',
                                'INNER: solo coincidencias en ambas tablas',
                                'LEFT: conserva todas las filas de la tabla izquierda',
                                'Los alias de tabla (c, p) acortan la escritura',
                            ]],
                            ['p', 'Un error típico es olvidar la condición ON o usar condiciones amplias que multiplican filas. Revisa siempre cuántas filas esperas devolver.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'INNER JOIN excluye filas sin coincidencia',
                                'LEFT JOIN conserva la tabla izquierda completa',
                                'ON establece la condición de relación',
                                'El JOIN correcto depende del resultado que necesitas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué devuelve un INNER JOIN entre clientes y pedidos?', 'type' => 'single', 'answers' => [
                                    ['Solo los clientes que tienen al menos un pedido', true, 'Exige coincidencia en ambas tablas.'],
                                    ['Todos los clientes, tengan o no pedidos', false, 'Eso es lo que devuelve LEFT JOIN.'],
                                    ['Los pedidos sin cliente', false, 'Un INNER JOIN omite las filas huérfanas.'],
                                    ['Una copia de ambas tablas completas', false, 'Combina según la condición ON, no copia todo.'],
                                ]],
                                ['q' => '¿Cuándo conviene LEFT JOIN?', 'type' => 'single', 'answers' => [
                                    ['Cuando necesitas conservar todas las filas de la tabla izquierda', true, 'Las sin coincidencia aparecen con NULL a la derecha.'],
                                    ['Cuando quieres descartar filas sin pareja', false, 'Eso es INNER JOIN.'],
                                    ['Cuando quieres fusionar tres tablas', false, 'El número de tablas no define el tipo de JOIN.'],
                                    ['Cuando una tabla está vacía', false, 'Si está vacía, LEFT JOIN devuelve NULLs; no es la razón para elegirlo.'],
                                ]],
                                ['q' => '¿Qué sucede con un cliente sin pedidos en un LEFT JOIN?', 'type' => 'single', 'answers' => [
                                    ['Aparece en el resultado con valores NULL en las columnas de pedidos', true, 'La fila izquierda se conserva y la derecha queda vacía.'],
                                    ['Desaparece del resultado', false, 'Desaparecer es lo que pasa en un INNER JOIN.'],
                                    ['Rompe la consulta con un error', false, 'Es un comportamiento válido, no un error.'],
                                    ['Se duplica por cada pedido', false, 'Se duplicaría con pedidos; sin ellos, aparece una vez con NULL.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'joins-multiples-y-self',
                        'title' => 'JOINs múltiples y self JOIN',
                        'type' => 'code_challenge',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'JOINs múltiples y self JOIN'],
                            ['p', 'Puedes encadenar varios JOIN para combinar tres o más tablas, conectando cada una por su relación. También puedes unir una tabla consigo misma (self JOIN) para comparar filas dentro de ella.'],
                            ['p', 'Un ejemplo clásico de self JOIN es una tabla de empleados donde cada uno tiene un jefe que también es empleado. Con dos alias de la misma tabla se obtiene la jerarquía.'],
                            ['code', 'sql', <<<'SQL'
-- Tres tablas: pedidos -> clientes -> paises
SELECT p.id, c.nombre, pa.nombre AS pais
FROM pedidos p
INNER JOIN clientes c ON c.id = p.cliente_id
INNER JOIN paises pa ON pa.id = c.pais_id;

-- Self JOIN: empleados y su jefe
SELECT e.nombre AS empleado, j.nombre AS jefe
FROM empleados e
LEFT JOIN empleados j ON j.id = e.jefe_id;
SQL],
                            ['h', 'Consejos con varios JOIN'],
                            ['list', [
                                'Aliasa cada tabla para evitar ambigüedades',
                                'Une paso a paso: verifica cada JOIN por separado',
                                'Cuidado con la multiplicación de filas (producto cartesiano)',
                                'Usa LEFT JOIN para conservar la tabla principal',
                            ]],
                            ['p', 'Cada JOIN mal planteado puede multiplicar filas de forma silenciosa. Antes de ejecutar, piensa cuántas filas esperas; si el resultado es enorme, revisa la condición ON.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los JOIN se encadenan con la condición correspondiente',
                                'El self JOIN usa dos alias de la misma tabla',
                                'Los alias evitan columnas ambiguas',
                                'Verifica el conteo de filas para detectar productos cartesianos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un self JOIN?', 'type' => 'single', 'answers' => [
                                    ['Unir una tabla consigo misma usando dos alias', true, 'Permite comparar filas dentro de la misma tabla.'],
                                    ['Unir dos tablas con el mismo nombre', false, 'La misma tabla se referencia dos veces con alias distintos.'],
                                    ['Una consulta sin FROM', false, 'Todo JOIN necesita tablas de origen.'],
                                    ['Un JOIN que se ejecuta solo', false, 'No es automatismo; es unir una tabla consigo misma.'],
                                ]],
                                ['q' => '¿Para qué sirve un ejemplo típico de self JOIN con empleados?', 'type' => 'single', 'answers' => [
                                    ['Para obtener la jerarquía jefe-empleado dentro de la misma tabla', true, 'Cada empleado apunta a otro de la misma tabla como jefe.'],
                                    ['Para unir empleados con clientes', false, 'Eso sería JOIN entre tablas distintas.'],
                                    ['Para duplicar la tabla de empleados', false, 'El objetivo es relacionar, no duplicar.'],
                                    ['Para borrar empleados repetidos', false, 'Los JOIN no borran filas.'],
                                ]],
                                ['q' => '¿Qué riesgo aparece al encadenar varios JOIN sin cuidar la condición ON?', 'type' => 'single', 'answers' => [
                                    ['Multiplicar filas de forma silenciosa (producto cartesiano)', true, 'Combinar sin condición empareja cada fila con todas las demás.'],
                                    ['Que la base de datos se apague', false, 'No ocurre; solo resultados incorrectos o lentos.'],
                                    ['Que las columnas desaparezcan', false, 'Las columnas siguen ahí; el problema es de emparejamiento.'],
                                    ['Que los datos se cifren', false, 'Los JOIN no cifran nada.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Agregaciones y Orden',
                'description' => 'Ordena, limita y resume datos con funciones de agregación, GROUP BY y HAVING.',
                'lessons' => [
                    [
                        'slug' => 'order-by-y-limit',
                        'title' => 'ORDER BY y LIMIT',
                        'type' => 'code_challenge',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'ORDER BY y LIMIT'],
                            ['p', 'ORDER BY ordena los resultados por una o más columnas, en orden ascendente (ASC) o descendente (DESC). LIMIT recorta la cantidad de filas devueltas, ideal para paginar o ver lo primero de una lista.'],
                            ['p', 'La combinación clásica es ordenar y luego limitar: los 5 productos más caros, los últimos pedidos, la página 2 de resultados.'],
                            ['code', 'sql', <<<'SQL'
-- Los 5 productos más caros
SELECT nombre, precio
FROM productos
ORDER BY precio DESC
LIMIT 5;

-- Paginación: página 2 con 10 por página
SELECT * FROM productos
ORDER BY id
LIMIT 10 OFFSET 10;
SQL],
                            ['h', 'Detalles importantes'],
                            ['list', [
                                'ASC es el orden por defecto; DESC invierte',
                                'Puedes ordenar por varias columnas: ORDER BY a, b DESC',
                                'LIMIT sin OFFSET devuelve las primeras filas',
                                'OFFSET salta filas para paginar',
                            ]],
                            ['p', 'Sin ORDER BY, el orden de las filas no está garantizado: la base devuelve lo que quiera. Si el resultado debe ser estable, ordena siempre de forma explícita.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'ORDER BY fija el orden de los resultados',
                                'DESC para mayor a menor; ASC para menor a mayor',
                                'LIMIT limita filas; OFFSET salta filas',
                                'Sin ORDER BY el orden no está garantizado',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué consulta devuelve los 3 productos más baratos?', 'type' => 'single', 'answers' => [
                                    ['SELECT * FROM productos ORDER BY precio ASC LIMIT 3;', true, 'ASC de menor a mayor y LIMIT 3 recorta el top 3.'],
                                    ['SELECT * FROM productos ORDER BY precio DESC LIMIT 3;', false, 'DESC devuelve los más caros, no los más baratos.'],
                                    ['SELECT * FROM productos LIMIT 3;', false, 'Sin ORDER BY no hay garantía de que sean los más baratos.'],
                                    ['SELECT * FROM productos ORDER BY nombre LIMIT 3;', false, 'Ordenar por nombre no selecciona por precio.'],
                                ]],
                                ['q' => '¿Para qué sirve OFFSET en una consulta?', 'type' => 'single', 'answers' => [
                                    ['Para saltar un número de filas, útil en paginación', true, 'Con LIMIT 10 OFFSET 10 obtienes la segunda página.'],
                                    ['Para sumar valores numéricos', false, 'Sumar es cosa de SUM.'],
                                    ['Para eliminar filas duplicadas', false, 'Los duplicados se tratan con DISTINCT o GROUP BY.'],
                                    ['Para desactivar el ORDER BY', false, 'No tiene ese efecto.'],
                                ]],
                                ['q' => '¿Por qué conviene usar ORDER BY si el orden importa?', 'type' => 'single', 'answers' => [
                                    ['Porque sin ORDER BY la base puede devolver filas en cualquier orden', true, 'El orden natural no está garantizado por el estándar.'],
                                    ['Porque ORDER BY acelera las consultas', false, 'Puede incluso ralentizarlas; su función es ordenar.'],
                                    ['Porque ORDER BY es obligatorio en todas las consultas', false, 'Es opcional y solo se usa cuando el orden importa.'],
                                    ['Porque sin él la consulta falla', false, 'Es válida; simplemente no garantiza orden.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'funciones-de-agregacion',
                        'title' => 'Funciones de agregación',
                        'type' => 'code_challenge',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Funciones de agregación'],
                            ['p', 'Las funciones de agregación resumen muchas filas en un solo valor: COUNT cuenta, SUM suma, AVG promedia, MAX y MIN encuentran extremos. Son la base de las estadísticas sobre datos.'],
                            ['p', 'COUNT(*) cuenta filas; COUNT(columna) cuenta valores no nulos. SUM y AVG ignoran NULL por defecto, lo que evita sesgos en los totales.'],
                            ['code', 'sql', <<<'SQL'
SELECT COUNT(*)          AS total_pedidos,
       SUM(total)        AS ingresos_totales,
       AVG(total)        AS ticket_promedio,
       MAX(total)        AS pedido_mas_alto,
       MIN(total)        AS pedido_mas_bajo
FROM pedidos;
SQL],
                            ['h', 'Detalles prácticos'],
                            ['list', [
                                'COUNT(*) cuenta todas las filas',
                                'SUM y AVG ignoran los NULL',
                                'Los alias dan nombres legibles a los totales',
                                'Las agregaciones sin GROUP BY resumen toda la tabla',
                            ]],
                            ['p', 'Cuando combinas agregaciones con columnas normales sin GROUP BY, la consulta es inválida en la mayoría de los motores. Ese es el tema de la siguiente lección.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'COUNT, SUM, AVG, MAX y MIN resumen datos',
                                'COUNT(*) cuenta filas; COUNT(col) cuenta no nulos',
                                'SUM y AVG ignoran NULL',
                                'Sin GROUP BY, la agregación cubre toda la tabla',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué devuelve COUNT(*) en una tabla de pedidos?', 'type' => 'single', 'answers' => [
                                    ['El número total de filas de la tabla', true, 'Cuenta todas las filas, incluidas las que tienen NULL.'],
                                    ['La suma de los totales de los pedidos', false, 'Sumar totales es SUM(total).'],
                                    ['El número de columnas', false, 'Cuenta filas, no columnas.'],
                                    ['El pedido con mayor total', false, 'Eso es MAX(total).'],
                                ]],
                                ['q' => '¿Qué hace AVG(total) cuando hay pedidos con NULL en total?', 'type' => 'single', 'answers' => [
                                    ['Ignora los NULL y promedia solo los valores presentes', true, 'SUM y AVG descartan NULL de forma predeterminada.'],
                                    ['Cuenta los NULL como cero', false, 'No los convierte en cero; los omite.'],
                                    ['Devuelve un error', false, 'Es un comportamiento definido, no un error.'],
                                    ['Devuelve siempre NULL', false, 'Solo devuelve NULL si no hay valores no nulos.'],
                                ]],
                                ['q' => '¿Qué consulta da el ingreso total de todos los pedidos?', 'type' => 'single', 'answers' => [
                                    ['SELECT SUM(total) FROM pedidos;', true, 'SUM suma los valores de la columna total.'],
                                    ['SELECT COUNT(total) FROM pedidos;', false, 'COUNT cuenta cuántos hay, no suma.'],
                                    ['SELECT MAX(total) FROM pedidos;', false, 'MAX devuelve el mayor valor, no el total.'],
                                    ['SELECT AVG(total) FROM pedidos;', false, 'AVG promedia; necesitas la sumatoria completa.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'group-by-y-having',
                        'title' => 'GROUP BY y HAVING',
                        'type' => 'code_challenge',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'GROUP BY y HAVING'],
                            ['p', 'GROUP BY agrupa las filas por los valores de una o más columnas y permite calcular agregaciones por grupo: total por cliente, promedio por categoría, cantidad por año.'],
                            ['p', 'HAVING filtra los grupos ya agregados, igual que WHERE filtra filas individuales. La diferencia es clave: WHERE se aplica antes del agrupamiento y HAVING después.'],
                            ['code', 'sql', <<<'SQL'
-- Total gastado por cliente, solo los que superan 500
SELECT cliente_id, SUM(total) AS gasto
FROM pedidos
GROUP BY cliente_id
HAVING SUM(total) > 500
ORDER BY gasto DESC;
SQL],
                            ['h', 'Errores frecuentes'],
                            ['list', [
                                'Seleccionar columnas normales sin agruparlas',
                                'Filtrar agregados con WHERE en vez de HAVING',
                                'Olvidar que HAVING puede usar funciones agregadas',
                                'Agrupar por más columnas de las necesarias',
                            ]],
                            ['p', 'La regla de oro: las columnas del SELECT que no son agregaciones deben aparecer en el GROUP BY. Violarla genera resultados inválidos o impredecibles según el motor.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'GROUP BY crea grupos para agregar',
                                'HAVING filtra grupos; WHERE filtra filas',
                                'Las columnas del SELECT deben agruparse o agregarse',
                                'Con GROUP BY se abre la puerta a reportes potentes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace GROUP BY cliente_id en una consulta de pedidos?', 'type' => 'single', 'answers' => [
                                    ['Agrupa los pedidos por cliente para calcular agregaciones por grupo', true, 'Cada grupo reúne los pedidos de un cliente.'],
                                    ['Ordena los clientes por nombre', false, 'Ordenar es ORDER BY.'],
                                    ['Filtra clientes duplicados', false, 'Filtra datos, no agrupa para agregar.'],
                                    ['Une la tabla de clientes', false, 'Unir tablas es JOIN.'],
                                ]],
                                ['q' => '¿Cuál es la diferencia entre WHERE y HAVING?', 'type' => 'single', 'answers' => [
                                    ['WHERE filtra filas antes de agrupar; HAVING filtra grupos después', true, 'Ese orden de aplicación define su uso.'],
                                    ['Son exactamente iguales', false, 'Se aplican en momentos distintos del procesamiento.'],
                                    ['WHERE solo sirve con JOIN', false, 'WHERE sirve siempre; HAVING está ligado al agrupamiento.'],
                                    ['HAVING solo filtra por columnas de texto', false, 'HAVING suele filtrar por agregados numéricos.'],
                                ]],
                                ['q' => '¿Qué consulta lista las categorías con más de 10 productos?', 'type' => 'single', 'answers' => [
                                    ['SELECT categoria_id, COUNT(*) FROM productos GROUP BY categoria_id HAVING COUNT(*) > 10;', true, 'Agrupa por categoría y filtra los grupos con más de 10.'],
                                    ['SELECT categoria_id, COUNT(*) FROM productos WHERE COUNT(*) > 10 GROUP BY categoria_id;', false, 'WHERE no puede usar agregaciones; eso es HAVING.'],
                                    ['SELECT categoria_id FROM productos HAVING COUNT(*) > 10;', false, 'Falta GROUP BY para que el HAVING tenga sentido.'],
                                    ['SELECT * FROM productos WHERE categoria_id > 10;', false, 'Compara ids, no cuenta productos por categoría.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
