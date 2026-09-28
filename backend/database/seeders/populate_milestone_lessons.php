<?php

require __DIR__ . '/../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Lesson;

echo "=== Poblando lecciones con contenido técnico didáctico de alta calidad ===\n";

$lessonsData = [
    // -------------------------------------------------------------
    // LÓGICA Y PENSAMIENTO COMPUTACIONAL
    // -------------------------------------------------------------
    579 => [
        'content' => "## ¿Qué es un Algoritmo?

Un algoritmo es una secuencia finita, ordenada y no ambigua de pasos e instrucciones que resuelven un problema o ejecutan una tarea computacional.

```
Entrada (Input) ──> [ Procesamiento Algorítmico ] ──> Salida (Output)
```

### Propiedades Fundamentales de todo Algoritmo
1. **Finitud:** Debe terminar después de un número finito de pasos. Un bucle infinito no es un algoritmo válido.
2. **Definición y Precisión:** Cada paso debe estar definido sin ambigüedades. Las operaciones deben ser exactas.
3. **Entrada definida:** Cero o más datos proporcionados al inicio.
4. **Salida comprobable:** Uno o más resultados directamente relacionados con las entradas.
5. **Efectividad:** Cada instrucción debe ser lo suficientemente básica para que una computadora pueda ejecutarla en un tiempo finito.

> **Regla de oro de ingeniería:** Antes de escribir una sola línea de código, debes ser capaz de explicar la solución paso a paso en lenguaje natural (pseudocódigo). Si no puedes explicarlo paso a paso, no puedes programarlo.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    580 => [
        'content' => "## Diagramas de Flujo y Representación Gráfica

Los diagramas de flujo permiten visualizar la arquitectura lógica de un algoritmo antes de codificarlo, identificando bifurcaciones complejas y bucles redundantes.

### Simbología Estándar (ISO 5807)
* **Óvalo / Rectángulo redondeado:** Inicio o Fin del algoritmo.
* **Rectángulo:** Proceso u operación (asignación, cálculo matemático).
* **Rombo:** Decisión condicional (pregunta lógica que bifurca en ramas *Sí* o *No*).
* **Paralelogramo:** Entrada o Salida de datos (lectura de teclado o impresión en pantalla).
* **Líneas de flujo:** Flechas que indican el orden estricto de ejecución.

### Buenas Prácticas al Diseñar Flujos
1. Todo flujo debe iniciar arriba o a la izquierda y fluir hacia abajo o a la derecha.
2. Cada rombo de decisión debe tener etiquetadas claramente sus salidas (`True` / `False`).
3. Evita cruce de líneas; usa conectores circulares si la lógica se ramifica demasiado.
4. Mantén los bloques con una única responsabilidad clara.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    581 => [
        'content' => "## Operadores Booleanos y Tablas de Verdad

La lógica computacional se fundamenta en el álgebra de Boole: evaluar proposiciones que solo pueden ser `True` (Verdadero, 1) o `False` (Falso, 0).

### Operadores Fundamentales
* **AND (Conjunción):** `A and B` es verdadero **únicamente** si ambos operandos son verdaderos.
* **OR (Disyunción):** `A or B` es verdadero si **al menos uno** de los operandos es verdadero.
* **NOT (Negación):** `not A` invierte el valor de verdad.

### Reto Práctico
Implementa la función `puede_acceder(edad, tiene_pase, es_vip)` que determine si un usuario puede ingresar a una zona restringida:
* Si es VIP, puede entrar sin importar su edad ni su pase.
* Si no es VIP, debe ser mayor de edad (>= 18) **Y** tener pase activo.",
        'starter_code' => "def puede_acceder(edad: int, tiene_pase: bool, es_vip: bool) -> bool:\n    \"\"\"\n    Determina si un usuario tiene autorización de acceso.\n    \"\"\"\n    # TODO: Retorna True o False aplicando lógica booleana\n    pass\n\n# Pruebas manuales:\nprint(puede_acceder(20, True, False))   # True\nprint(puede_acceder(16, True, False))   # False\nprint(puede_acceder(15, False, True))   # True (es VIP)\n",
        'solution' => "def puede_acceder(edad: int, tiene_pase: bool, es_vip: bool) -> bool:\n    return es_vip or (edad >= 18 and tiene_pase)\n",
        'test_cases' => [
            ['input' => '20, True, False', 'expected' => 'True'],
            ['input' => '16, True, False', 'expected' => 'False'],
            ['input' => '15, False, True', 'expected' => 'True'],
            ['input' => '18, True, False', 'expected' => 'True'],
            ['input' => '18, False, False', 'expected' => 'False']
        ],
        'hint' => "Usa el operador 'or' para el caso VIP y agrupa con paréntesis '(edad >= 18 and tiene_pase)'.",
    ],

    582 => [
        'content' => "## Condicionales Anidados y Múltiples Caminos Lógicos

El exceso de condicionales anidados (`if` dentro de `if` dentro de `if`) genera el antipatrón conocido como **Código Piramidal (Arrow Anti-pattern)**, que dificulta la lectura y aumenta la complejidad ciclomática.

### La Técnica de Cláusulas de Guarda (Guard Clauses)
En lugar de anidar niveles profundos, valida las condiciones de error o salida rápida al inicio de la función (Early Return):

```python
# ANTIPATRÓN: Pirámide de anidamiento
def procesar_pago_malo(usuario, monto):
    if usuario is not None:
        if usuario.activo:
            if usuario.saldo >= monto:
                return ejecutar_cobro(usuario, monto)
            else:
                return 'Saldo insuficiente'
        else:
            return 'Usuario inactivo'
    return 'Usuario nulo'

# BUENA PRÁCTICA: Guard Clauses
def procesar_pago_limpio(usuario, monto):
    if not usuario:
        return 'Usuario nulo'
    if not usuario.activo:
        return 'Usuario inactivo'
    if usuario.saldo < monto:
        return 'Saldo insuficiente'
    
    return ejecutar_cobro(usuario, monto)
```

> **Beneficio:** Cada nivel de indentación eliminado reduce la carga cognitiva para entender y depurar la lógica.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    583 => [
        'content' => "## Bucles de Control: Mientras vs Para

Los bucles permiten repetir un bloque de código. La elección correcta depende de la condición de parada:
* **Bucle `for`:** Se utiliza cuando se conoce de antemano el número de iteraciones o se recorre una colección finita.
* **Bucle `while`:** Se utiliza cuando la repetición depende de una condición dinámica que cambia durante la ejecución.

### Reto Práctico
Implementa la función `serie_fibonacci(n)` que retorne una lista con los primeros `n` números de la serie de Fibonacci: `[0, 1, 1, 2, 3, 5, 8, ...]`
* Si `n <= 0`, retorna `[]`.
* Si `n == 1`, retorna `[0]`.
* Si `n == 2`, retorna `[0, 1]`.",
        'starter_code' => "def serie_fibonacci(n: int) -> list[int]:\n    \"\"\"\n    Genera los primeros n números de Fibonacci usando un bucle iterativo.\n    \"\"\"\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    \n    secuencia = [0, 1]\n    # TODO: Usa un bucle for o while para completar hasta n números\n    \n    return secuencia\n\n# Prueba:\nprint(serie_fibonacci(7)) # [0, 1, 1, 2, 3, 5, 8]\n",
        'solution' => "def serie_fibonacci(n: int) -> list[int]:\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    secuencia = [0, 1]\n    for _ in range(2, n):\n        secuencia.append(secuencia[-1] + secuencia[-2])\n    return secuencia\n",
        'test_cases' => [
            ['input' => '1', 'expected' => '[0]'],
            ['input' => '2', 'expected' => '[0, 1]'],
            ['input' => '5', 'expected' => '[0, 1, 1, 2, 3]'],
            ['input' => '7', 'expected' => '[0, 1, 1, 2, 3, 5, 8]']
        ],
        'hint' => "En cada iteración, el nuevo número es la suma de los dos últimos: secuencia[-1] + secuencia[-2].",
    ],

    584 => [
        'content' => "## Quiz Formativo: Pensamiento Lógico

Pon a prueba tu comprensión de estructuras de control, álgebra booleana y diseño de algoritmos eficaces.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    // -------------------------------------------------------------
    // PYTHON ESTRUCTURADO
    // -------------------------------------------------------------
    585 => [
        'content' => "## Definición de Funciones, Parámetros y Retornos

En desarrollo profesional con Python, las funciones deben tener **una única responsabilidad**, documentación clara y tipado estático opcional (`Type Hints`).

```python
def calcular_descuento(precio: float, porcentaje: float = 0.10) -> float:
    \"\"\"
    Calcula el precio final aplicando un porcentaje de descuento.

    Args:
        precio: Precio original del producto en COP o USD.
        porcentaje: Fracción de descuento (por defecto 10%).

    Returns:
        Precio con descuento aplicado.
    \"\"\"
    if precio < 0 or not (0 <= porcentaje <= 1):
        raise ValueError('Valores de precio o descuento inválidos.')
    return round(precio * (1 - porcentaje), 2)
```

### Reglas de Diseño Limpio
1. **Funciones puras:** Con los mismos argumentos de entrada, siempre devuelven la misma salida y no producen efectos secundarios en variables externas.
2. **Número de parámetros:** Procura mantener un máximo de 3 a 4 parámetros. Si requieres más, agrúpalos en un diccionario o `dataclass`.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    586 => [
        'content' => "## Alcance de Variables: Local vs Global y Closures

El alcance (*Scope*) define en qué partes del programa es accesible un identificador. Python resuelve las variables usando la regla **LEGB**:
1. **L (Local):** Nombres asignados dentro de una función o lambda.
2. **E (Enclosing):** Nombres en funciones contenedoras (cierres o *closures*).
3. **G (Global):** Nombres asignados en el nivel superior del módulo o con la palabra clave `global`.
4. **B (Built-in):** Nombres predefinidos en Python (`print`, `len`, `range`).

### ¿Qué es un Closure?
Una función interna que recuerda y conserva acceso al entorno donde fue creada, incluso después de que la función externa haya finalizado:

```python
def crear_multiplicador(factor: int):
    def multiplicador(numero: int) -> int:
        return numero * factor  # 'factor' proviene del scope exterior
    return multiplicador

doble = crear_multiplicador(2)
print(doble(15)) # 30
```",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    587 => [
        'content' => "## Reto: Refactorización Modular de Scripts

Un error común al iniciar es escribir scripts planos donde los datos, la lógica de cálculo y la presentación están mezclados en el script global.

### Objetivo del Reto
Implementa una función `analizar_temperaturas(registros)` que reciba una lista de temperaturas en grados Celsius y retorne un diccionario con:
* `\"promedio\"`: La media aritmética redondeada a 2 decimales.
* `\"maxima\"`: La temperatura más alta.
* `\"minima\"`: La temperatura más baja.
* Si la lista está vacía, retorna `None`.",
        'starter_code' => "def analizar_temperaturas(registros: list[float]) -> dict | None:\n    \"\"\"\n    Calcula estadísticas básicas de una serie de temperaturas.\n    \"\"\"\n    if not registros:\n        return None\n    \n    # TODO: Calcula promedio, máxima y mínima\n    promedio = round(sum(registros) / len(registros), 2)\n    maxima = max(registros)\n    minima = min(registros)\n    \n    return {\n        \"promedio\": promedio,\n        \"maxima\": maxima,\n        \"minima\": minima\n    }\n\n# Prueba:\nprint(analizar_temperaturas([22.5, 25.0, 19.5, 31.0]))\n",
        'solution' => "def analizar_temperaturas(registros: list[float]) -> dict | None:\n    if not registros:\n        return None\n    return {\n        \"promedio\": round(sum(registros) / len(registros), 2),\n        \"maxima\": max(registros),\n        \"minima\": min(registros)\n    }\n",
        'test_cases' => [
            ['input' => '[20.0, 20.0, 20.0]', 'expected' => "{'promedio': 20.0, 'maxima': 20.0, 'minima': 20.0}"],
            ['input' => '[10.0, 20.0, 30.0]', 'expected' => "{'promedio': 20.0, 'maxima': 30.0, 'minima': 10.0}"],
            ['input' => '[]', 'expected' => 'None']
        ],
        'hint' => "Recuerda validar si la lista está vacía al principio con 'if not registros: return None'.",
    ],

    588 => [
        'content' => "## Colecciones Indexadas: Listas y Comprensiones

Las listas en Python son arreglos dinámicos en memoria contigua que ofrecen acceso por índice en tiempo constante `O(1)`.

### List Comprehensions (Comprensiones de Lista)
Sintaxis idiomática y rápida para transformar y filtrar elementos:

```python
# Sintaxis tradicional
cuadrados_pares = []
for x in range(10):
    if x % 2 == 0:
        cuadrados_pares.append(x ** 2)

# Pythonico con List Comprehension
cuadrados_pares = [x ** 2 for x in range(10) if x % 2 == 0]
```

### Operaciones Clave y Complejidad
* `lista[i]` (Acceso por índice): `O(1)`
* `lista.append(x)` (Inserción al final amortizada): `O(1)`
* `lista.insert(0, x)` (Inserción al inicio, requiere desplazar): `O(n)`
* `x in lista` (Búsqueda lineal): `O(n)`",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    589 => [
        'content' => "## Mapeos Asociativos: Diccionarios para Modelar Entidades

Los diccionarios en Python son tablas hash (*Hash Maps*) que asocian claves únicas con valores. Ofrecen búsquedas e inserciones promedio en tiempo `O(1)`.

### Métodos Esenciales
* `dict.get(key, default)`: Evita `KeyError` si la clave no existe.
* `dict.setdefault(key, default)`: Inserta un valor si la clave no existe y la retorna.
* `dict.items()`: Itera tuplas `(clave, valor)` eficientemente.

```python
estudiantes = [
    {\"nombre\": \"Lucía\", \"materia\": \"Algoritmos\", \"nota\": 4.5},
    {\"nombre\": \"Carlos\", \"materia\": \"Algoritmos\", \"nota\": 3.8},
    {\"nombre\": \"Ana\", \"materia\": \"Bases de Datos\", \"nota\": 4.9}
]

# Agrupar notas por materia
notas_por_materia = {}
for e in estudiantes:
    notas_por_materia.setdefault(e[\"materia\"], []).append(e[\"nota\"])
```",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    590 => [
        'content' => "## Evaluación de Estructuras Compuestas

Valida tus conocimientos sobre listas, tuplas, conjuntos (`set`) y diccionarios en Python.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    // -------------------------------------------------------------
    // ESTRUCTURAS DE DATOS LINEALES Y COMPLEJIDAD
    // -------------------------------------------------------------
    591 => [
        'content' => "## Complejidad Temporal: Notación Big-O

La notación Big-O describe cómo escala el tiempo de ejecución de un algoritmo conforme el tamaño de la entrada `n` crece hacia el infinito.

```
Operaciones
 ^
 |             O(n!)  O(2^n)    O(n²)
 |               |      |        /
 |               |      |       /     O(n log n)
 |               |      |      /     /
 |               |      |     /     /    O(n)
 |               |      |    /     /    /
 |               |      |   /     /    /    O(log n)
 |               |      |  /     /    /    /
 |               |      | /     /    /    /  O(1)
 +-------------------------------------------------> Entrada (n)
```

### Clasificación de Complejidades
* **O(1) Constante:** El tiempo no varía con la entrada (ej. acceder a un índice de array).
* **O(log n) Logarítmica:** El problema se divide a la mitad en cada paso (ej. Búsqueda binaria).
* **O(n) Lineal:** El tiempo crece proporcionalmente a la entrada (ej. recorrer una lista).
* **O(n log n) Casi-lineal:** Común en algoritmos de ordenamiento óptimos (MergeSort, QuickSort promedio).
* **O(n²) Cuadrática:** Bucles anidados sobre la misma entrada (ej. BubbleSort). Evitar en producción con grandes volúmenes de datos.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    592 => [
        'content' => "## Comparación de Algoritmos por Consumo de Memoria

Así como medimos el tiempo, la **Complejidad Espacial** mide cuánta memoria adicional requiere un algoritmo para resolver un problema.

### Memoria Auxiliar vs Espacio de Entrada
* **Algoritmos In-Place (Espacio O(1)):** Modifican la estructura existente sin crear copias (ej. invertir un array intercambiando punteros izquierda/derecha).
* **Algoritmos con Espacio O(n):** Crean nuevas estructuras proporcionales a la entrada (ej. `list(filter(...))` o duplicación de datos).

### El Costo Oculto de la Recursión
Cada llamada recursiva apila un nuevo marco de ejecución (*Stack Frame*) en la memoria de la pila de llamadas (Call Stack). Una recursión profunda de `n` niveles consume `O(n)` de memoria en el stack, arriesgando un desbordamiento de pila (*Stack Overflow*).",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    593 => [
        'content' => "## Implementación de Pilas (Stack - LIFO) con Punteros

Una **Pila (Stack)** es una estructura de datos lineal que sigue el principio **LIFO** (*Last In, First Out*: el último elemento en entrar es el primero en salir).

```
       Push (Insertar)
            |
            v
     +--------------+
     |   Dato C     | <--- Tope (Top)
     +--------------+
     |   Dato B     |
     +--------------+
     |   Dato A     | <--- Fondo (Base)
     +--------------+
```

### Operaciones Fundamentales
* `push(elemento)`: Inserta un elemento en el tope (`O(1)`).
* `pop()`: Remueve y retorna el elemento en el tope (`O(1)`).
* `peek()` o `top()`: Consulta el elemento del tope sin removerlo (`O(1)`).
* `is_empty()`: Comprueba si la pila no tiene elementos (`O(1)`).

### Casos de Uso en Ingeniería de Software
* Mecanismos de deshacer/rehacer (*Undo/Redo*) en editores de texto.
* Evaluación de expresiones matemáticas y análisis sintáctico en compiladores.
* Historial de navegación en navegadores web.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    594 => [
        'content' => "## Reto: Algoritmo de Balanceo de Paréntesis con Stack

El problema de balanceo de paréntesis (LeetCode #20: Valid Parentheses) es uno de los problemas clásicos de entrevistas técnicas y parsing de código.

### Enunciado
Dada una cadena de texto compuesta por caracteres `'('`, `')'`, `'{'`, `'}'`, `'['` y `']'`, determina si la cadena de entrada es válida:
1. Los corchetes abiertos deben cerrarse con el mismo tipo de corchetes.
2. Los corchetes abiertos deben cerrarse en el orden correcto.
3. Cada corchete de cierre tiene su correspondiente corchete de apertura previo.

### Estrategia Algorítmica con Stack
* Recorre cada carácter de la cadena.
* Si encuentras apertura (`(`, `[`, `{`), haz `push` al stack.
* Si encuentras cierre (`)`, `]`, `}`):
  - Si el stack está vacío, es inválido (cierre sin apertura).
  - Si el tope del stack no coincide con la apertura esperada, es inválido.
  - Si coincide, haz `pop()`.
* Al finalizar el recorrido, si el stack está vacío retorna `True`, de lo contrario `False`.",
        'starter_code' => "def esta_balanceado(cadena: str) -> bool:\n    \"\"\"\n    Retorna True si los parentesis, corchetes y llaves estan balanceados,\n    False en caso contrario.\n    \"\"\"\n    stack = []\n    mapa = {')': '(', ']': '[', '}': '{'}\n    \n    for char in cadena:\n        if char in mapa.values():\n            stack.append(char)\n        elif char in mapa:\n            if not stack or stack.pop() != mapa[char]:\n                return False\n                \n    return len(stack) == 0\n\n# Casos de prueba:\nprint(esta_balanceado(\"({[]})\")) # True\nprint(esta_balanceado(\"([)]\"))   # False\nprint(esta_balanceado(\"()[]{}\")) # True\n",
        'solution' => "def esta_balanceado(cadena: str) -> bool:\n    stack = []\n    mapa = {')': '(', ']': '[', '}': '{'}\n    for char in cadena:\n        if char in mapa.values():\n            stack.append(char)\n        elif char in mapa:\n            if not stack or stack.pop() != mapa[char]:\n                return False\n    return len(stack) == 0\n",
        'test_cases' => [
            ['input' => '"({[]})"', 'expected' => 'True'],
            ['input' => '"([)]"', 'expected' => 'False'],
            ['input' => '"()[]{}"', 'expected' => 'True'],
            ['input' => '"((("', 'expected' => 'False'],
            ['input' => '""', 'expected' => 'True']
        ],
        'hint' => "Usa una lista de Python como stack con .append() y .pop(). Compara los cierres con un diccionario clave:valor.",
    ],

    595 => [
        'content' => "## Quiz: Big-O y Estructuras Lineales

Comprueba tus conocimientos sobre análisis de algoritmos, complejidad asintótica y estructuras LIFO/FIFO.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    // -------------------------------------------------------------
    // DISEÑO MODULAR E INTERFACES
    // -------------------------------------------------------------
    596 => [
        'content' => "## Contratos con Interfaces vs Clases Abstractas

En diseño orientado a objetos y Clean Architecture, desacoplar implementaciones concretas mediante **contratos abstractos** es la base de la mantenibilidad.

### Interfaz vs Clase Abstracta
* **Interfaz (Interface / Protocol):** Define *QUÉ* debe hacer un objeto (métodos y firmas públicas), sin proveer ninguna implementación ni estado.
* **Clase Abstracta (Abstract Base Class):** Puede definir tanto contratos obligatorios (`@abstractmethod`) como código común reutilizable por las subclases.

```python
from abc import ABC, abstractmethod

class Notificador(ABC):
    \"\"\"Contrato abstracto: cualquier canal de notificación debe implementarlo.\"\"\"
    @abstractmethod
    def enviar(self, destinatario: str, mensaje: str) -> bool:
        pass
```",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    597 => [
        'content' => "## Inyección de Dependencias a través de Interfaces

El **Principio de Inversión de Dependencias (DIP)** establece que:
1. Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones.
2. Las abstracciones no deben depender de los detalles; los detalles deben depender de abstracciones.

```python
# Módulo de Alto Nivel dependiente solo de la abstracción Notificador
class ServicioRegistro:
    def __init__(self, notificador: Notificador):
        self.notificador = notificador  # Inyección por constructor

    def registrar_usuario(self, email: str):
        # ... lógica de negocio ...
        self.notificador.enviar(email, '¡Bienvenido a SysEngAcademy!')
```

> **Ventaja en Pruebas Unitarias:** Podemos inyectar un `MockNotificador` en los tests automatizados sin enviar correos reales ni depender de APIs de terceros.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    598 => [
        'content' => "## Reto: Implementación de Pasarela de Pago Polimórfica

### Objetivo
Crea un sistema polimórfico de pagos donde el servicio de cobro pueda operar indistintamente con Stripe o PayPal mediante un contrato común.

Implementa:
1. La clase abstracta `PasarelaPago` con el método abstracto `procesar(monto: float) -> str`.
2. Las clases concretas `StripeGateway` y `PayPalGateway` que retornen:
   - `Stripe: Cobro exitoso de \$monto`
   - `PayPal: Cobro exitoso de \$monto`
3. La función `ejecutar_transaccion(pasarela: PasarelaPago, monto: float) -> str`.",
        'starter_code' => "from abc import ABC, abstractmethod\n\nclass PasarelaPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> str:\n        pass\n\nclass StripeGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        # TODO: Implementa retorno de Stripe\n        return f\"Stripe: Cobro exitoso de \${monto}\"\n\nclass PayPalGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        # TODO: Implementa retorno de PayPal\n        return f\"PayPal: Cobro exitoso de \${monto}\"\n\ndef ejecutar_transaccion(pasarela: PasarelaPago, monto: float) -> str:\n    return pasarela.procesar(monto)\n\n# Prueba:\nprint(ejecutar_transaccion(StripeGateway(), 150.0))\nprint(ejecutar_transaccion(PayPalGateway(), 80.0))\n",
        'solution' => "from abc import ABC, abstractmethod\n\nclass PasarelaPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> str:\n        pass\n\nclass StripeGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        return f\"Stripe: Cobro exitoso de \${monto}\"\n\nclass PayPalGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        return f\"PayPal: Cobro exitoso de \${monto}\"\n\ndef ejecutar_transaccion(pasarela: PasarelaPago, monto: float) -> str:\n    return pasarela.procesar(monto)\n",
        'test_cases' => [
            ['input' => 'ejecutar_transaccion(StripeGateway(), 100.0)', 'expected' => 'Stripe: Cobro exitoso de $100.0'],
            ['input' => 'ejecutar_transaccion(PayPalGateway(), 50.0)', 'expected' => 'PayPal: Cobro exitoso de $50.0']
        ],
        'hint' => "Asegúrate de que ambas clases hereden de PasarelaPago e implementen el método procesar exactamente con la misma firma.",
    ],

    // -------------------------------------------------------------
    // ARQUITECTURA POO
    // -------------------------------------------------------------
    599 => [
        'content' => "## Separación de Lógica de Negocio y Framework

Uno de los postulados principales de **Clean Architecture** (Robert C. Martin) y **Arquitectura Hexagonal** (Alistair Cockburn) es:
> *\"La lógica de negocio de tu aplicación no debe saber nada sobre Laravel, Django, FastAPI o PostgreSQL. Tu framework es solo un detalle de entrega, no tu aplicación.\"*

```
               [ Controladores HTTP / CLI ]
                           |
                           v
               [ Casos de Uso / Servicios ]
                           |
                           v
                [ Entidades de Dominio ] <--- Núcleo Puro (Reglas de Negocio)
                           ^
                           |
               [ Adaptadores de BD / ORM ]
```

### Reglas para mantener el Dominio Puro
1. Las entidades de negocio deben ser clases planas sin heredar del ORM (ActiveRecord).
2. Las operaciones de cálculo y validación de reglas viven en métodos de dominio, no en controladores HTTP.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    600 => [
        'content' => "## Patrón Repository y Data Transfer Objects (DTOs)

### El Patrón Repository
Actúa como una colección en memoria de objetos de dominio, aislando el resto de la aplicación de los detalles específicos de persistencia (SQL, NoSQL, APIs externas).

### ¿Por qué usar DTOs?
Un **Data Transfer Object (DTO)** es un objeto simple cuya única responsabilidad es transportar datos estructurados e inmutables entre capas (por ejemplo, desde el request HTTP hacia el servicio de dominio):

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class CrearCursoDTO:
    titulo: str
    categoria_id: int
    precio: float
    duracion_horas: int
```

> **Beneficios:** Tipado fuerte estricto, autocompletado en IDEs y garantía de que los datos no sufrirán mutaciones accidentales.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    601 => [
        'content' => "## Reto: Núcleo de Gestión de Pedidos

### Objetivo
Diseña una entidad de dominio `Pedido` con reglas de negocio independientes:
* Cada pedido tiene una lista de ítems: `{\"nombre\": str, \"precio\": float, \"cantidad\": int}`.
* Método `agregar_item(nombre, precio, cantidad)`: Si el precio es <= 0 o cantidad <= 0, debe lanzar `ValueError`.
* Método `calcular_total(tasa_impuesto=0.19)`: Calcula el subtotal sumando `precio * cantidad`, aplica el porcentaje de impuesto y retorna el total redondeado a 2 decimales.",
        'starter_code' => "class Pedido:\n    def __init__(self):\n        self.items = []\n\n    def agregar_item(self, nombre: str, precio: float, cantidad: int) -> None:\n        if precio <= 0 or cantidad <= 0:\n            raise ValueError(\"Precio y cantidad deben ser positivos.\")\n        self.items.append({\"nombre\": nombre, \"precio\": precio, \"cantidad\": cantidad})\n\n    def calcular_total(self, tasa_impuesto: float = 0.19) -> float:\n        subtotal = sum(i[\"precio\"] * i[\"cantidad\"] for i in self.items)\n        return round(subtotal * (1 + tasa_impuesto), 2)\n\n# Prueba:\np = Pedido()\np.agregar_item(\"Laptop\", 1000.0, 1)\np.agregar_item(\"Mouse\", 50.0, 2)\nprint(\"Total con IVA:\", p.calcular_total(0.19)) # 1100 * 1.19 = 1309.0\n",
        'solution' => "class Pedido:\n    def __init__(self):\n        self.items = []\n    def agregar_item(self, nombre: str, precio: float, cantidad: int) -> None:\n        if precio <= 0 or cantidad <= 0:\n            raise ValueError('Precio y cantidad deben ser positivos.')\n        self.items.append({'nombre': nombre, 'precio': precio, 'cantidad': cantidad})\n    def calcular_total(self, tasa_impuesto: float = 0.19) -> float:\n        subtotal = sum(i['precio'] * i['cantidad'] for i in self.items)\n        return round(subtotal * (1 + tasa_impuesto), 2)\n",
        'test_cases' => [
            ['input' => 'p = Pedido(); p.agregar_item("A", 100.0, 1); p.calcular_total(0.19)', 'expected' => '119.0'],
            ['input' => 'p = Pedido(); p.agregar_item("A", 200.0, 2); p.calcular_total(0.0)', 'expected' => '400.0']
        ],
        'hint' => "Multiplica precio por cantidad para cada ítem en una comprensión o generador sum(...).",
    ],

    // -------------------------------------------------------------
    // GIT AVANZADO
    // -------------------------------------------------------------
    614 => [
        'content' => "## Diferencia Real entre Git Merge y Git Rebase

Tanto `git merge` como `git rebase` integran cambios de una rama en otra, pero con filosofías de historial completamente distintas.

### Git Merge (Integración No Destructiva)
* Crea un nuevo **commit de unión (Merge Commit)** con dos padres.
* Preserva la historia exacta y cronológica de cuándo se desarrollaron los commits.
* **Desventaja:** Historial en forma de telaraña (*railroad tracks*) cuando muchos desarrolladores integran ramas.

### Git Rebase (Historia Lineal y Limpia)
* Toma los commits de tu rama de funcionalidad y los *reaplica uno a uno* sobre la punta de la rama base (ej. `main`).
* Crea nuevos hashes SHA-1 para cada commit reubicado.
* **Ventaja:** Historial completamente plano y legible (ideal para `git bisect` y auditoría).

> **La Regla de Oro del Rebase:** **NUNCA** hagas rebase sobre una rama pública compartida (como `main` en producción). Solo haz rebase en tus ramas locales de trabajo antes de abrir el Pull Request.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    615 => [
        'content' => "## Git Rebase Interactivo: Squash, Reword, Drop y Fixup

El rebase interactivo (`git rebase -i`) es la herramienta para limpiar tu historial local antes de enviar tu código a revisión.

```bash
# Iniciar rebase interactivo sobre los últimos 4 commits
git rebase -i HEAD~4
```

### Comandos Clave en el Editor
* `pick`: Conservar el commit tal como está.
* `reword`: Conservar el commit pero modificar el mensaje de commit.
* `squash`: Fusionar este commit con el commit anterior e integrar sus mensajes.
* `fixup`: Igual que `squash`, pero descarta el mensaje de este commit (ideal para commits tipo \"fix typo\").
* `drop`: Eliminar por completo el commit.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    616 => [
        'content' => "## Reto: Reestructurar una Rama Caótica antes del Pull Request

En este ejercicio aprenderás a planificar y ejecutar la consolidación de un historial de desarrollo desordenado en un conjunto atómico de commits profesionales.",
        'starter_code' => "# Simulación interactiva de comandos Git\ndef verificar_estrategia_pr(commits: list[str]) -> bool:\n    \"\"\"\n    Verifica que no existan mensajes de commit de baja calidad como 'fix', 'wip' o 'typo'.\n    \"\"\"\n    mensajes_invalidos = ['wip', 'fix', 'prueba', 'arreglos', 'temp']\n    for c in commits:\n        if any(inv in c.lower() for inv in mensajes_invalidos):\n            return False\n    return True\n\n# Prueba:\nprint(verificar_estrategia_pr(['feat: agregar autenticacion JWT', 'test: pruebas unitarias'])) # True\n",
        'solution' => "def verificar_estrategia_pr(commits: list[str]) -> bool:\n    mensajes_invalidos = ['wip', 'fix', 'prueba', 'arreglos', 'temp']\n    for c in commits:\n        if any(inv in c.lower() for inv in mensajes_invalidos):\n            return False\n    return True\n",
        'test_cases' => [
            ['input' => "['feat: login', 'wip commit']", 'expected' => 'False'],
            ['input' => "['feat: login', 'test: login tests']", 'expected' => 'True']
        ],
        'hint' => "Valida que los mensajes sigan la convención de Conventional Commits (feat, fix, docs, refactor).",
    ],

    617 => [
        'content' => "## Recuperación de Commits Perdidos con Git Reflog

`git reflog` (Reference Log) es el salvavidas de todo desarrollador. Registra cada vez que la punta de `HEAD` cambia en tu repositorio local (por commit, checkout, rebase, merge o reset).

```bash
# Ver el historial de todos los movimientos de HEAD
git reflog

# Salida típica:
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# f4e5d6c HEAD@{1}: commit: feat: módulo de pagos
# 7a8b9c0 HEAD@{2}: checkout: moving from main to feature/pagos
```

### ¿Cómo Recuperar un Commit Borrado accidentalmente?
Si hiciste un `git reset --hard` no deseado:
```bash
# 1. Identifica el hash del commit en el reflog (ej. f4e5d6c)
# 2. Restaura el estado de tu rama a ese commit:
git reset --hard f4e5d6c
```",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    618 => [
        'content' => "## Depuración Binaria de Regresiones con Git Bisect

Cuando un bug aparece en producción y no sabes qué commit lo causó entre cientos de cambios, `git bisect` realiza una **búsqueda binaria** en el historial para encontrar el commit culpable en tiempo `O(log n)`.

```bash
# 1. Iniciar la sesión de búsqueda binaria
git bisect start

# 2. Marcar la versión actual como rota (bad)
git bisect bad

# 3. Indicar el último commit o tag conocido donde todo funcionaba bien
git bisect good v1.4.0

# 4. Git ubica automáticamente el commit intermedio; ejecutas tus pruebas
# Si falla:
git bisect bad
# Si pasa:
git bisect good

# 5. Git te informa el commit exacto que introdujo el error. Al finalizar:
git bisect reset
```",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    619 => [
        'content' => "## Evaluación Final: Estrategias Avanzadas en Git

Pon a prueba tu dominio de Rebase, Reflog, Bisect y resolución de conflictos complejos en equipos distribuidos.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    // -------------------------------------------------------------
    // RAG Y EMBEDDINGS
    // -------------------------------------------------------------
    623 => [
        'content' => "## ¿Qué es un Vector Embedding y Cómo Cuantifica el Significado?

Un **Vector Embedding** es una representación numérica densa de un texto (o imagen) en un espacio matemático vectorial multidimensional (frecuentemente de 1536 o 3072 dimensiones).

```
Conceptos Similares ──> Vectores Cercanos en el Espacio
'Rey' - 'Hombre' + 'Mujer' ≈ 'Reina'
```

### Propiedades Clave
1. **Semántica en Distancias:** Palabras o frases con significados similares tienen vectores que apuntan en direcciones muy cercanas.
2. **Independencia del léxico exacto:** Permite encontrar que *\"error de memoria\"* se relaciona con *\"out of memory crash\"*, aunque no compartan ninguna palabra exacta.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    624 => [
        'content' => "## Estrategias de Chunking y Preprocesamiento

Los modelos de lenguaje tienen una ventana de contexto limitada y recuperan mejor fragmentos de texto específicos que documentos enteros de 100 páginas. El proceso de dividir documentos se denomina **Chunking**.

### Estrategias de Partición
* **Fixed-size con Overlap:** Divide el texto en fragmentos de tamaño fijo (ej. 500 caracteres) con solapamiento (ej. 100 caracteres) para no cortar ideas a la mitad.
* **Semantic Chunking:** Divide el texto respetando los límites de párrafos, títulos markdown y bloques de código.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    625 => [
        'content' => "## Reto: Implementación de Similitud Coseno

La **Similitud Coseno** mide el coseno del ángulo entre dos vectores. Varía entre -1 y 1 (o 0 y 1 para vectores de embedding normalizados), donde 1 indica vectores idénticos en dirección.

$$\\text{similitud}(u, v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|} = \\frac{\\sum u_i v_i}{\\sqrt{\\sum u_i^2} \\sqrt{\\sum v_i^2}}$$

### Objetivo
Implementa la función `similitud_coseno(v1, v2)` que calcule la similitud entre dos listas de números de igual longitud. Redondea a 4 decimales.",
        'starter_code' => "import math\n\ndef similitud_coseno(v1: list[float], v2: list[float]) -> float:\n    \"\"\"\n    Calcula la similitud coseno entre dos vectores numericos.\n    \"\"\"\n    if len(v1) != len(v2) or not v1:\n        raise ValueError(\"Los vectores deben tener la misma longitud y no estar vacios.\")\n    \n    producto_punto = sum(a * b for a, b in zip(v1, v2))\n    norma_v1 = math.sqrt(sum(a * a for a in v1))\n    norma_v2 = math.sqrt(sum(b * b for b in v2))\n    \n    if norma_v1 == 0 or norma_v2 == 0:\n        return 0.0\n        \n    return round(producto_punto / (norma_v1 * norma_v2), 4)\n\n# Prueba con vectores identicos (debe dar 1.0):\nprint(similitud_coseno([1.0, 2.0, 3.0], [1.0, 2.0, 3.0]))\n# Prueba con ortogonales (debe dar 0.0):\nprint(similitud_coseno([1.0, 0.0], [0.0, 1.0]))\n",
        'solution' => "import math\ndef similitud_coseno(v1: list[float], v2: list[float]) -> float:\n    producto_punto = sum(a * b for a, b in zip(v1, v2))\n    norma_v1 = math.sqrt(sum(a * a for a in v1))\n    norma_v2 = math.sqrt(sum(b * b for b in v2))\n    if norma_v1 == 0 or norma_v2 == 0:\n        return 0.0\n    return round(producto_punto / (norma_v1 * norma_v2), 4)\n",
        'test_cases' => [
            ['input' => 'similitud_coseno([1.0, 0.0], [1.0, 0.0])', 'expected' => '1.0'],
            ['input' => 'similitud_coseno([1.0, 0.0], [0.0, 1.0])', 'expected' => '0.0']
        ],
        'hint' => "Usa sum(a * b for a, b in zip(v1, v2)) para el producto punto.",
    ],

    // -------------------------------------------------------------
    // DOCKER COMPOSE MULTISERVICIO
    // -------------------------------------------------------------
    620 => [
        'content' => "## Estructura del Archivo compose.yaml y Directivas Esenciales

Docker Compose define y ejecuta aplicaciones multicontenedor mediante un único manifiesto declarativo en formato YAML.

```yaml
services:
  api:
    build: .
    ports:
      - \"8000:8000\"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - backend-net

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: syseng_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - backend-net

volumes:
  pgdata:

networks:
  backend-net:
```",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    621 => [
        'content' => "## Persistencia con Volúmenes y Variables de Entorno Seguras

Los contenedores son efímeros por naturaleza: al eliminarse un contenedor, todos los archivos modificados dentro de su capa de escritura se destruyen.

### Tipos de Volúmenes en Docker
* **Named Volumes (`pgdata:/var/lib/...`):** Administrados directamente por el motor de Docker en `/var/lib/docker/volumes/`. Ideales para bases de datos en producción por su rendimiento y aislamiento.
* **Bind Mounts (`./src:/app`):** Mapean directamente una carpeta de tu sistema host dentro del contenedor. Ideales para recarga en caliente (*Hot Reloading*) en entornos de desarrollo local.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    622 => [
        'content' => "## Reto: Levantar Stack PHP + Postgres + Redis con Compose

En este reto validarás la sintaxis y dependencias necesarias para orquestar un backend completo con base de datos relacional y caché en memoria.",
        'starter_code' => "def validar_servicios_compose(config: dict) -> list[str]:\n    \"\"\"\n    Verifica que los servicios requeridos (app, db, redis) esten declarados.\n    \"\"\"\n    requeridos = {'app', 'db', 'redis'}\n    declarados = set(config.get('services', {}).keys())\n    faltantes = list(requeridos - declarados)\n    return sorted(faltantes)\n\n# Prueba:\nprint(validar_servicios_compose({'services': {'app': {}, 'db': {}, 'redis': {}}})) # []\n",
        'solution' => "def validar_servicios_compose(config: dict) -> list[str]:\n    requeridos = {'app', 'db', 'redis'}\n    declarados = set(config.get('services', {}).keys())\n    return sorted(list(requeridos - declarados))\n",
        'test_cases' => [
            ['input' => "{'services': {'app': {}, 'db': {}, 'redis': {}}}", 'expected' => '[]'],
            ['input' => "{'services': {'app': {}}}", 'expected' => "['db', 'redis']"]
        ],
        'hint' => "Usa operaciones de conjuntos (set) en Python para comparar los servicios requeridos con los declarados.",
    ],

    // -------------------------------------------------------------
    // ESPECIFICACIÓN SRS Y REQUERIMIENTOS
    // -------------------------------------------------------------
    626 => [
        'content' => "## Estructura de una Especificación de Requisitos de Software (SRS)

La **Especificación de Requisitos de Software (SRS)** según el estándar IEEE 830 / ISO/IEC/IEEE 29148 formaliza el acuerdo entre clientes, usuarios y el equipo de ingeniería de software.

### Clasificación FURPS+ de Requisitos
* **F - Funcionalidad (Functional):** Capacidades, características, flujos y seguridad de la aplicación.
* **U - Usabilidad (Usability):** Ergonomía, diseño centrado en el usuario, estética, accesibilidad (WCAG).
* **R - Confiabilidad (Reliability):** Tolerancia a fallos, frecuencia de caídas, capacidad de recuperación (MTTR).
* **P - Rendimiento (Performance):** Tiempos de respuesta, concurrencia, rendimiento transaccional (*throughput*).
* **S - Soporte y Mantenibilidad (Supportability):** Facilidad de prueba, escalabilidad, portabilidad.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    627 => [
        'content' => "## Diagramas de Casos de Uso y Diagramas de Secuencia UML

### Diagrama de Casos de Uso
Representa las interacciones entre los **Actores** (usuarios externos o sistemas) y las funcionalidades del sistema (Casos de Uso).
* `<<include>>`: El caso de uso base no puede completarse sin el incluido (ej. *Realizar Pago* incluye *Validar Fondos*).
* `<<extend>>`: Comportamiento opcional que se ejecuta bajo ciertas condiciones (ej. *Comprar* extendido por *Aplicar Cupón de Descuento*).

### Diagrama de Secuencia
Muestra el intercambio de mensajes entre objetos a lo largo del tiempo:
* **Líneas de vida (Lifelines):** Representan la existencia del objeto.
* **Mensajes síncronos (Flecha sólida):** El emisor espera respuesta antes de continuar.
* **Mensajes asíncronos (Flecha abierta):** Comunicación sin bloqueo.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    602 => [
        'content' => "## Estructura de Peticiones y Respuestas HTTP: Headers y Body

El protocolo HTTP/1.1 y HTTP/2 es la columna vertebral de la web moderna. Cada comunicación entre cliente y servidor se compone de dos mensajes fundamentales:

### Anatomía de una Petición (Request)
* **Start Line:** Método (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), URI (`/api/v1/cursos`) y versión (`HTTP/1.1`).
* **Headers clave:**
  - `Content-Type: application/json` (formato del cuerpo enviado).
  - `Accept: application/json` (formato esperado en la respuesta).
  - `Authorization: Bearer <token_jwt>` (credenciales de autenticación sin estado).
* **Body (Cuerpo):** Payload de datos enviados al servidor (JSON, FormData, binario).

### Anatomía de una Respuesta (Response)
* **Status Line:** Código de estado y mensaje (`HTTP/1.1 200 OK`).
* **Headers de respuesta:** `Cache-Control`, `Set-Cookie`, `Access-Control-Allow-Origin`.
* **Body:** Datos JSON serializados solicitados.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    603 => [
        'content' => "## Códigos de Estado HTTP y Buenas Prácticas

Utilizar los códigos de estado adecuados según la especificación RFC 9110 es indispensable para que los clientes frontend y consumidores de API reaccionen con precisión:

### Familias de Códigos
* **2xx (Éxito):**
  - `200 OK`: Petición exitosa estándar (GET, PUT, PATCH).
  - `201 Created`: Recurso creado exitosamente (POST). Devuelve cabecera `Location` o el recurso en el body.
  - `204 No Content`: Petición procesada exitosamente sin contenido en el cuerpo (DELETE).
* **4xx (Errores del Cliente):**
  - `400 Bad Request`: Formato de petición inválido o malformado.
  - `401 Unauthorized`: El usuario no está autenticado (falta token o expiró).
  - `403 Forbidden`: El usuario está autenticado pero no tiene permisos para este recurso.
  - `404 Not Found`: El recurso no existe.
  - `422 Unprocessable Entity`: La petición es legible pero falla validaciones de negocio.
* **5xx (Errores del Servidor):**
  - `500 Internal Server Error`: Excepción no controlada en el backend.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    604 => [
        'content' => "## CORS, Cookies y Manejo de Sesiones sin Estado

### ¿Qué es CORS (Cross-Origin Resource Sharing)?
Mecanismo de seguridad del navegador que bloquea peticiones HTTP cross-origin a menos que el servidor devuelva las cabeceras `Access-Control-Allow-Origin` apropiadas.
* Para peticiones no simples (ej. con método `PUT` o cabecera `Authorization`), el navegador envía una petición previa de prueba (**Preflight**) con método `OPTIONS`.

### Cookies Seguras vs Tokens Bearer
* **Cookies HttpOnly & SameSite=Lax/Strict:** Mitigan ataques XSS porque JavaScript no puede acceder al token almacenado en `document.cookie`.
* **Tokens Bearer (JWT):** Ideales para aplicaciones móviles y arquitecturas desacopladas donde el cliente envía el token explícitamente en el header `Authorization`.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    605 => [
        'content' => "## Nomenclatura RESTful y Recursos Anidados

El diseño de APIs RESTful se basa en **Recursos** modelados con sustantivos en plural, nunca verbos:

```
BIEN: GET    /api/v1/cursos              (Listar cursos)
BIEN: POST   /api/v1/cursos              (Crear curso)
BIEN: GET    /api/v1/cursos/12           (Ver detalle del curso 12)
BIEN: DELETE /api/v1/cursos/12           (Eliminar curso 12)

MAL:  POST   /api/v1/crearCurso          (Antipatrón RPC)
MAL:  GET    /api/v1/obtenerCursos       (Antipatrón RPC)
```

### Recursos Anidados vs Independientes
* **Anidado (Relación de pertenencia estricta):** `/api/v1/cursos/{id}/lecciones` (las lecciones solo existen en el contexto de un curso).
* **Independiente:** Si la profundidad de anidamiento supera 2 niveles, rompe a un endpoint plano: `/api/v1/lecciones/{id}/comentarios`.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    606 => [
        'content' => "## Estrategias de Versionado y Retrocompatibilidad

El cambio es inevitable en una API en producción. El objetivo del versionado es permitir la evolución sin romper las aplicaciones existentes de los usuarios.

### Estrategias de Versionado
1. **Versionado por URI (Recomendado):** `/api/v1/cursos` y `/api/v2/cursos`. Fácil de inspeccionar, compatible con caches HTTP y CDNs.
2. **Versionado por Headers (Content Negotiation):** `Accept: application/vnd.syseng.v2+json`. URLs limpias pero más complejo de probar en navegador.

### Principios de Retrocompatibilidad
* **Cambio No Destructivo:** Agregar un nuevo campo al JSON de respuesta.
* **Cambio Destructivo (Breaking Change):** Renombrar o eliminar un campo existente, o cambiar su tipo de dato.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    607 => [
        'content' => "## Reto: Paginación Eficiente y Transformadores de Datos

### Objetivo
Implementa la función `transformar_y_paginar(usuarios, pagina, por_pagina)` que:
1. Oculte el campo sensible `\"password_hash\"` de cada usuario.
2. Divida la lista en páginas según `pagina` (1-indexed) y `por_pagina`.
3. Retorne un diccionario con:
   - `\"data\"`: La lista de usuarios transformados para la página solicitada.
   - `\"meta\"`: `{\"pagina_actual\": pagina, \"total\": len(usuarios), \"total_paginas\": ceil(...) }`.",
        'starter_code' => "import math\n\ndef transformar_y_paginar(usuarios: list[dict], pagina: int = 1, por_pagina: int = 2) -> dict:\n    \"\"\"\n    Oculta password_hash y pagina la lista de usuarios.\n    \"\"\"\n    # 1. Transformar limpiando password_hash\n    limpios = [{k: v for k, v in u.items() if k != 'password_hash'} for u in usuarios]\n    \n    # 2. Calcular índices de slicing\n    inicio = (pagina - 1) * por_pagina\n    fin = inicio + por_pagina\n    pagina_data = limpios[inicio:fin]\n    \n    total_paginas = max(1, math.ceil(len(usuarios) / por_pagina))\n    \n    return {\n        \"data\": pagina_data,\n        \"meta\": {\n            \"pagina_actual\": pagina,\n            \"total\": len(usuarios),\n            \"total_paginas\": total_paginas\n        }\n    }\n\n# Prueba:\nusuarios_test = [\n    {\"id\": 1, \"nombre\": \"Ana\", \"password_hash\": \"\\\$2y\\\$10\\\$abc\"},\n    {\"id\": 2, \"nombre\": \"Beto\", \"password_hash\": \"\\\$2y\\\$10\\\$def\"},\n    {\"id\": 3, \"nombre\": \"Carlos\", \"password_hash\": \"\\\$2y\\\$10\\\$ghi\"}\n]\nprint(transformar_y_paginar(usuarios_test, 1, 2))\n",
        'solution' => "import math\ndef transformar_y_paginar(usuarios: list[dict], pagina: int = 1, por_pagina: int = 2) -> dict:\n    limpios = [{k: v for k, v in u.items() if k != 'password_hash'} for u in usuarios]\n    inicio = (pagina - 1) * por_pagina\n    fin = inicio + por_pagina\n    return {\n        'data': limpios[inicio:fin],\n        'meta': {\n            'pagina_actual': pagina,\n            'total': len(usuarios),\n            'total_paginas': max(1, math.ceil(len(usuarios) / por_pagina))\n        }\n    }\n",
        'test_cases' => [
            ['input' => "transformar_y_paginar([{'id': 1, 'password_hash': 'x'}], 1, 10)['data'][0].get('password_hash')", 'expected' => 'None']
        ],
        'hint' => "Usa comprensión de diccionarios para filtrar la clave password_hash y slicing [inicio:fin] para paginar.",
    ],

    608 => [
        'content' => "## Flexbox a Fondo: Alineación, Distribución y Wrapping

Flexbox (CSS Flexible Box Layout) es el estándar unidimensional para alinear y distribuir espacio entre elementos en una fila o columna.

```css
.contenedor-flex {
  display: flex;
  flex-direction: row;            /* row | column */
  justify-content: space-between; /* Eje principal: flex-start, center, space-between */
  align-items: center;            /* Eje transversal: stretch, center, flex-start */
  gap: 1.5rem;                    /* Espacio moderno entre elementos */
  flex-wrap: wrap;                /* Permite saltar a la siguiente línea si no hay espacio */
}
```

### Propiedades de los Hijos (Flex Items)
* `flex-grow: 1`: El elemento se expande para ocupar el espacio libre disponible.
* `flex-shrink: 0`: Evita que el elemento se comprima si falta espacio.
* `flex-basis: 300px`: Tamaño base ideal antes de aplicar grow o shrink.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    609 => [
        'content' => "## CSS Grid: Áreas, Columnas Implícitas y minmax()

A diferencia de Flexbox (unidimensional), **CSS Grid** es un sistema bidimensional (filas y columnas simultáneas) diseñado para layouts de página completos.

### El Patrón Responsivo Definitivo sin Media Queries
```css
.grid-auto-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```
* `auto-fit`: Llena el ancho de pantalla creando tantas columnas como quepan.
* `minmax(280px, 1fr)`: Cada tarjeta mide como mínimo 280px y se estira equitativamente (`1fr`) si sobra espacio.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    610 => [
        'content' => "## Reto: Construcción de una Interfaz Tipo Dashboard Responsiva

Implementa la estructura de cálculo de layout para un dashboard interactivo que distribuya métricas en columnas dinámicas.",
        'starter_code' => "def calcular_columnas_dashboard(ancho_pantalla: int, ancho_minimo_tarjeta: int = 280) -> int:\n    \"\"\"\n    Calcula el numero maximo de columnas responsivas que caben en pantalla.\n    \"\"\"\n    if ancho_pantalla <= 0:\n        return 1\n    columnas = ancho_pantalla // ancho_minimo_tarjeta\n    return max(1, columnas)\n\n# Prueba:\nprint(calcular_columnas_dashboard(1200)) # 4 columnas\nprint(calcular_columnas_dashboard(360))  # 1 columna\n",
        'solution' => "def calcular_columnas_dashboard(ancho_pantalla: int, ancho_minimo_tarjeta: int = 280) -> int:\n    if ancho_pantalla <= 0: return 1\n    return max(1, ancho_pantalla // ancho_minimo_tarjeta)\n",
        'test_cases' => [
            ['input' => 'calcular_columnas_dashboard(1200, 280)', 'expected' => '4'],
            ['input' => 'calcular_columnas_dashboard(320, 280)', 'expected' => '1']
        ],
        'hint' => "Usa división entera // entre el ancho de pantalla y el ancho mínimo de tarjeta.",
    ],

    611 => [
        'content' => "## Uniones Discriminadas, Tipos Mapeados y keyof en TypeScript

TypeScript permite modelar estados complejos de forma segura mediante **Discriminated Unions (Uniones Etiquetadas)**:

```typescript
type EstadoPeticion<T> =
  | { estado: 'inactivo' }
  | { estado: 'cargando' }
  | { estado: 'exito'; datos: T }
  | { estado: 'error'; mensaje: string };

function renderizar(res: EstadoPeticion<string[]>) {
  switch (res.estado) {
    case 'inactivo': return 'Listo';
    case 'cargando': return 'Cargando...';
    case 'exito':    return res.datos.join(', '); // Autocompletado garantizado
    case 'error':    return `Error: \${res.mensaje}`;
  }
}
```

> **Garantía del Compilador:** Al usar un campo discriminador (`estado`), el compilador sabe exactamente qué propiedades existen dentro de cada rama del `switch` sin casteos inseguros.",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    612 => [
        'content' => "## Genéricos Reutilizables para Clientes HTTP y Estados

Los tipos genéricos permiten escribir componentes, funciones y servicios que operan sobre múltiples tipos de datos preservando la seguridad de tipos estricta:

```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface Paginado<T> {
  items: T[];
  total: number;
  pagina: number;
}

async function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return res.json();
}
```",
        'starter_code' => null,
        'solution' => null,
        'test_cases' => null,
        'hint' => null,
    ],

    613 => [
        'content' => "## Reto: Modelado con Tipado Estricto de una API Compleja

En este reto validarás la estructura de tipos discriminados para eventos de webhook en una pasarela de pagos.",
        'starter_code' => "def validar_evento_webhook(evento: dict) -> bool:\n    \"\"\"\n    Valida que el evento tenga un tipo valido y su correspondiente payload obligatorio.\n    Tipos validos: 'pago.completado' (requiere monto y transaccion_id)\n                   'pago.fallido' (requiere motivo)\n    \"\"\"\n    tipo = evento.get('tipo')\n    if tipo == 'pago.completado':\n        return 'monto' in evento and 'transaccion_id' in evento\n    elif tipo == 'pago.fallido':\n        return 'motivo' in evento\n    return False\n\n# Prueba:\nprint(validar_evento_webhook({'tipo': 'pago.completado', 'monto': 99.0, 'transaccion_id': 'tx_123'})) # True\n",
        'solution' => "def validar_evento_webhook(evento: dict) -> bool:\n    tipo = evento.get('tipo')\n    if tipo == 'pago.completado':\n        return 'monto' in evento and 'transaccion_id' in evento\n    elif tipo == 'pago.fallido':\n        return 'motivo' in evento\n    return False\n",
        'test_cases' => [
            ['input' => "{'tipo': 'pago.completado', 'monto': 10, 'transaccion_id': 'tx_1'}", 'expected' => 'True'],
            ['input' => "{'tipo': 'pago.fallido', 'motivo': 'fondos insuficientes'}", 'expected' => 'True'],
            ['input' => "{'tipo': 'desconocido'}", 'expected' => 'False']
        ],
        'hint' => "Usa sentencias if/elif evaluando la clave 'tipo' y verificando la presencia de campos obligatorios.",
    ],
];

$updatedCount = 0;
foreach ($lessonsData as $id => $data) {
    $lesson = Lesson::find($id);
    if ($lesson) {
        $lesson->content = $data['content'];
        $lesson->starter_code = $data['starter_code'];
        $lesson->solution = $data['solution'];
        $lesson->test_cases = $data['test_cases'];
        $lesson->hint = $data['hint'];
        $lesson->save();
        $updatedCount++;
        echo "  [✓] Lección #{$id} actualizada: {$lesson->title}\n";
    } else {
        echo "  [!] Lección #{$id} no encontrada en DB\n";
    }
}

echo "\nTotal lecciones enriquecidas en DB: {$updatedCount}\n";
