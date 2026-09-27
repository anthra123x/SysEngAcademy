<?php

/*
 * Ruta Fundamentos de Programación (nivel 1) — la puerta de entrada.
 * Secuencia pedagógica: primero PSeInt (pensar algoritmos sin sintaxis),
 * luego Lógica de Programación, y después práctica en Python.
 *
 * Cada módulo: 2 lecciones de documentación + 1 ejercicio ejecutable.
 * Los ejercicios en PSeInt se ejecutan en el navegador con el intérprete propio.
 */

return [
    // =====================================================================
    // 1. PSeInt desde cero
    // =====================================================================
    [
        'slug'                => 'pseint-desde-cero',
        'title'               => 'PSeInt desde cero',
        'description'         => 'Aprende a pensar como programador sin ahogarte en sintaxis. PSeInt es un lenguaje de pseudocódigo en español: describes el algoritmo con palabras como "Leer", "Escribir" y "Si", y la máquina lo ejecuta. Es el mejor punto de partida para aprender lógica de programación.',
        'category'            => 'programacion-basica',
        'language'            => 'pseint',
        'difficulty'          => 'beginner',
        'duration_hours'      => 10,
        'is_free'             => true,
        'learning_path'       => 'fundamentos-programacion',
        'learning_path_level' => 1,
        'order'               => 2,
        'modules'             => [
            [
                'title'       => 'Primeros pasos con PSeInt',
                'description' => 'La estructura de un algoritmo y las dos únicas instrucciones que necesitas para empezar.',
                'lessons'     => [
                    [
                        'slug'     => 'pseint-que-es-algoritmo',
                        'title'    => '¿Qué es un algoritmo?',
                        'type'     => 'article',
                        'duration' => 10,
                        'preview'  => true,
                        'blocks'   => [
                            ['h', 'Un algoritmo es una receta precisa'],
                            ['p', 'Un algoritmo es una secuencia ordenada y finita de pasos que resuelve un problema. La clave es que no puede tener ambigüedades: si dos personas lo siguen, deben obtener exactamente el mismo resultado. Por eso la computación es tan estricta con la lógica: un paso mal especificado produce una respuesta incorrecta sin avisar.'],
                            ['p', 'Piensa en una receta de cocina. "Agrega sal" no es un algoritmo porque no dice cuánta sal. "Agrega 5 gramos de sal" sí lo es. En programación ocurre lo mismo: las entradas deben estar clairement definidas, los pasos deben ser verificables y el resultado debe ser comprobable. Esa propiedad es lo que hace que un programa sea reutilizable y que otros puedan construir sobre él.'],
                            ['h', 'Entradas, proceso y salida'],
                            ['list', [
                                'Entradas: los datos que recibe el algoritmo y que hay que declarar (números, texto, arreglos)',
                                'Proceso: la lógica, las operaciones que se realizan con esos datos',
                                'Salida: el resultado que se produce al terminar',
                            ]],
                            ['p', 'Todo programa, por pequeño que sea, sigue esta estructura. Cuando escribas código, tenerlas presentes evita el error más común: declarar variables que nunca usas o olvidar imprimir lo que pediste.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo ejemplo
    // Entrada
    Definir nombre Cadena
    Leer nombre
    // Proceso y salida
    Escribir "Hola, ", nombre
FinAlgoritmo
PSEINT],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Un algoritmo debe ser finito: termina en algún momento',
                                'Cada paso debe ser preciso y sin ambigüedad',
                                'Estructura mínima: entradas, proceso, salida',
                            ]],
                        ],
                        'quiz'    => [
                            'title'     => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué caracteriza a un algoritmo?', 'type' => 'single', 'answers' => [
                                    ['Es una secuencia ordenada, finita y no ambigua de pasos', true, 'Exacto: la ausencia de ambigüedad es lo que garantiza un resultado correcto.'],
                                    ['Es cualquier programa escrito en un lenguaje de programación', false, 'Un algoritmo puede escribirse en lenguaje natural; el código es solo su implementación.'],
                                    ['Es una lista de pasos que puede repetirse infinitamente', false, 'Debe ser finito: si no termina, no es un algoritmo.'],
                                ]],
                                ['q' => '¿Cuáles son las tres partes de un programa?', 'type' => 'single', 'answers' => [
                                    ['Entradas, proceso y salida', true, 'Correcto: es la estructura que usaremos en todos los ejercicios.'],
                                    ['Cabcera, cuerpo y cierre', false, 'Ese es el formato del archivo, no la lógica del programa.'],
                                    ['Declaración, ejecución y retorno', false, 'No es la estructura estándar para analizar un algoritmo.'],
                                ]],
                                ['q' => '¿Por qué "Agrega sal a la olla" no es un algoritmo?', 'type' => 'single', 'answers' => [
                                    ['Porque es ambiguo: no indica cuánta sal añadir', true, 'La falta de precisión es lo que impide que sea un algoritmo.'],
                                    ['Porque usa palabras en vez de números', false, 'El pseudocódigo usa palabras legítimamente; el problema es la imprecisión.'],
                                    ['Porque no especifica un resultado final', false, 'El problema es la ambigüedad del paso, no la ausencia de resultado.'],
                                ]],
                                ['q' => '¿Qué características definen a un algoritmo? (varias correctas)', 'type' => 'multiple', 'answers' => [
                                    ['Que termina en un número acotado de pasos', true, 'Correcto: la terminación es parte de la definición.'],
                                    ['Que sus pasos están escritos en un orden fijo', true, 'También es cierto: el orden fijo hace que todos obtengan lo mismo.'],
                                    ['Que está escrito obligatoriamente en un lenguaje de programación', false, 'Un algoritmo puede describirse en lenguaje natural; el código es solo su implementación.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'pseint-estructura-y-salida',
                        'title'    => 'La estructura de un algoritmo y la salida',
                        'type'     => 'article',
                        'duration' => 12,
                        'blocks'   => [
                            ['h', 'Todo empieza con Algoritmo y termina con FinAlgoritmo'],
                            ['p', 'En PSeInt, un programa es un bloque delimitado por las palabras clave Algoritmo y FinAlgoritmo, o por Proceso y FinProceso, que son equivalentes. Dentro viven las instrucciones, una por línea. Esa pausa entre paréntesis, el punto y coma, no se escribe: PSeInt ya entiende que cada línea es una instrucción completa.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo saludo
    Escribir "Hola, mundo!"
FinAlgoritmo
PSEINT],
                            ['h', 'Escribir: mostrar resultados en pantalla'],
                            ['p', 'La instrucción Escribir muestra valores en la salida. Admite varios valores separados por comas, y los concatena sin añadir nada entre ellos. Si necesitas espacios para separar, los escribes tú dentro de las cadenas. Es un detalle pequeño que cambia por completo cómo se ve el resultado.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo imprimir
    Definir nombre Cadena
    Definir edad Enter
    Leer nombre
    Leer edad
    Escribir nombre, " tiene ", edad, " años"
FinAlgoritmo
PSEINT],
                            ['h', 'Comentarios: el código también se explica'],
                            ['p', 'Un comentario es texto que la máquina ignora y que sirve para las personas. En PSeInt se abre con dos barras y se cierra al final de la línea; también existen los comentarios de bloque, entre barras y asterisco. Documenta la intención, no la mecánica: es más útil escribir por qué haces algo que repetir lo que ya se ve.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Algoritmo y FinAlgoritmo delimitan el programa; no se cierra con punto y coma',
                                'Escribir acepta varios valores separados por comas y los une sin separador',
                                'Los comentarios empiezan con // y no afectan a la ejecución',
                            ]],
                        ],
                        'quiz'    => [
                            'title'     => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cómo se cierra un programa en PSeInt?', 'type' => 'single', 'answers' => [
                                    ['Con FinAlgoritmo', true, 'Exacto: las palabras clave delimitan el bloque.'],
                                    ['Con un punto y coma', false, 'PSeInt no usa punto y coma para cerrar el bloque.'],
                                    ['Con FinProceso únicamente', false, 'FinProceso es el equivalente a FinAlgoritmo, pero no es la única forma válida.'],
                                ]],
                                ['q' => 'Al hacer Escribir "a", 1, "b" ¿qué se muestra?', 'type' => 'single', 'answers' => [
                                    ['a1b', true, 'Los valores se concatenan sin separador.'],
                                    ['a 1 b', false, 'PSeInt no inserta espacios por su cuenta.'],
                                    ['a, 1, b', false, 'Las comas separan argumentos, no se imprimen.'],
                                ]],
                                ['q' => '¿Para qué sirve un comentario?', 'type' => 'single', 'answers' => [
                                    ['Para documentar la intención del código sin que la máquina lo ejecute', true, 'Correcto: es documentación para personas.'],
                                    ['Para ejecutar código solo en modo prueba', false, 'No hay modo prueba en PSeInt; el comentario se ignora siempre.'],
                                    ['Para reservar memoria adicional', false, 'Esa función la cumplen las declaraciones de variables.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'pseint-ejercicio-hola-mundo',
                        'title'    => 'Ejercicio: tu primer algoritmo',
                        'type'     => 'code_challenge',
                        'duration' => 12,
                        'language' => 'pseint',
                        'blocks'   => [
                            ['h', 'Qué tienes que hacer'],
                            ['p', 'Escribe un algoritmo que pida el nombre de una persona y la salude por su nombre. El enunciado es sencillo a propósito: la meta es que uses por primera vez la estructura completa de un programa, es decir, la cabecera Algoritmo, la lectura de una variable y la salida con Escribir, respetando además el punto y coma y la escritura en mayúsculas que PSeInt exige.'],
                            ['p', 'La salida esperada tiene dos palabras separadas por un espacio y un signo de exclamación. Cuando tu código coincida, el ejercicio se marcará como superado.'],
                        ],
                        'starter'  => <<<'PSEINT'
Algoritmo hola_mundo
    // 1) Declara la variable que guardará el nombre (Cadena)
    // 2) Lee el nombre con Leer
    // 3) Imprime "Hola, " seguido del nombre y un "!"
    //    Ojo: Escribir concatena sin espacios, ponlos en las cadenas.


FinAlgoritmo
PSEINT,
                        'solution' => <<<'PSEINT'
Algoritmo hola_mundo
    Definir nombre Cadena
    Leer nombre
    Escribir "Hola, ", nombre, "!"
FinAlgoritmo
PSEINT,
                        'hint'     => 'Declara la variable antes de usarla: "Definir nombre Cadena". Para imprimir el espacio, escríbelo dentro de las comillas.',
                        'tests'    => [
                            ['Ana', 'Hola, Ana!'],
                            ['Carlos', 'Hola, Carlos!'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Variables y lectura de datos',
                'description' => 'Declarar, leer y usar los datos que recibe el programa.',
                'lessons'     => [
                    [
                        'slug'     => 'pseint-definir-y-leer',
                        'title'    => 'Definir, Leer y usar: las variables',
                        'type'     => 'article',
                        'duration' => 13,
                        'blocks'   => [
                            ['h', 'Una variable es una caja con nombre'],
                            ['p', 'Para usar un dato dentro de un algoritmo primero hay que declararlo. En PSeInt la instrucción Definir crea la variable y declara su tipo: Enter para números enteros, Real para decimales, Cadena para texto, Caracter para una letra y Logico para verdadeiro o falso. Declarar el tipo correcto no es un detalle menor: determina cómo se comporta el resto de las operaciones.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo variables
    Definir edad Enter
    Definir altura Real
    Definir nombre Cadena
    Definir activo Logico

    edad <- 36
    altura <- 1.78
    nombre <- "Ada"
    activo <- Verdadero

    Escribir nombre, " tiene ", edad, " años y mide ", altura, " metros"
FinAlgoritmo
PSEINT],
                            ['h', 'Leer pide el dato al usuario'],
                            ['p', 'La instrucción Leer detiene el programa, muestra una ventana de entrada y guarda lo que la persona escriba en la variable indicada. Puedes leer varias variables en una sola línea separándolas con comas, y PSeInt irá pidiendo un valor por cada una, en orden.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo lectura
    Definir nombre Cadena
    Definir edad Enter
    Leer nombre, edad
    Escribir "Hola ", nombre, ", tienes ", edad, " años"
FinAlgoritmo
PSEINT],
                            ['h', 'Asignación con el operador flecha'],
                            ['p', 'El símbolo de asignación es una flecha con guion, se escribe <- y significa "guarda este valor en esta variable". No es lo mismo que el signo igual: el igual compara y la flecha almacena. Confundirlos es el error más habitual entre principiantes, así que conviene leer la flecha como "pon esto aquí dentro".'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Toda variable debe declararse con Definir antes de usarse',
                                'El tipo determina cómo se almacena y compara el dato',
                                'Leer puede pedir varios datos separados por comas',
                                'Se asigna con la flecha <-, nunca con el signo igual',
                            ]],
                        ],
                        'quiz'    => [
                            'title'     => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué instrucción declara una variable en PSeInt?', 'type' => 'single', 'answers' => [
                                    ['Definir', true, 'Exacto: Definir crea la variable e indica su tipo.'],
                                    ['Leer', false, 'Leer captura un dato, pero la variable debe existir antes.'],
                                    ['Escribir', false, 'Escribir muestra un resultado en pantalla.'],
                                ]],
                                ['q' => '¿Qué significa "x <- 5"?', 'type' => 'single', 'answers' => [
                                    ['Se guarda el valor 5 en la variable x', true, 'La flecha indica asignación.'],
                                    ['Compara si x es igual a 5', false, 'Para comparar se usa el signo igual simple.'],
                                    ['Imprime 5 si x es verdadero', false, 'Para mostrar valores se usa Escribir.'],
                                ]],
                                ['q' => '¿Qué tipo corresponde a un número decimal como 1.78?', 'type' => 'single', 'answers' => [
                                    ['Real', true, 'Correcto: Real admite decimales; Enter solo enteros.'],
                                    ['Enter', false, 'Enter no admite la parte decimal.'],
                                    ['Caracter', false, 'Caracter es para una sola letra.'],
                                ]],
                                ['q' => '¿Cuántos datos pide "Leer a, b, c"?', 'type' => 'single', 'answers' => [
                                    ['Tres, uno por variable en orden', true, 'Cada coma separa una lectura.'],
                                    ['Uno solo con los tres valores', false, 'PSeInt pide un valor por cada variable.'],
                                    ['Depende del tipo de las variables', false, 'La cantidad depende de las variables listadas, no de sus tipos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'pseint-tipos-y-operaciones',
                        'title'    => 'Tipos de datos y operaciones básicas',
                        'type'     => 'article',
                        'duration' => 12,
                        'blocks'   => [
                            ['h', 'Operaciones con cada tipo'],
                            ['p', 'Los números Enter y Real se suman, restan, multiplican y dividen con los operadores habituales. El asterisco multiplica, la barra divide y el asterisco seguido de igual eleva a una potencia. PSeInt incluye además el operador mod, que devuelve el resto de una división entera y resulta imprescindible al trabajar con múltiplos y números pares.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo operaciones
    Definir a Enter
    Definir b Enter
    Leer a, b
    Escribir "Suma: ", a + b
    Escribir "Resta: ", a - b
    Escribir "Producto: ", a * b
    Escribir "División: ", a / b
    Escribir "Resto: ", a mod b
    Escribir "Potencia: ", a ^ 2
FinAlgoritmo
PSEINT],
                            ['h', 'Ojo con la división entera'],
                            ['p', 'Cuando ambos operandos son Enter, la división se trunca: 7 / 2 vale 3, no 3.5. Es el comportamiento de PSeInt y coincide con la división entera de la mayoría de lenguajes. Si necesitas decimales, declara Real la variable o divide entre un valor con parte decimal. Ignorar esta regla provoca errores difíciles de detectar, porque el resultado parece correcto a simple vista.'],
                            ['h', 'Cadenas de texto'],
                            ['p', 'Las cadenas se escriben entre comillas dobles y se concatenan con el operador + o simplemente escribiéndolas una tras otra en Escribir. Los números se convierten a texto automáticamente al mezclarlos con cadenas, lo que resulta muy cómodo para construir mensajes.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo textos
    Definir nombre Cadena
    Leer nombre
    Escribir "Hola ", nombre, ", te saludamos"
FinAlgoritmo
PSEINT],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La división entre dos Enter se trunca: 7 / 2 es 3',
                                'El operador mod devuelve el resto de la división',
                                'El caret ^ eleva a una potencia',
                                'Las cadenas van entre comillas y se concatenan al escribirlas seguidas',
                            ]],
                        ],
                        'quiz'    => [
                            'title'     => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el resultado de 7 / 2 con dos valores Enter?', 'type' => 'single', 'answers' => [
                                    ['3, porque la división entera se trunca', true, 'Exacto: en PSeInt Enter / Enter devuelve Enter.'],
                                    ['3.5', false, 'Sería el caso si los operandos fueran Real.'],
                                    ['4, redondeando', false, 'PSeInt trunca, no redondea.'],
                                ]],
                                ['q' => '¿Qué devuelve 17 mod 5?', 'type' => 'single', 'answers' => [
                                    ['2, el resto de la división', true, 'Correcto: 17 = 5*3 + 2.'],
                                    ['3, el cociente', false, 'El cociente corresponde a la división entera.'],
                                    ['5, el divisor', false, 'mod devuelve el resto, no el divisor.'],
                                ]],
                                ['q' => '¿Cómo se escribe un texto en PSeInt?', 'type' => 'single', 'answers' => [
                                    ['Entre comillas dobles', true, 'Esa es la sintaxis de las cadenas.'],
                                    ['Entre apóstrofes', false, 'Los apóstrofes no se usan para cadenas.'],
                                    ['Con la palabra Texto delante', false, 'No existe esa forma en PSeInt.'],
                                ]],
                                ['q' => '¿Qué operador eleva un número a una potencia?', 'type' => 'single', 'answers' => [
                                    ['El caret ^', true, 'Correcto: 2 ^ 10 es 1024.'],
                                    ['El asterisco *', false, 'El asterisco multiplica.'],
                                    ['La palabra POT', false, 'No existe ese operador.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'pseint-ejercicio-promedio-edad',
                        'title'    => 'Ejercicio: calcula el promedio de edad',
                        'type'     => 'code_challenge',
                        'duration' => 15,
                        'language' => 'pseint',
                        'blocks'   => [
                            ['h', 'Qué tienes que hacer'],
                            ['p', 'Escribe un algoritmo que pida tres edades y muestre su promedio. El ejercicio combina tres conceptos que acabas de ver: declarar varias variables de tipo Enter, leerlas en una sola instrucción y calcular una división.'],
                            ['p', 'Cuidado con la división: si declaras las edades como Enter, el promedio también se trunca. Para mostrar un resultado con decimales tienes que declarar una variable Real para el promedio y convertir la suma, por ejemplo dividiendo entre 2.0 o declarando uno de los operandos como Real.'],
                            ['p', 'El formato de salida esperado es un número seguido de la palabra años, sin decimales cuando el resultado sea entero.'],
                        ],
                        'starter'  => <<<'PSEINT'
Algoritmo promedio_edad
    // 1) Declara las tres edades (Enter) y el promedio
    // 2) Lee las tres edades en una sola instruccion Leer
    // 3) Calcula el promedio
    // 4) Muestra el resultado


FinAlgoritmo
PSEINT,
                        'solution' => <<<'PSEINT'
Algoritmo promedio_edad
    Definir e1, e2, e3 Enter
    Definir promedio Real
    Leer e1, e2, e3
    promedio <- (e1 + e2 + e3) / 3.0
    Escribir promedio, " años"
FinAlgoritmo
PSEINT,
                        'hint'     => 'Para que la división no se trunque, divide entre 3.0 en lugar de 3. Al declarar promedio como Real puedes imprimir el valor con decimales.',
                        'tests'    => [
                            ['20 30 40', '30 años'],
                            ['18 24 30', '24 años'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Condicionales y ciclos',
                'description' => 'Tomar decisiones y repetir tareas: el corazón de cualquier algoritmo.',
                'lessons'     => [
                    [
                        'slug'     => 'pseint-condicionales',
                        'title'    => 'Si, Entonces y Sino',
                        'type'     => 'article',
                        'duration' => 14,
                        'blocks'   => [
                            ['h', 'Decidir según una condición'],
                            ['p', 'Hasta ahora nuestros algoritmos siempre ejecutaban lo mismo. La estructura Si permite ejecutar un bloque de código solo cuando una condición es verdadera, y otro distinto cuando es falsa. La condición es una expresión que se evalúa a verdadero o falso usando comparaciones como mayor que, menor que, igual o distinto, y se combinan con y y o.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo decision
    Definir edad Enter
    Leer edad
    Si edad >= 18
        Escribir "Eres mayor de edad"
    Sino
        Escribir "Eres menor de edad"
    FinSi
FinAlgoritmo
PSEINT],
                            ['h', 'La sintaxis importa'],
                            ['p', 'El condicional se cierra con FinSi, y la palabra Entonces separa la condición del bloque. Las dos formas de desigualdad que debes recordar son mayor o igual, con el signo igual pegado, y distinto, que se escribe con el signo menor seguido del mayor. Cualquier olvido de estas reglas produce un error de sintaxis que PSeInt señala con el número de línea.'],
                            ['h', 'Condiciones complejas'],
                            ['p', 'Puedes anidar condiciones para tomar decisiones más precisas, y combinar varias con y u o. Cuando la condición sea larga, conviene usar paréntesis: la prioridad de y es mayor que la de o, así que el paréntesis evita sorpresas como evaluar true or false and false de forma distinta a lo que esperabas.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo acceso
    Definir edad Enter
    Definir tiene_boleta Logico
    Leer edad, tiene_boleta
    Si edad >= 18 Y tiene_boleta
        Escribir "Acceso permitido"
    Sino
        Escribir "Acceso denegado"
    FinSi
FinAlgoritmo
PSEINT],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Si abre la estructura y FinSi la cierra; Entonces separa la condición',
                                'Sino ejecuta el bloque alternativo cuando la condición es falsa',
                                'Las condiciones se combinan con y y o, y se agrupan con paréntesis',
                            ]],
                        ],
                        'quiz'    => [
                            'title'     => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Con qué instrucción se cierra un condicional?', 'type' => 'single', 'answers' => [
                                    ['FinSi', true, 'Exacto: todo Si necesita su FinSi.'],
                                    ['FinMientras', false, 'Esa cierra un bucle mientras.'],
                                    ['FinPara', false, 'Esa cierra un bucle para.'],
                                ]],
                                ['q' => '¿Cómo se escribe "distinto de" en PSeInt?', 'type' => 'single', 'answers' => [
                                    ['Con el signo menor seguido del mayor', true, 'Correcto: es el símbolo de desigualdad.'],
                                    ['Con el signo igual y un signo de exclamación delante', false, 'Esa forma no es válida en PSeInt.'],
                                    ['Con la palabra Distinto', false, 'No existe esa palabra clave.'],
                                ]],
                                ['q' => '¿Cuándo se ejecuta el bloque Sino?', 'type' => 'single', 'answers' => [
                                    ['Cuando la condición del Si es falsa', true, 'Correcto: Sino cubre el caso contrario.'],
                                    ['Siempre, después del bloque principal', false, 'Solo se ejecuta si la condición es falsa.'],
                                    ['Nunca, es opcional e inactivo', false, 'Sino sí se ejecuta cuando corresponde.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'pseint-ciclos',
                        'title'    => 'Repetir con While y Para',
                        'type'     => 'article',
                        'duration' => 14,
                        'blocks'   => [
                            ['h', 'El bucle Para: cuando conoces las repeticiones'],
                            ['p', 'El bucle Para repite un bloque un número determinado de veces usando una variable contador. Su estructura es Para, una asignación con la flecha, el límite, la palabra Hasta y el cierre FinPara. Si el límite inicial es mayor que el final, el recorrido va hacia atrás, y por eso no hace falta indicar un paso negativo.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo contar
    Para i <- 1 Hasta 5
        Escribir "Número ", i
    FinPara
FinAlgoritmo
PSEINT],
                            ['h', 'El bucle Mientras: mientras la condición se cumpla'],
                            ['p', 'El bucle Mientras repite el bloque mientras una condición siga siendo verdadera, y termina en cuanto se vuelve falsa. Es la herramienta adecuada cuando no sabes de antemano cuántas veces hay que repetir, por ejemplo al pedir números hasta que el usuario escriba un cero.'],
                            ['code', 'pseint', <<<'PSEINT'
Algoritmo suma_hasta_cero
    Definir n Enter
    Definir suma Enter
    Leer n
    Mientras n <> 0
        suma <- suma + n
        Leer n
    FinMientras
    Escribir "La suma es ", suma
FinAlgoritmo
PSEINT],
                            ['h', 'Cuidado con los bucles infinitos'],
                            ['p', 'Un error frecuente es olvidar actualizar la condición dentro del bucle. Si el While comprueba siempre la misma variable sin cambiarla, el programa nunca terminará. La regla práctica es que dentro del cuerpo del bucle debe haber siempre una instrucción que modifique el valor de la condición, en este caso la lectura del siguiente número.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Para repite un número conocido de veces y usa un contador',
                                'Para i <- 3 Hasta 1 recorre hacia atrás sin más explicación',
                                'Mientras repite mientras la condición sea verdadera',
                                'Dentro del bucle hay que modificar lo que evalúa la condición',
                            ]],
                        ],
                        'quiz'    => [
                            'title'     => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es la diferencia entre Para y Mientras?', 'type' => 'single', 'answers' => [
                                    ['Para repite un número conocido de veces; Mientras, mientras se cumpla una condición', true, 'Correcto: esa es la diferencia esencial.'],
                                    ['Los dos hacen exactamente lo mismo', false, 'Comparten estructura pero cambian el criterio de parada.'],
                                    ['Mientras es más rápido que Para en todos los casos', false, 'No hay una diferencia de velocidad; cambia el control.'],
                                ]],
                                ['q' => '¿Qué pasa si el límite inicial es mayor que el final en un Para?', 'type' => 'single', 'answers' => [
                                    ['El contador retrocede hasta llegar al final', true, 'PSeInt invierte el sentido automáticamente.'],
                                    ['El bucle no se ejecuta nunca', false, 'Sí se ejecuta, pero hacia atrás.'],
                                    ['Se produce un error de sintaxis', false, 'Es un comportamiento válido, no un error.'],
                                ]],
                                ['q' => '¿Cuál es el error clásico en un bucle Mientras?', 'type' => 'single', 'answers' => [
                                    ['No modificar dentro del bucle lo que evalúa la condición', true, 'Exacto: eso produce un bucle infinito.'],
                                    ['Usar FinMientras en lugar de FinSi', false, 'Cada estructura tiene su cierre correcto.'],
                                    ['Declarar la variable del contador con tipo Real', false, 'El tipo del contador no provoca bucles infinitos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'pseint-ejercicio-par-impar',
                        'title'    => 'Ejercicio: par o impar',
                        'type'     => 'code_challenge',
                        'duration' => 15,
                        'language' => 'pseint',
                        'blocks'   => [
                            ['h', 'Qué tienes que hacer'],
                            ['p', 'Escribe un algoritmo que pida un número entero y muestre, uno por línea, todos los números pares que hay entre 0 y ese número, sin incluir el propio número. El ejercicio combina un bucle Para con un condicional: el bucle recorre los valores y la condición decide cuáles se imprimen.'],
                            ['p', 'Recuerda que un número es par cuando su resto al dividir entre 2 es cero, y que ese resto se obtiene con el operador mod. La salida esperada tiene un número por línea, en orden ascendente.'],
                        ],
                        'starter'  => <<<'PSEINT'
Algoritmo pares_hasta
    // 1) Declara el limite (Enter)
    // 2) Leelo
    // 3) Recorre con Para desde 0 hasta el limite - 1
    // 4) Si el numero es par, muestralo
    //    Pista: un numero es par si (numero mod 2) = 0


FinAlgoritmo
PSEINT,
                        'solution' => <<<'PSEINT'
Algoritmo pares_hasta
    Definir limite Enter
    Definir i Enter
    Leer limite
    Para i <- 0 Hasta limite - 1
        Si i mod 2 = 0
            Escribir i
        FinSi
    FinPara
FinAlgoritmo
PSEINT,
                        'hint'     => 'La condición del Si es "i mod 2 = 0". Recuerda cerrar con FinPara y FinSi en el orden correcto.',
                        'tests'    => [
                            ['6', "0\n2\n4"],
                            ['3', "0\n2"],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
