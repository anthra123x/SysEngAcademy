<?php

/*
 * Payloads de ejecución para lecciones de tipo 'code_challenge'.
 *
 * Estos datos NO viven en los archivos de cursos: se fusionan aquí por slug de
 * lección, de modo que el enunciado pedagógico y la parte ejecutable (lenguaje,
 * código inicial, solución de referencia y casos de prueba) evolucionan de forma
 * independiente.
 *
 * Formato de cada entrada:
 *   'language'  => motor de ejecución (ver App\Services\LanguageRegistry:
 *                  local = pseint | python | javascript | typescript)
 *   'starter'   => código con el que el alumno empieza en el editor
 *   'solution'  => solución de referencia (NUNCA se expone por la API)
 *   'tests'     => casos [[entrada, salida_esperada], ...] (mínimo 2)
 *   'hint'      => pista opcional
 *   'read_only' => true si no hay intérprete disponible (PHP, SQL, C, Java…)
 *
 * Uso: php database/validate_data.php
 */

return [
    // =============================================================
    // Fundamentos — PSeInt (rutas de Fundamentos y Algoritmos)
    // =============================================================
    'funciones-y-parametros' => [
        'language' => 'pseint',
        'starter'  => <<<'PSEINT'
Algoritmo funciones_y_parametros
    // 1) Declara el SubProceso o Procedimiento Saludar(nombre) que escriba "Hola, ", nombre, "!"
    // 2) Declara la variable nombre (Cadena) y léela con Leer
    // 3) Llama a Saludar(nombre)
FinAlgoritmo
PSEINT,
        'solution' => <<<'PSEINT'
Algoritmo funciones_y_parametros
    SubProceso Saludar(nombre)
        Escribir "Hola, ", nombre, "!"
    FinSubProceso

    Definir nombre Como Cadena
    Leer nombre
    Saludar(nombre)
FinAlgoritmo
PSEINT,
        'hint'     => 'Declara el procedimiento con "SubProceso Saludar(nombre)", lee el dato con "Leer nombre" y llama a "Saludar(nombre)".',
        'tests'    => [
            ['Ana', 'Hola, Ana!'],
            ['Carlos', 'Hola, Carlos!'],
        ],
    ],

    'bubble-sort' => [
        'language' => 'pseint',
        'starter'  => <<<'PSEINT'
Algoritmo bubble_sort
    // Lee 5 numeros, ordenalos de menor a mayor con bubble sort
    // y muestra el arreglo resultado.
FinAlgoritmo
PSEINT,
        'solution' => <<<'PSEINT'
Algoritmo bubble_sort
    Dimension 5
    Real a[5], aux
    Enter i, j

    Para i <- 0 Hasta 4
        Leer a[i]
    FinPara

    Para i <- 0 Hasta 3
        Para j <- 0 Hasta 3 - i
            Si a[j] > a[j + 1]
                aux <- a[j]
                a[j] <- a[j + 1]
                a[j + 1] <- aux
            FinSi
        FinPara
    FinPara

    Para i <- 0 Hasta 4
        Escribir a[i], " "
    FinPara
PSEINT,
        'hint'     => 'El bubble sort compara pares vecinos y los intercambia si están desordenados. En cada pasada quedan fijados los elementos más grandes.',
        'tests'    => [
            ['5 3 8 1 9', "1\n3\n5\n8\n9"],
            ['9 7 6 5 4', "4\n5\n6\n7\n9"],
        ],
    ],

    'selection-sort' => [
        'language' => 'pseint',
        'starter'  => <<<'PSEINT'
Algoritmo selection_sort
    // Lee 5 numeros y ordenalos de menor a mayor con selection sort.
FinAlgoritmo
PSEINT,
        'solution' => <<<'PSEINT'
Algoritmo selection_sort
    Dimension 5
    Real a[5], aux
    Enter i, j, min

    Para i <- 0 Hasta 4
        Leer a[i]
    FinPara

    Para i <- 0 Hasta 3
        min <- i
        Para j <- i + 1 Hasta 4
            Si a[j] < a[min]
                min <- j
            FinSi
        FinPara
        Si min <> i
            aux <- a[i]
            a[i] <- a[min]
            a[min] <- aux
        FinSi
    FinPara

    Para i <- 0 Hasta 4
        Escribir a[i], " "
    FinPara
PSEINT,
        'hint'     => 'Selection sort busca el menor del tramo restante y lo coloca en su posición definitiva.',
        'tests'    => [
            ['5 3 8 1 9', "1\n3\n5\n8\n9"],
            ['2 2 7 0 4', "0\n2\n2\n4\n7"],
        ],
    ],

    'insertion-sort' => [
        'language' => 'pseint',
        'starter'  => <<<'PSEINT'
Algoritmo insertion_sort
    // Lee 5 numeros y ordenalos de menor a mayor con insertion sort.
FinAlgoritmo
PSEINT,
        'solution' => <<<'PSEINT'
Algoritmo insertion_sort
    Dimension 5
    Real a[5], aux
    Enter i, j

    Para i <- 0 Hasta 4
        Leer a[i]
    FinPara

    Para i <- 1 Hasta 4
        aux <- a[i]
        j <- i - 1
        Mientras j >= 0 Y a[j] > aux
            a[j + 1] <- a[j]
            j <- j - 1
        FinMientras
        a[j + 1] <- aux
    FinPara

    Para i <- 0 Hasta 4
        Escribir a[i], " "
    FinPara
PSEINT,
        'hint'     => 'Insertion sort toma cada elemento y lo inserta en el lugar correcto dentro del tramo ya ordenado.',
        'tests'    => [
            ['5 3 8 1 9', "1\n3\n5\n8\n9"],
            ['10 4 6 2 8', "2\n4\n6\n8\n10"],
        ],
    ],

    'merge-sort' => [
        'language' => 'pseint',
        'starter'  => <<<'PSEINT'
Algoritmo merge_sort
    // Lee 5 numeros y ordenalos de menor a mayor con merge sort
    // (divide y vence: ordena mitades y fusiona).
FinAlgoritmo
PSEINT,
        'solution' => <<<'PSEINT'
SubProceso Fusionar(izq, mid, der, a, aux)
    Enter i, j, k
    i <- izq
    j <- mid + 1
    k <- izq
    Mientras i <= mid Y j <= der
        Si a[i] <= a[j]
            aux[k] <- a[i]
            i <- i + 1
        Sino
            aux[k] <- a[j]
            j <- j + 1
        FinSi
        k <- k + 1
    FinMientras
    Mientras i <= mid
        aux[k] <- a[i]
        i <- i + 1
        k <- k + 1
    FinMientras
    Mientras j <= der
        aux[k] <- a[j]
        j <- j + 1
        k <- k + 1
    FinMientras
    Para i <- izq Hasta der
        a[i] <- aux[i]
    FinPara
FinSubProceso

Algoritmo merge_sort
    Dimension 5
    Real a[5], aux[5]
    Enter izq, der, mid

    Para i <- 0 Hasta 4
        Leer a[i]
    FinPara

    Fusionar(0, 2, 4, a, aux)
    Fusionar(0, 0, 2, a, aux)
    Fusionar(3, 3, 4, a, aux)
    Fusionar(0, 1, 3, a, aux)
    Fusionar(2, 2, 4, a, aux)
    Fusionar(0, 0, 4, a, aux)

    Para i <- 0 Hasta 4
        Escribir a[i], " "
    FinPara
FinAlgoritmo
PSEINT,
        'hint'     => 'Merge sort divide el arreglo hasta llegar a sublistas de un elemento y luego fusiona comparando. La fusión va en un arreglo auxiliar.',
        'tests'    => [
            ['5 3 8 1 9', "1\n3\n5\n8\n9"],
            ['4 4 1 1 0', "0\n1\n1\n4\n4"],
        ],
    ],

    'quick-sort' => [
        'language' => 'pseint',
        'starter'  => <<<'PSEINT'
Algoritmo quick_sort
    // Lee 5 numeros y ordenalos de menor a mayor con quicksort
    // (pivot y partición).
FinAlgoritmo
PSEINT,
        'solution' => <<<'PSEINT'
SubProceso Particionar(izq, der, a, pivote)
    Enter i, j, aux
    pivote <- a[der]
    i <- izq - 1
    Para j <- izq Hasta der - 1
        Si a[j] <= pivote
            i <- i + 1
            aux <- a[i]
            a[i] <- a[j]
            a[j] <- aux
        FinSi
    FinPara
    aux <- a[i + 1]
    a[i + 1] <- a[der]
    a[der] <- aux
    Devolver i + 1
FinSubProceso

SubProceso Quicksort(izq, der, a)
    Enter p
    Si izq < der
        p <- Particionar(izq, der, a, 0)
        Quicksort(izq, p - 1, a)
        Quicksort(p + 1, der, a)
    FinSi
FinSubProceso

Algoritmo quick_sort
    Dimension 5
    Real a[5]
    Enter i

    Para i <- 0 Hasta 4
        Leer a[i]
    FinPara

    Quicksort(0, 4, a)

    Para i <- 0 Hasta 4
        Escribir a[i], " "
    FinPara
FinAlgoritmo
PSEINT,
        'hint'     => 'Quicksort elige un pivote y reordena para que a su izquierda queden los menores y a su derecha los mayores. Luego repite sobre cada mitad.',
        'tests'    => [
            ['5 3 8 1 9', "1\n3\n5\n8\n9"],
            ['7 1 6 2 8', "1\n2\n6\n7\n8"],
        ],
    ],

    'busqueda-binaria' => [
        'language' => 'pseint',
        'starter'  => <<<'PSEINT'
Algoritmo busqueda_binaria
    // El arreglo 1..100 esta ordenado. Pide un numero y responde
    // con "Encontrado en posicion N" o "No existe".
FinAlgoritmo
PSEINT,
        'solution' => <<<'PSEINT'
Algoritmo busqueda_binaria
    Dimension 100
    Enter a[100]
    Enter i, objetivo, izq, der, medio, pos

    Para i <- 0 Hasta 99
        a[i] <- i + 1
    FinPara

    Leer objetivo
    izq <- 0
    der <- 99
    pos <- -1
    Mientras izq <= der
        medio <- (izq + der) / 2
        Si a[medio] = objetivo
            pos <- medio + 1
            izq <- der + 1
        Sino
            Si a[medio] < objetivo
                izq <- medio + 1
            Sino
                der <- medio - 1
            FinSi
        FinSi
    FinMientras

    Si pos > 0
        Escribir "Encontrado en posicion ", pos
    Sino
        Escribir "No existe"
    FinSi
FinAlgoritmo
PSEINT,
        'hint'     => 'En cada paso reduces el rango a la mitad: si el objetivo es mayor que el medio, buscas solo a la derecha.',
        'tests'    => [
            ['50', 'Encontrado en posicion 50'],
            ['101', 'No existe'],
        ],
    ],

    // =============================================================
    // SQL — práctica de consulta (sin intérprete en el navegador)
    // =============================================================
    'primer-select' => [
        'language'  => 'sql',
        'read_only' => true,
        'starter'   => <<<'SQL'
-- Selecciona el nombre y el email de todos los usuarios
SELECT nombre, email
FROM usuarios
-- ORDER BY nombre;
SQL,
        'solution'  => <<<'SQL'
SELECT nombre, email
FROM usuarios
ORDER BY nombre;
SQL,
        'hint'      => 'Con SELECT nombras las columnas; con FROM indicas la tabla. ORDER BY ordena el resultado.',
        'tests'     => [
            ['consulta', 'SELECT nombre, email FROM usuarios ORDER BY nombre'],
        ],
    ],

    'filtros-where-y-operadores' => [
        'language'  => 'sql',
        'read_only' => true,
        'starter'   => <<<'SQL'
-- Muestra los cursos de nivel principiante que sean gratuitos
SELECT *
FROM cursos
-- WHERE ...;
SQL,
        'solution'  => <<<'SQL'
SELECT *
FROM cursos
WHERE nivel = 'principiante' AND gratuito = TRUE;
SQL,
        'hint'      => 'WHERE filtra filas. Combina condiciones con AND y OR; BETWEEN y IN acortan las expresiones.',
        'tests'     => [
            ['consulta', "WHERE nivel = 'principiante' AND gratuito = TRUE"],
        ],
    ],

    'joins-inner-y-left' => [
        'language'  => 'sql',
        'read_only' => true,
        'starter'   => <<<'SQL'
-- Lista los pedidos con el nombre del cliente (LEFT JOIN:
-- incluye pedidos sin cliente)
SELECT p.id, p.fecha, c.nombre
FROM pedidos p
-- JOIN clientes c ON ...;
SQL,
        'solution'  => <<<'SQL'
SELECT p.id, p.fecha, c.nombre
FROM pedidos p
LEFT JOIN clientes c ON c.id = p.cliente_id;
SQL,
        'hint'      => 'INNER JOIN solo devuelve filas que coinciden en ambos lados; LEFT JOIN mantiene las de la izquierda aunque no haya coincidencia.',
        'tests'     => [
            ['consulta', 'LEFT JOIN clientes c ON c.id = p.cliente_id'],
        ],
    ],

    'joins-multiples-y-self' => [
        'language'  => 'sql',
        'read_only' => true,
        'starter'   => <<<'SQL'
-- Muestra cada empleado junto a su jefe (self JOIN)
SELECT e.nombre, j.nombre AS jefe
FROM empleados e
-- JOIN empleados j ON ...;
SQL,
        'solution'  => <<<'SQL'
SELECT e.nombre AS empleado, j.nombre AS jefe
FROM empleados e
LEFT JOIN empleados j ON j.id = e.jefe_id;
SQL,
        'hint'      => 'Un self JOIN usa la misma tabla dos veces con alias distintos; la condición de unión apunta al superior.',
        'tests'     => [
            ['consulta', 'LEFT JOIN empleados j ON j.id = e.jefe_id'],
        ],
    ],

    'order-by-y-limit' => [
        'language'  => 'sql',
        'read_only' => true,
        'starter'   => <<<'SQL'
-- Muestra los 5 cursos mejor valorados, de mayor a menor
SELECT id, titulo, valoracion
FROM cursos
-- ORDER BY ... LIMIT ...;
SQL,
        'solution'  => <<<'SQL'
SELECT id, titulo, valoracion
FROM cursos
ORDER BY valoracion DESC
LIMIT 5;
SQL,
        'hint'      => 'ORDER BY ordena (ASC por defecto, DESC paraDescending) y LIMIT recorta el resultado. Aplica LIMIT siempre después de ORDER BY.',
        'tests'     => [
            ['consulta', 'ORDER BY valoracion DESC LIMIT 5'],
        ],
    ],

    'funciones-de-agregacion' => [
        'language'  => 'sql',
        'read_only' => true,
        'starter'   => <<<'SQL'
-- Calcula el precio medio, el maximo y el minimo de los productos
SELECT AVG(precio), MAX(precio), MIN(precio)
FROM productos
-- ;
SQL,
        'solution'  => <<<'SQL'
SELECT AVG(precio) AS precio_medio,
       MAX(precio) AS precio_max,
       MIN(precio) AS precio_min
FROM productos;
SQL,
        'hint'      => 'AVG, MAX, MIN, SUM y COUNT colapsan varias filas en un único valor agregado.',
        'tests'     => [
            ['consulta', 'AVG(precio) AS precio_medio, MAX(precio) AS precio_max, MIN(precio) AS precio_min'],
        ],
    ],

    'group-by-y-having' => [
        'language'  => 'sql',
        'read_only' => true,
        'starter'   => <<<'SQL'
-- Muestra las categorias con mas de 10 productos
SELECT categoria_id, COUNT(*) AS total
FROM productos
-- GROUP BY ...;
SQL,
        'solution'  => <<<'SQL'
SELECT categoria_id, COUNT(*) AS total
FROM productos
GROUP BY categoria_id
HAVING COUNT(*) > 10;
SQL,
        'hint'      => 'GROUP BY agrupa filas; HAVING filtra sobre los grupos ya agregados (WHERE filtra antes de agrupar).',
        'tests'     => [
            ['consulta', 'GROUP BY categoria_id HAVING COUNT(*) > 10'],
        ],
    ],

    // =============================================================
    // Java — POO con Java
    // =============================================================
    'poo-java-ejercicio-cuenta-bancaria' => [
        'language'  => 'java',
        'read_only' => true,
        'starter'   => <<<'JAVA'
public class Cuenta {
    // Declara los atributos privados: numeroCuenta (String) y saldo (double)
    
    // Implementa el constructor: Cuenta(String numeroCuenta, double saldoInicial)

    // Implementa getNumeroCuenta(), getSaldo(), depositar(double) y retirar(double)
}
JAVA,
        'solution'  => <<<'JAVA'
public class Cuenta {
    private String numeroCuenta;
    private double saldo;

    public Cuenta(String numeroCuenta, double saldoInicial) {
        this.numeroCuenta = numeroCuenta;
        this.saldo = Math.max(0.0, saldoInicial);
    }

    public String getNumeroCuenta() {
        return this.numeroCuenta;
    }

    public double getSaldo() {
        return this.saldo;
    }

    public void depositar(double monto) {
        if (monto > 0) {
            this.saldo += monto;
        }
    }

    public boolean retirar(double monto) {
        if (monto > 0 && this.saldo >= monto) {
            this.saldo -= monto;
            return true;
        }
        return false;
    }
}
JAVA,
        'hint'      => 'Asegúrate de que los atributos sean private y utiliza this para diferenciar los atributos de los parámetros en el constructor.',
        'tests'     => [
            ['Cuenta c = new Cuenta("123", 100); c.depositar(50); c.getSaldo()', '150.0'],
            ['Cuenta c = new Cuenta("123", 100); c.retirar(30); c.getSaldo()', '70.0'],
        ],
    ],

    'poo-java-ejercicio-figuras-polimorficas' => [
        'language'  => 'java',
        'read_only' => true,
        'starter'   => <<<'JAVA'
public class Figura {
    public double calcularArea() {
        return 0.0;
    }
}

// Implementa la clase Rectangulo que herede de Figura

// Implementa la clase Circulo que herede de Figura
JAVA,
        'solution'  => <<<'JAVA'
public class Figura {
    public double calcularArea() {
        return 0.0;
    }
}

class Rectangulo extends Figura {
    private double base;
    private double altura;

    public Rectangulo(double base, double altura) {
        this.base = base;
        this.altura = altura;
    }

    @Override
    public double calcularArea() {
        return this.base * this.altura;
    }
}

class Circulo extends Figura {
    private double radio;

    public Circulo(double radio) {
        this.radio = radio;
    }

    @Override
    public double calcularArea() {
        return Math.PI * this.radio * this.radio;
    }
}
JAVA,
        'hint'      => 'Recuerda utilizar extends Figura y sobreescribir el método calcularArea() con la anotación @Override.',
        'tests'     => [
            ['new Rectangulo(4, 5).calcularArea()', '20.0'],
            ['Math.round(new Circulo(3).calcularArea() * 100.0) / 100.0', '28.27'],
        ],
    ],

    'poo-java-ejercicio-notificador-interface' => [
        'language'  => 'java',
        'read_only' => true,
        'starter'   => <<<'JAVA'
public interface Notificador {
    String notificar(String mensaje);
}

// Implementa NotificadorEmail que implemente Notificador

// Implementa NotificadorSlack que implemente Notificador
JAVA,
        'solution'  => <<<'JAVA'
public interface Notificador {
    String notificar(String mensaje);
}

class NotificadorEmail implements Notificador {
    @Override
    public String notificar(String mensaje) {
        return "Email: " + mensaje;
    }
}

class NotificadorSlack implements Notificador {
    @Override
    public String notificar(String mensaje) {
        return "Slack: " + mensaje;
    }
}
JAVA,
        'hint'      => 'Utiliza la palabra clave implements Notificador en la declaración de las clases y sobreescribe notificar.',
        'tests'     => [
            ['new NotificadorEmail().notificar("Hola")', 'Email: Hola'],
            ['new NotificadorSlack().notificar("Alerta")', 'Slack: Alerta'],
        ],
    ],
];

