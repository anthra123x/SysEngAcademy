<?php

/*
 * Ruta: Desarrollo Orientado a Objetos (desarrollo-orientado-objetos)
 * 4 cursos en Python: Introducción, Clases y Herencia, SOLID, Patrones de diseño.
 * Cada módulo: 1 lección 'article' (documentación) + 1 lección 'code_challenge' (ejercicio).
 * Formato de blocks: ['h', texto] | ['p', texto] | ['code', lenguaje, texto] | ['list', [items]]
 */

return [
    // =====================================================================
    // 1. Introducción a la POO — Nivel 1
    // =====================================================================
    [
        'slug'                => 'introduccion-poo',
        'title'               => 'Introducción a la Programación Orientada a Objetos',
        'description'         => 'Da el salto del código imperativo a las clases y objetos. Entiende por qué agrupar datos y comportamiento en un mismo lugar hace que los sistemas resulten más fáciles de mantener.',
        'category'            => 'poo',
        'language'            => 'python',
        'difficulty'          => 'beginner',
        'duration_hours'      => 14,
        'is_free'             => true,
        'learning_path'       => 'desarrollo-orientado-objetos',
        'learning_path_level' => 1,
        'order'               => 1,
        'modules'             => [
            [
                'title'       => 'Del imperativo a las clases',
                'description' => 'Qué cambia cuando agrupamos datos y funciones.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-paradigma-vs-imperativo',
                        'title'    => 'Paradigma imperativo vs. orientado a objetos',
                        'type'     => 'article',
                        'duration' => 12,
                        'preview'  => true,
                        'blocks'   => [
                            ['h', 'Dos formas de organizar un programa'],
                            ['p', 'En el paradigma imperativo escribes una secuencia de instrucciones que manipulan datos sueltos. Es directo y funciona bien para problemas pequeños. El problema aparece cuando el proyecto crece: los datos y las operaciones que los usan quedan dispersos por todo el archivo.'],
                            ['p', 'La programación orientada a objetos propone otra organización: una clase agrupa los datos (atributos) y las operaciones que trabajan con esos datos (métodos). Un objeto es una instancia concreta de esa clase.'],
                            ['code', 'python', <<<'PY'
# Imperativo: datos y lógica sueltos
nombre = "Ada"
edad = 36
print(f"{nombre} tiene {edad} años")

# Orientado a objetos: datos y lógica juntos
class Persona:
    def __init__(self, nombre, edad):
        self.nombre = nombre
        self.edad = edad

    def presentar(self):
        return f"{self.nombre} tiene {self.edad} años"

print(Persona("Ada", 36).presentar())
PY],
                            ['h', 'Cuándo conviene cada uno'],
                            ['list', [
                                'Imperativo: scripts cortos, cálculo puntual, prototipos rápidos',
                                'Orientado a objetos: sistemas con entidades del dominio (usuarios, pedidos, cursos)',
                                'Los dos estilos conviven: una función libre puede llamar a un método sin problema',
                            ]],
                            ['h', 'Ideas clave'],
                            ['list', [
                                'Clase = plantilla que define atributos y métodos',
                                'Objeto = instancia concreta creada a partir de la clase',
                                'El constructor (__init__) prepara el estado inicial del objeto',
                                'self dentro de un método referencia al propio objeto',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-primera-clase',
                        'title'    => 'Ejercicio: diseña tu primera clase',
                        'type'     => 'code_challenge',
                        'duration' => 15,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea una clase Libro con:
# -titulo (string) y autor (string) como atributos
# -un metodo __init__ que los asigne
# -un metodo mostrar() que devuelva "Titulo - Autor"


PY,
                        'solution' => <<<'PY'
class Libro:
    def __init__(self, titulo, autor):
        self.titulo = titulo
        self.autor = autor

    def mostrar(self):
        return f"{self.titulo} - {self.autor}"
PY,
                        'hint'     => 'Recuerda que self se escribe como primer parametro de cada metodo (self, ...).',
                        'tests'    => [
                            ['Libro("El principito", "Saint-Exupery").mostrar()', 'El principito - Saint-Exupery'],
                            ['Libro("Dune", "Herbert").mostrar()', 'Dune - Herbert'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Atributos y métodos',
                'description' => 'Estado interno de un objeto y las operaciones sobre ese estado.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-atributos-y-metodos',
                        'title'    => 'Atributos, métodos y el papel de self',
                        'type'     => 'article',
                        'duration' => 12,
                        'blocks'   => [
                            ['h', 'Estado y comportamiento'],
                            ['p', 'Un objeto se comporta como una entidad con dos caras: los atributos guardan su estado y los métodos operan sobre ese estado. La convención de Python coloca el prefijo guion bajo para indicar que un atributo es interno.'],
                            ['code', 'python', <<<'PY'
class Coche:
    def __init__(self, marca, km):
        self.marca = marca
        self.km = km

    def avanzar(self, distancia):
        self.km += distancia
        return self.km

mi_coche = Coche("Seat", 0)
print(mi_coche.avanzar(120))  # 120
print(mi_coche.km)            # 120
PY],
                            ['h', 'self no es opcional'],
                            ['p', 'Cuando llamas a mi_coche.avanzar(120), Python pasa el objeto como primer argumento. Tu metodo debe declararlo: por eso aparece self. Olvidarlo produce el error "takes 1 positional argument but 2 were given".'],
                            ['list', [
                                'self es el objeto actual; no lo pases al llamar, Python lo hace por ti',
                                'Un metodo que no usa self podria ser una funcion suelta: reconsidera el diseño',
                                'Los atributos con guion bajo se consideran privados por convencion',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-contador',
                        'title'    => 'Ejercicio: un contador con estado',
                        'type'     => 'code_challenge',
                        'duration' => 12,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea la clase Contador con un atributo valor inicializado a 0
# y los metodos incrementar() y decrementar() que devuelven el nuevo valor.
# El metodo reiniciar() pone el valor a 0 y lo devuelve.


PY,
                        'solution' => <<<'PY'
class Contador:
    def __init__(self):
        self.valor = 0

    def incrementar(self):
        self.valor += 1
        return self.valor

    def decrementar(self):
        self.valor -= 1
        return self.valor

    def reiniciar(self):
        self.valor = 0
        return self.valor
PY,
                        'hint'     => 'Modifica el atributo con self.valor y luego devuelvelo.',
                        'tests'    => [
                            ['str(Contador().incrementar())', '1'],
                            ['str(Contador().incrementar() + Contador().incrementar())', '2'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Constructores y múltiples formas de crear objetos',
                'description' => 'init, valores por defecto yclassmethod.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-constructores',
                        'title'    => 'Constructores y formas de crear objetos',
                        'type'     => 'article',
                        'duration' => 10,
                        'blocks'   => [
                            ['h', 'El constructor'],
                            ['p', 'En Python el metodo __init__ se ejecuta automaticamente al crear el objeto con la sintaxis Clase(...). Es el lugar correcto para validar y transformar los datos de entrada.'],
                            ['code', 'python', <<<'PY'
class Producto:
    def __init__(self, nombre, precio, stock=0):
        if precio < 0:
            raise ValueError("El precio no puede ser negativo")
        self.nombre = nombre
        self.precio = precio
        self.stock = stock

# Con valor por defecto
p1 = Producto("Teclado", 45.90)
# Indicando el valor
p2 = Producto("Raton", 19.90, stock=12)
PY],
                            ['h', 'classmethod ystaticmethod'],
                            ['p', 'Un metodo de instancia recibe self y trabaja con un objeto concreto. Un classmethod recibe cls y sirve para constructores alternativos. Un staticmethod no recibe nada y agrupa utilidades relacionadas con la clase.'],
                            ['list', [
                                '__init__: inicializa cada instancia',
                                '@classmethod: metodos alternativos que crean objetos (parsear, factory)',
                                '@staticmethod: funciones auxiliares sin dependencia del estado',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-validacion',
                        'title'    => 'Ejercicio: valida en el constructor',
                        'type'     => 'code_challenge',
                        'duration' => 14,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea la clase Producto con __init__(nombre, precio, stock=0)
# que lance ValueError si el precio es negativo.
# Añade el metodo valor_total() que devuelva precio * stock


PY,
                        'solution' => <<<'PY'
class Producto:
    def __init__(self, nombre, precio, stock=0):
        if precio < 0:
            raise ValueError("precio negativo")
        self.nombre = nombre
        self.precio = precio
        self.stock = stock

    def valor_total(self):
        return self.precio * self.stock
PY,
                        'hint'     => 'Usa "if ...: raise ValueError(...)" dentro de __init__ antes de asignar.',
                        'tests'    => [
                            ['str(Producto("Teclado", 45.9, 3).valor_total())', '137.7'],
                            ['Producto("X", -1)', 'error:precio negativo'],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 2. Clases, Objetos y Herencia — Nivel 1
    // =====================================================================
    [
        'slug'                => 'clases-objetos-herencia',
        'title'               => 'Clases, Objetos y Herencia',
        'description'         => 'Herencia, polimorfismo, encapsulamiento y el criterio para elegir entre composicion e herencia.',
        'category'            => 'poo',
        'language'            => 'python',
        'difficulty'          => 'beginner',
        'duration_hours'      => 16,
        'is_free'             => true,
        'learning_path'       => 'desarrollo-orientado-objetos',
        'learning_path_level' => 1,
        'order'               => 2,
        'modules'             => [
            [
                'title'       => 'Herencia y polimorfismo',
                'description' => 'Reutilizar y especializar comportamiento.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-herencia',
                        'title'    => 'Herencia: reutilizar lo que ya funciona',
                        'type'     => 'article',
                        'duration' => 13,
                        'blocks'   => [
                            ['h', 'Especializar un concepto general'],
                            ['p', 'La herencia permite que una clase derive de otra y aproveche sus metodos. La subclase puede anadir comportamiento nuevo o cambiar el existente.'],
                            ['code', 'python', <<<'PY'
class Animal:
    def __init__(self, nombre):
        self.nombre = nombre

    def hablar(self):
        return f"{self.nombre} hace un sonido"

class Perro(Animal):
    def hablar(self):          # sobrescribe el metodo del padre
        return f"{self.nombre} ladra"

class Gato(Animal):
    def hablar(self):
        return f"{self.nombre} maulla"

for animal in [Perro("Rex"), Gato("Michi")]:
    print(animal.hablar())
PY],
                            ['h', 'Polimorfismo'],
                            ['p', 'El polimorfismo es la capacidad de tratar distintos objetos de forma uniforme. El bucle anterior llama a hablar() en un Perro y en un Gato, y cada uno responde con su propia version. Ese es el principio abierto/cerrado en accion: el codigo nuevo no requiere modificar el existente.'],
                            ['h', 'super()'],
                            ['p', 'Cuando la subclase necesita la logica del padre, llama a super().metodo() para no duplicar codigo.'],
                            ['list', [
                                'Herencia "es un": un Perro es un Animal',
                                'super() delega en la clase padre',
                                'Sobrescribir metodos es polimorfismo',
                                'No todo se resuelve con herencia: prefiere composicion cuando la relacion es "tiene un"',
                            ]],
                        ],
                        'quiz'    => [
                            'title'     => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => 'Que describe mejor la herencia?', 'type' => 'single', 'answers' => [
                                    ['Que una clase reutiliza y especializa el comportamiento de otra', true, 'Exacto: la subclase hereda metodos y puede anadir o sobrescribir.'],
                                    ['Que una clase contiene objetos de otra clase', false, 'Eso es composicion.'],
                                    ['Que una clase copia codigo de otra de forma automatica', false, 'La copia manual de codigo es duplicacion, no herencia.'],
                                ]],
                                ['q' => 'Para que sirve super() dentro de un metodo de la subclase?', 'type' => 'single', 'answers' => [
                                    ['Para delegar en la implementacion de la clase padre', true, 'Correcto: evita duplicar la logica del padre.'],
                                    ['Para crear una instancia nueva', false, 'Eso lo hace el constructor de la clase.'],
                                    ['Para cambiar el tipo del atributo', false, 'Python es de tipado dinamico, no necesitas conversiones explicitas.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-herencia',
                        'title'    => 'Ejercicio: jerarquía de figuras',
                        'type'     => 'code_challenge',
                        'duration' => 16,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea la clase Figura con metodo area() que devuelva 0
# Cuadrado( lado ) y Circulo( radio ) heredan de Figura
# y sobrescriben area() con su propia formula
# Usa 3.14159 como valor de pi


PY,
                        'solution' => <<<'PY'
class Figura:
    def area(self):
        return 0

class Cuadrado(Figura):
    def __init__(self, lado):
        self.lado = lado

    def area(self):
        return self.lado * self.lado

class Circulo(Figura):
    def __init__(self, radio):
        self.radio = radio

    def area(self):
        return 3.14159 * self.radio * self.radio
PY,
                        'hint'     => 'La clase padre define area(); cada subclase la sobrescribe.',
                        'tests'    => [
                            ['str(Cuadrado(3).area())', '9'],
                            ['str(Cuadro = Circulo(1).area())[:5]', '3.141'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Encapsulamiento',
                'description' => 'Ocultar el estado interno y proteger sus invariantes.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-encapsulamiento',
                        'title'    => 'Encapsulamiento: proteger el estado',
                        'type'     => 'article',
                        'duration' => 11,
                        'blocks'   => [
                            ['h', 'No todo es publico'],
                            ['p', 'Si expones un atributo directamente, cualquier parte del programa puede dejar el objeto en un estado invalido. El encapsulamiento ofrece una forma de modificarlo que garantiza las reglas.'],
                            ['code', 'python', <<<'PY'
class CuentaBancaria:
    def __init__(self, saldo):
        self._saldo = saldo      # convencionalmente privado

    @property
    def saldo(self):            # getter de solo lectura
        return self._saldo

    def depositar(self, monto):
        if monto <= 0:
            raise ValueError("monto invalido")
        self._saldo += monto
        return self._saldo

cuenta = CuentaBancaria(100)
print(cuenta.saldo)     # 100 (leido)
cuenta.depositar(50)
print(cuenta.saldo)     # 150
PY],
                            ['h', 'Convenciones de Python'],
                            ['list', [
                                'Guion bajo inicial: uso interno del objeto',
                                '@property: expone lectura controlada',
                                '@valor.setter: controla la escritura y valida',
                                'Las excepciones launched dentro del metodo son parte del contrato',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-encapsulamiento',
                        'title'    => 'Ejercicio: cuenta con saldo protegido',
                        'type'     => 'code_challenge',
                        'duration' => 15,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea CuentaBancaria con atributo interno _saldo
# - saldo como @property de solo lectura
# - depositar(monto) suma si monto > 0, y devuelve el saldo
# - retirar(monto) lanza ValueError si no hay saldo suficiente
#   y devuelve el saldo en caso contrario


PY,
                        'solution' => <<<'PY'
class CuentaBancaria:
    def __init__(self, saldo=0):
        self._saldo = saldo

    @property
    def saldo(self):
        return self._saldo

    def depositar(self, monto):
        if monto <= 0:
            raise ValueError("monto invalido")
        self._saldo += monto
        return self._saldo

    def retirar(self, monto):
        if monto > self._saldo:
            raise ValueError("saldo insuficiente")
        self._saldo -= monto
        return self._saldo
PY,
                        'hint'     => 'Usa @property para el getter y self._saldo dentro de los metodos.',
                        'tests'    => [
                            ['str(CuentaBancaria(100).depositar(50).saldo)', '150'],
                            ['CuentaBancaria(10).retirar(50)', 'error:saldo insuficiente'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Composición vs. herencia',
                'description' => 'El criterio de decisión más importante del diseño OO.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-composicion-vs-herencia',
                        'title'    => 'Composición o herencia: cómo decidir',
                        'type'     => 'article',
                        'duration' => 12,
                        'blocks'   => [
                            ['h', 'Dos relaciones distintas'],
                            ['list', [
                                'Herencia para "es un": un Gato es un Animal',
                                'Composición para "tiene un": un Coche tiene un Motor',
                            ]],
                            ['p', 'Heredar cuando la relacion es "tiene un" produce acoplamiento inutil: si Coche hereda de Motor, cualquier cambio en Motor afecta a Coche y a todos los que heredan de el. La composicion permite cambiar el motor sin tocar el coche.'],
                            ['code', 'python', <<<'PY'
# Composicion: el Coche CONTIENE un Motor
class Motor:
    def __init__(self, potencia):
        self.potencia = potencia

    def descripcion(self):
        return f"motor de {self.potencia}cv"

class Coche:
    def __init__(self, motor):
        self.motor = motor          # <- composicion

    def descripcion(self):
        return f"coche con {self.motor.descripcion()}"

print(Coche(Motor(90)).descripcion())
PY],
                            ['h', 'Regla practica'],
                            ['p', 'Empieza por composicion. Hereda solo cuando exista una relacion "es un" genuina y estable. El profundo es un buen punto de partida.'],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-composicion',
                        'title'    => 'Ejercicio: pedido compuesto',
                        'type'     => 'code_challenge',
                        'duration' => 14,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea la clase Producto(nombre, precio)
# y la clase Pedido que RECIBA productos por composicion
# Pedido(productos) guarda la lista
# Pedido.total() suma los precios
# Pedido.num_items() devuelve la cantidad


PY,
                        'solution' => <<<'PY'
class Producto:
    def __init__(self, nombre, precio):
        self.nombre = nombre
        self.precio = precio

class Pedido:
    def __init__(self, productos):
        self.productos = productos

    def total(self):
        return sum(p.precio for p in self.productos)

    def num_items(self):
        return len(self.productos)
PY,
                        'hint'     => 'El Pedido recibe una lista ya construida; no la crea internamente.',
                        'tests'    => [
                            ['str(Pedido([Producto("A", 10), Producto("B", 5)]).total())', '15'],
                            ['str(Pedido([Producto("A", 10)]).num_items())', '1'],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 3. Principios SOLID — Nivel 2
    // =====================================================================
    [
        'slug'                => 'principios-solid',
        'title'               => 'Principios SOLID en la práctica',
        'description'         => 'Los cinco principios que hacen que el software sea ampliable y mantenible, con ejemplos de Python y refactorizaciones paso a paso.',
        'category'            => 'poo',
        'language'            => 'python',
        'difficulty'          => 'intermediate',
        'duration_hours'      => 18,
        'is_free'             => true,
        'learning_path'       => 'desarrollo-orientado-objetos',
        'learning_path_level' => 2,
        'order'               => 3,
        'modules'             => [
            [
                'title'       => 'SRP — Responsabilidad Única',
                'description' => 'Una causa para cambiar.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-srp',
                        'title'    => 'SRP: una sola causa para cambiar',
                        'type'     => 'article',
                        'duration' => 10,
                        'blocks'   => [
                            ['h', 'El principio'],
                            ['p', 'Una clase debe tener una unica responsabilidad, y por tanto una sola causa para cambiar. Si tu clase valida entrada, guarda en base de datos y formatea la salida, cada uno de esos cambios te obliga a editar la misma clase.'],
                            ['code', 'python', <<<'PY'
# Mal: tres razones para cambiar en una sola clase
class Usuario:
    def registrar(self, datos):
        validar(datos)
        guardar_en_bd(datos)
        return formatear_bienvenida(datos)

# Bien: cada pieza tiene su responsabilidad
class ValidadorUsuario:
    def validar(self, datos): ...

class RepositorioUsuarios:
    def guardar(self, usuario): ...

class GeneradorBienvenida:
    def generar(self, usuario): ...
PY],
                            ['h', 'Como se aplica'],
                            ['list', [
                                'Nombra las clases por lo que hacen, no por el sustantivo generico',
                                'Si el nombre de la clase lleva "y" ("ReportePDFyEmail"), tienes dos clases',
                                'Los metodos cortos no garantizan SRP: importa la responsabilidad, no el tamaño',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-srp',
                        'title'    => 'Ejercicio: separa responsabilidades',
                        'type'     => 'code_challenge',
                        'duration' => 16,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Refactoriza esta clase para que cada responsabilidad
# quede en su propia clase, manteniendo el mismo resultado.
# inventario() debe devolver la lista de productos
# guardar() persiste cada producto
# Las utilidades imprimen el reporte
#
# class Almacen:
#     def __init__(self): self.productos = []


PY,
                        'solution' => <<<'PY'
class Almacen:
    def __init__(self):
        self.productos = []

    def agregar(self, producto):
        self.productos.append(producto)

    def inventario(self):
        return list(self.productos)

    def guardar(self, persistencia):
        for p in self.inventario():
            persistencia(p)

class Reporte:
    def __init__(self, productos):
        self.productos = productos

    def imprimir(self):
        for p in self.productos:
            print(p)
PY,
                        'hint'     => 'Separa el almacenamiento, el listado y la presentacion.',
                        'tests'    => [
                            ['str(len(Almacen().inventario()))', '0'],
                            ['Almacen().productos == []', 'True'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'OCP y LSP',
                'description' => 'Abierto/cerrado y sustitución de tipos.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-ocp-lsp',
                        'title'    => 'OCP y LSP: extensibilidad y substitutabilidad',
                        'type'     => 'article',
                        'duration' => 14,
                        'blocks'   => [
                            ['h', 'OCP: abierto/cerrado'],
                            ['p', 'El software debe ser extensible sin modificar el codigo existente. Si cada vez que anades un metodo de pago tienes que tocar la clase que procesa pedidos, el principio esta roto.'],
                            ['code', 'python', <<<'PY'
# Mal: hay que modificar la clase en cada nuevo metodo
class ProcesadorPago:
    def cobrar(self, pedido, metodo):
        if metodo == "tarjeta": ...
        elif metodo == "paypal": ...
        elif metodo == "bizum": ...   # <- nuevo metodo, nuevo condicional

# Bien: cada metodo es su propia clase (ver tema ISP/DIP)
PY],
                            ['h', 'LSP: la sustitutibilidad'],
                            ['p', 'Toda subclase debe poder reemplazar a su clase padre sin romper el codigo que la usa. Si tu clase padre declara un metodo calcular() y la subclase lo lanza con NotImplementedError, ya no es sustituible.'],
                            ['list', [
                                'OCP: prefieres nuevas clases a nuevas condiciones if/else',
                                'LSP: si el cliente usa el tipo padre, cualquier hijo debe funcionar',
                                'Violar LSP suelemiknotaise por Exception',
                                'Prefiere composicion cuando la jerarquia no representa el dominio real',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-ocp',
                        'title'    => 'Ejercicio:.shape sin if/else',
                        'type'     => 'code_challenge',
                        'duration' => 16,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea un sistema de envios extensible sin condicionales:
# cada metodo de envio es una clase con __init__(destino)
# y enviar() que devuelva un texto con el destino
# y la clase Envio que recibe una estrategia y la delega


PY,
                        'solution' => <<<'PY'
class EnvioEstandar:
    def __init__(self, destino):
        self.destino = destino

    def enviar(self):
        return f"enviado por correo a {self.destino}"

class EnvioUrgente:
    def __init__(self, destino):
        self.destino = destino

    def enviar(self):
        return f"enviado urgente a {self.destino}"

class Envio:
    def __init__(self, estrategia):
        self.estrategia = estrategia

    def enviar(self, destino):
        return self.estrategia.__class__(destino).enviar()
PY,
                        'hint'     => 'Anadir un nuevo metodo = anadir una clase, sin tocar las existentes.',
                        'tests'    => [
                            ['Envio(EnvioUrgente).enviar("Madrid")', 'enviado urgente a Madrid'],
                            ['Envio(EnvioEstandar).enviar("Lima")', 'enviado por correo a Lima'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'ISP y DIP',
                'description' => 'Interfaces pequeñas y dependencias hacia las abstracciones.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-isp-dip',
                        'title'    => 'ISP y DIP: interfaces mínimas y dependencias invertidas',
                        'type'     => 'article',
                        'duration' => 15,
                        'blocks'   => [
                            ['h', 'ISP: interfaz segregada'],
                            ['p', 'No fuerces a tus clientes a depender de metodos que no usan. Una interfaz enorme es mas difficult de implementar y mas fragil que varias interfaces pequenas.'],
                            ['h', 'DIP: dependencia de las abstracciones'],
                            ['p', 'Los modulos de alto nivel no deben depender de los de bajo nivel; ambos deben depender de abstracciones. En la practica, el codigo de negocio recibe sus colaboradores por constructor en vez de instanciarlos.'],
                            ['code', 'python', <<<'PY'
# DIP: el servicio depende de una interfaz, no de un motor concreto
class ServicioNotificacion:
    def __init__(self, motor):     # <- recibe la dependencia
        self.motor = motor

    def avisar(self, mensaje):
        return self.motor.enviar(mensaje)

# La eleccion del motor ocurre fuera, en el punto de entrada
ServicioNotificacion(EnvioCorreo()).avisar("Hola")
PY],
                            ['list', [
                                'ISP: divide interfaces grandes en interfaces cohesionadas',
                                'DIP: pasa las dependencias por constructor',
                                'Un test puede inyectar un doble sin tocar el codigo de produccion',
                                'Esto es lo que hace testeable el codico, no el porcentaje de cobertura de tests',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-dip',
                        'title'    => 'Ejercicio: inyección de dependencias',
                        'type'     => 'code_challenge',
                        'duration' => 15,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Calculadora que recibe un motor de precios por constructor
# __init__(precio_base) — precio_base es un objeto con .get(origen)
# calcular(destino) — usa motor.get(destino) + 10 de envio
# Calculadora(PreciosFijos()).calcular("Lima") -> 15


PY,
                        'solution' => <<<'PY'
class PreciosFijos:
    def __init__(self, precios):
        self.precios = precios

    def get(self, destino):
        return self.precios[destino]

class Calculadora:
    def __init__(self, precio_base):
        self.precio_base = precio_base

    def calcular(self, destino):
        return self.precio_base.get(destino) + 10
PY,
                        'hint'     => 'No llames a un motor concreto dentro de la calculadora.',
                        'tests'    => [
                            ['str(Calculadora(PreciosFijos({"Lima": 5})).calcular("Lima"))', '15'],
                            ['str(Calculadora(PreciosFijos({"Madrid": 3})).calcular("Madrid"))', '13'],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 4. Patrones de Diseño — Nivel 3
    // =====================================================================
    [
        'slug'                => 'patrones-de-diseno',
        'title'               => 'Patrones de Diseño',
        'description'         => 'Soluciones reutilizables a problemas recurrentes del diseño de software: creacionales, estructurales y comportamentales con implementaciones en Python.',
        'category'            => 'poo',
        'language'            => 'python',
        'difficulty'          => 'advanced',
        'duration_hours'      => 20,
        'is_free'             => true,
        'learning_path'       => 'desarrollo-orientado-objetos',
        'learning_path_level' => 3,
        'order'               => 4,
        'modules'             => [
            [
                'title'       => 'Patrones creacionales',
                'description' => 'Factory y Singleton.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-patrones-creacionales',
                        'title'    => 'Creacionales: Factory y Singleton',
                        'type'     => 'article',
                        'duration' => 14,
                        'blocks'   => [
                            ['h', 'Que resuelven'],
                            ['p', 'Los patrones creacionales abstraen la creacion de objetos, de modo que el cliente no dependa de la clase concreta. Factory centraliza la decision; Singleton garantiza una unica instancia.'],
                            ['code', 'python', <<<'PY'
# Factory: el cliente pide un producto, no una clase concreta
class FabricaNotificaciones:
    @staticmethod
    def crear(tipo, destino):
        if tipo == "email":
            return NotificacionEmail(destino)
        if tipo == "sms":
            return NotificacionSMS(destino)
        raise ValueError(f"tipo desconocido: {tipo}")

notif = FabricaNotificaciones.crear("email", "ana@correo.com")
print(notif.enviar("Hola"))

# Singleton: una sola instancia compartida
class Configuracion:
    _instancia = None

    def __new__(cls):
        if cls._instancia is None:
            cls._instancia = super().__new__(cls)
        return cls._instancia
PY],
                            ['list', [
                                'Factory: el cliente pide "algo que envia", no "un NotificacionEmail"',
                                'Singleton: util para configuración o cachés, usalo con moderacion',
                                'El enum de Python suele ser mejor Singleton para configuraciones',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-factory',
                        'title'    => 'Ejercicio: fábrica de vehículos',
                        'type'     => 'code_challenge',
                        'duration' => 16,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea Auto(ruedas) y Moto(ruedas) con Wheels() 
# que devuelva el numero de ruedas
# y Fabrica.crear(tipo) que devuelva la instancia correcta
# o lance ValueError si el tipo no existe


PY,
                        'solution' => <<<'PY'
class Auto:
    def __init__(self, ruedas=4):
        self.ruedas = ruedas

    def wheels(self):
        return self.ruedas

class Moto:
    def __init__(self, ruedas=2):
        self.ruedas = ruedas

    def wheels(self):
        return self.ruedas

class Fabrica:
    @staticmethod
    def crear(tipo):
        if tipo == "auto":
            return Auto()
        if tipo == "moto":
            return Moto()
        raise ValueError(f"tipo desconocido: {tipo}")
PY,
                        'hint'     => 'La fabrica decide; el cliente solo pide por nombre.',
                        'tests'    => [
                            ['str(Fabrica.crear("auto").wheels())', '4'],
                            ['str(Fabrica.crear("moto").wheels())', '2'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Patrones estructurales',
                'description' => 'Adapter y Decorator.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-patrones-estructurales',
                        'title'    => 'Estructurales: Adapter y Decorator',
                        'type'     => 'article',
                        'duration' => 15,
                        'blocks'   => [
                            ['h', 'Adapter: hacer compatibles interfaces distintas'],
                            ['p', 'Adapter envuelve una interfaz que no encaja con la que espera el cliente, y traduce la llamada. Se usa al integrar librerias de terceros o legado.'],
                            ['code', 'python', <<<'PY'
# El cliente espera .calcular()
# La libreria ofrece .compute() -> necesita un Adapter
class Calculador legacy:
    def compute(self, a, b):
        return a + b

class Adapter:
    def __init__(self, legado):
        self.legado = legado

    def calcular(self, a, b):
        return self.legado.compute(a, b)
PY],
                            ['h', 'Decorator: envolver comportamiento sin herencia'],
                            ['p', 'Decorator anade funcionalidad a un objeto envolverlo con mas objetos del mismo tipo, en cadena. Es la alternativa flexible a la herencia para ampliar comportamiento.'],
                            ['code', 'python', <<<'PY'
def registrar(funcion):
    def envoltorio(*args, **kwargs):
        print(f"Llamando a {funcion.__name__}")
        return funcion(*args, **kwargs)
    return envoltorio

@registrar
def saludar(nombre):
    return f"Hola {nombre}"
PY],
                            ['list', [
                                'Adapter: traduce, no anade comportamiento',
                                'Decorator: anade comportamiento manteniendo la firma',
                                'Los decoradores de Python son el patron Decorator ya estandarizado',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-decorator',
                        'title'    => 'Ejercicio: deco contador de llamadas',
                        'type'     => 'code_challenge',
                        'duration' => 15,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Crea un decorador contar_llamadas que imprima "Ejecutando fn: ..."
# cada vez que se invoque la funcion decorada,
# y luego aplicalo a una funcion saludar(nombre)


PY,
                        'solution' => <<<'PY'
def contar_llamadas(fn):
    def envoltorio(*args, **kwargs):
        print(f"Ejecutando fn: {fn.__name__}")
        return fn(*args, **kwargs)
    return envoltorio

@contar_llamadas
def saludar(nombre):
    return f"Hola {nombre}"
PY,
                        'hint'     => 'Un decorador recibe una funcion y devuelve otra que la envuelve.',
                        'tests'    => [
                            ['contar_llamadas(lambda: "ok")()', "Ejecutando fn: <lambda>\nok"],
                            ['str(contar_llamadas(lambda a, b=2: a + b)(3))', "Ejecutando fn: <lambda>\n5"],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Patrones comportamentales',
                'description' => 'Strategy y Observer.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-patrones-comportamentales',
                        'title'    => 'Comportamentales: Strategy y Observer',
                        'type'     => 'article',
                        'duration' => 15,
                        'blocks'   => [
                            ['h', 'Strategy: cambiar el algoritmo en caliente'],
                            ['p', 'Strategy encapsula una familia de algoritmos intercambiables. El contexto recibe la estrategia y delega; cambiar de algoritmo no requiere tocar el contexto. Es el patron detras de las funciones de orden superior de Python.'],
                            ['h', 'Observer: notificar cambios'],
                            ['p', 'Observer define una relacion uno-a-muchos: cuando el sujeto cambia, notifica a todos los suscriptores registrados. Sin acoplamiento entre sujeto y observador.'],
                            ['code', 'python', <<<'PY'
class Sujeto:
    def __init__(self):
        self._observadores = []

    def suscribir(self, obs):
        self._observadores.append(obs)

    def notificar(self, evento):
        for obs in self._observadores:
            obs(evento)

class Logger:
    def __call__(self, evento):
        print(f"[log] {evento}")

s = Sujeto()
s.suscribir(Logger())
s.notificar("nueva venta")   # imprime: [log] nueva venta
PY],
                            ['list', [
                                'Strategy: elige el algoritmo, no el codigo que lo usa',
                                'Observer: difunde el cambio sin que el sujeto conozca a quien avisa',
                                'Ambos favorecen el principio abierto/cerrado',
                            ]],
                        ],
                    ],
                    [
                        'slug'     => 'poo-ejercicio-strategy',
                        'title'    => 'Ejercicio: strategy de compresión',
                        'type'     => 'code_challenge',
                        'duration' => 15,
                        'language' => 'python',
                        'starter'  => <<<'PY'
# Compresion con strategy: Compresor recibe una estrategia
# en su constructor y la usa en comprimir(datos)
# Usa SinCompression y compresion simple (quitar espacios)


PY,
                        'solution' => <<<'PY'
class SinCompresion:
    def comprimir(self, datos):
        return datos

class SinEspacios:
    def comprimir(self, datos):
        return datos.replace(" ", "")

class Compresor:
    def __init__(self, estrategia):
        self.estrategia = estrategia

    def comprimir(self, datos):
        return self.estrategia.comprimir(datos)
PY,
                        'hint'     => 'El compresor no sabe que algoritmo usa, solo lo delega.',
                        'tests'    => [
                            ['Compresor(SinCompresion()).comprimir("a b c")', 'a b c'],
                            ['Compresor(SinEspacios()).comprimir("a b c")', 'abc'],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 5. Programación Orientada a Objetos con Java
    // =====================================================================
    [
        'slug'                => 'programacion-orientada-a-objetos-java',
        'title'               => 'Programación Orientada a Objetos con Java',
        'description'         => 'Domina la Programación Orientada a Objetos con Java, el estándar de la industria empresarial. Modela entidades robustas aplicando encapsulamiento estricto, jerarquías de herencia, polimorfismo dinámico, clases abstractas, contratos mediante interfaces y manejo profesional de excepciones.',
        'category'            => 'poo',
        'language'            => 'java',
        'difficulty'          => 'intermediate',
        'duration_hours'      => 18,
        'is_free'             => true,
        'learning_path'       => 'desarrollo-orientado-objetos',
        'learning_path_level' => 1,
        'order'               => 5,
        'modules'             => [
            [
                'title'       => 'Anatomía de Clases y Encapsulamiento en Java',
                'description' => 'Fundamentos de modelado, ciclo de vida del objeto, constructores y protección del estado con modificadores de acceso.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-java-clases-y-constructores',
                        'title'    => 'Clases, Objetos y Constructores en Java',
                        'type'     => 'article',
                        'duration' => 15,
                        'preview'  => true,
                        'blocks'   => [
                            ['h', 'La clase como molde y el objeto en memoria'],
                            ['p', 'En Java, todo programa estructurado reside dentro de clases. Una clase define los atributos que representan el estado interno de la entidad y los métodos que operan sobre dicho estado. Cuando invocamos el operador new, la Máquina Virtual de Java (JVM) reserva espacio en el Heap (montículo de memoria) para almacenar los valores de los atributos y nos devuelve una referencia a esa instancia concreta.'],
                            ['p', 'El constructor es el bloque especial encargado de inicializar el objeto en un estado consistente desde su nacimiento. En Java, el constructor lleva exactamente el mismo nombre de la clase y no declara tipo de retorno. Podemos sobrecargar constructores para permitir diferentes formas de instanciación según los parámetros suministrados.'],
                            ['code', 'java', <<<'JAVA'
public class CuentaBancaria {
    private String titular;
    private double saldo;

    // Constructor principal
    public CuentaBancaria(String titular, double saldoInicial) {
        this.titular = titular;
        this.saldo = Math.max(0.0, saldoInicial);
    }

    // Constructor sobrecargado con saldo en cero
    public CuentaBancaria(String titular) {
        this(titular, 0.0);
    }

    public void depositar(double monto) {
        if (monto > 0) {
            this.saldo += monto;
        }
    }

    public double getSaldo() {
        return this.saldo;
    }
}
JAVA],
                            ['h', 'La palabra reservada this y el Heap'],
                            ['p', 'La referencia this apunta a la instancia actual que está ejecutando el código. Se emplea para desambiguar entre parámetros del constructor y atributos de la clase que comparten el mismo nombre, así como para invocar constructores hermanos mediante this(...) en la primera línea de ejecución.'],
                            ['list', [
                                'class define el tipo y new crea la instancia física en el Heap de la JVM',
                                'Los constructores inicializan invariantes de datos y no declaran tipo de retorno',
                                'this desambigua atributos de parámetros y enlaza constructores sobrecargados',
                                'El Garbage Collector destruye automáticamente objetos sin referencias activas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde almacena la JVM los objetos creados con el operador new?', 'type' => 'single', 'answers' => [
                                    ['En el Heap (montículo de memoria)', true, 'En Java, todas las instancias de objetos residen en el Heap, mientras que variables locales y referencias viven en el Stack.'],
                                    ['En la pila de llamadas (Stack)', false, 'En el Stack solo se almacenan variables locales primitivas y referencias a objetos.'],
                                    ['Directamente en el disco rígido', false, 'La memoria de ejecución del proceso reside enteramente en RAM.'],
                                    ['En el área de metadatos de clases únicamente', false, 'Allí se almacena el bytecode compilado, no las instancias concretas.'],
                                ]],
                                ['q' => '¿Para qué se utiliza la sentencia this(...) en la primera línea de un constructor?', 'type' => 'single', 'answers' => [
                                    ['Para invocar otro constructor sobrecargado de la misma clase', true, 'Permite reutilizar lógica de inicialización entre constructores hermanos sin duplicar código.'],
                                    ['Para invocar al constructor de la clase padre', false, 'Para la clase base padre se utiliza super(...).'],
                                    ['Para reiniciar los atributos a cero', false, 'No tiene esa función de reseteo.'],
                                    ['Para destruir la instancia anterior', false, 'La destrucción la gestiona automáticamente el Garbage Collector.'],
                                ]],
                                ['q' => '¿Qué ocurre si no defines ningún constructor explícito en una clase Java?', 'type' => 'single', 'answers' => [
                                    ['El compilador genera un constructor público por defecto sin parámetros', true, 'Java provee un constructor vacío por defecto si y solo si no declaras ningún constructor explícito.'],
                                    ['El programa arroja un error de compilación', false, 'Java compila sin problemas proveyendo el constructor por defecto.'],
                                    ['La clase se convierte automáticamente en abstracta', false, 'Las clases abstractas requieren la palabra clave abstract.'],
                                    ['No es posible instanciar la clase nunca', false, 'Se puede instanciar usando el constructor por defecto generado.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'poo-java-encapsulamiento-y-modificadores',
                        'title'    => 'Encapsulamiento y Modificadores de Acceso',
                        'type'     => 'article',
                        'duration' => 14,
                        'blocks'   => [
                            ['h', 'Ocultamiento de información y defensa del estado'],
                            ['p', 'El encapsulamiento es el principio fundamental que consiste en ocultar los detalles internos de implementación de un objeto, exponiendo únicamente una interfaz pública controlada. En Java, esto se logra combinando atributos privados (private) con métodos públicos (getters y setters) que validan cualquier mutación del estado.'],
                            ['p', 'Permitir el acceso directo a campos públicos rompe la encapsulación: cualquier parte externa del sistema podría asignar valores inconsistentes (como saldos negativos o identificadores nulos). Los métodos de acceso nos permiten interceptar lecturas y escrituras, mantener la coherencia y facilitar cambios internos sin romper a los consumidores.'],
                            ['code', 'java', <<<'JAVA'
public class Producto {
    private final String codigo;
    private String nombre;
    private double precio;

    public Producto(String codigo, String nombre, double precio) {
        if (codigo == null || codigo.isBlank()) {
            throw new IllegalArgumentException("El código no puede estar vacío");
        }
        this.codigo = codigo;
        setNombre(nombre);
        setPrecio(precio);
    }

    public void setPrecio(double precio) {
        if (precio < 0.0) {
            throw new IllegalArgumentException("El precio no puede ser negativo: " + precio);
        }
        this.precio = precio;
    }

    public void setNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        this.nombre = nombre;
    }

    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
}
JAVA],
                            ['h', 'Los cuatro niveles de acceso en Java'],
                            ['p', 'Java dispone de cuatro niveles de visibilidad: private (solo accesible dentro de la misma clase), package-private o default (sin modificador, accesible por clases del mismo paquete), protected (accesible en el mismo paquete y por subclases en otros paquetes) y public (accesible desde cualquier parte del proyecto).'],
                            ['list', [
                                'private: máxima restricción, accesible solo en la clase declarante',
                                'default (sin palabra clave): accesible solo dentro del mismo paquete',
                                'protected: accesible dentro del paquete y por subclases derivadas',
                                'public: visibilidad universal sin restricciones',
                                'final en atributos: asignación única e inmutabilidad garantizada',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el modificador de acceso más restrictivo en Java?', 'type' => 'single', 'answers' => [
                                    ['private', true, 'private restringe la visibilidad exclusivamente a la clase en la que fue declarado el miembro.'],
                                    ['default', false, 'default permite acceso a todas las clases dentro del mismo paquete.'],
                                    ['protected', false, 'protected es más permisivo que default al incluir subclases externas.'],
                                    ['public', false, 'public es el modificador con menor restricción de todos.'],
                                ]],
                                ['q' => '¿Por qué es una mala práctica dejar atributos de una clase como públicos?', 'type' => 'single', 'answers' => [
                                    ['Porque cualquier código externo puede alterar el estado sin validaciones ni control', true, 'Vulnera el principio de encapsulamiento y permite corromper invariantes del modelo de negocio.'],
                                    ['Porque Java no permite compilar atributos con modificador public', false, 'Java compila atributos públicos sin ningún error de sintaxis.'],
                                    ['Porque los atributos públicos duplican el consumo de memoria en la JVM', false, 'El modificador de acceso no influye en la memoria ocupada.'],
                                    ['Porque obliga a que todos los métodos sean estáticos', false, 'No existe relación entre visibilidad y métodos estáticos.'],
                                ]],
                                ['q' => '¿Qué efecto tiene la palabra clave final cuando se aplica a un atributo de instancia?', 'type' => 'single', 'answers' => [
                                    ['Impide que el valor o referencia sea reasignado una vez inicializado', true, 'El atributo se convierte en inmutable en cuanto a su enlace de asignación inicial.'],
                                    ['Hace que el atributo sea accesible solo desde clases hijas', false, 'Esa es la función del modificador protected.'],
                                    ['Permite que el Garbage Collector lo elimine inmediatamente', false, 'No tiene impacto en el recolector de basura.'],
                                    ['Convierte el atributo en una variable global compartida', false, 'Para compartir entre instancias se utiliza static.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'poo-java-ejercicio-cuenta-bancaria',
                        'title'    => 'Ejercicio: Modela una Cuenta Bancaria en Java',
                        'type'     => 'code_challenge',
                        'duration' => 16,
                        'language' => 'java',
                        'blocks'   => [
                            ['h', 'Instrucciones del ejercicio'],
                            ['p', 'Diseña una clase llamada Cuenta con atributos privados para el numeroCuenta (String) y el saldo (double). Implementa un constructor que reciba ambos valores asegurando que el saldo inicial no sea menor a cero. Incluye métodos getNumeroCuenta(), getSaldo(), depositar(double monto) que aumente el saldo solo si el monto es mayor a cero, y retirar(double monto) que reste del saldo solo si hay fondos suficientes.'],
                        ],
                        'starter'  => <<<'JAVA'
public class Cuenta {
    // Declara los atributos privados: numeroCuenta (String) y saldo (double)
    
    // Implementa el constructor: Cuenta(String numeroCuenta, double saldoInicial)

    // Implementa getNumeroCuenta(), getSaldo(), depositar(double) y retirar(double)
}
JAVA,
                        'solution' => <<<'JAVA'
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
                        'hint'     => 'Asegúrate de que los atributos sean private y utiliza this para diferenciar los atributos de los parámetros en el constructor.',
                        'tests'    => [
                            ['Cuenta c = new Cuenta("123", 100); c.depositar(50); c.getSaldo()', '150.0'],
                            ['Cuenta c = new Cuenta("123", 100); c.retirar(30); c.getSaldo()', '70.0'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Herencia y Polimorfismo en Java',
                'description' => 'Jerarquía de clases con extends, super, sobreescritura de métodos y enlace dinámico.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-java-herencia-y-super',
                        'title'    => 'Herencia con extends y la Palabra Clave super',
                        'type'     => 'article',
                        'duration' => 16,
                        'blocks'   => [
                            ['h', 'Especialización de clases y herencia simple'],
                            ['p', 'La herencia permite construir nuevas clases a partir de clases existentes, heredando sus atributos y comportamientos no privados. En Java, la herencia entre clases se declara con la palabra clave extends. Java adopta estrictamente el modelo de herencia simple: una clase solo puede extender directamente a una única superclase, evitando así el clásico problema del diamante que surge con la herencia múltiple.'],
                            ['p', 'Todas las clases en Java descienden en última instancia de java.lang.Object. Cuando una subclase define un constructor, debe invocar al constructor de la superclase mediante super(...) antes de ejecutar su propia inicialización. Si no se llama explícitamente, el compilador inserta una llamada implícita a super() sin argumentos.'],
                            ['code', 'java', <<<'JAVA'
// Superclase base
public class Empleado {
    private String nombre;
    private double salarioBase;

    public Empleado(String nombre, double salarioBase) {
        this.nombre = nombre;
        this.salarioBase = salarioBase;
    }

    public double calcularSalario() {
        return this.salarioBase;
    }

    public String getNombre() { return nombre; }
}

// Subclase especializada
public class Gerente extends Empleado {
    private double bono;

    public Gerente(String nombre, double salarioBase, double bono) {
        super(nombre, salarioBase); // Delega inicialización a la superclase
        this.bono = bono;
    }

    @Override
    public double calcularSalario() {
        return super.calcularSalario() + this.bono;
    }
}
JAVA],
                            ['h', 'La anotación @Override y el acceso protegido'],
                            ['p', 'La anotación @Override informa al compilador que nuestra intención es sobreescribir un método heredado. Si cometemos un error tipográfico en el nombre del método o en la lista de tipos de parámetros, el compilador detectará el fallo de inmediato. El modificador protected permite que los miembros sean visibles por las subclases sin exponerlos públicamente.'],
                            ['list', [
                                'extends establece la relación es-un (is-a) entre subclase y superclase',
                                'Java impone herencia simple de clases para garantizar predictibilidad',
                                'super(...) delega al constructor de la clase base en la primera línea',
                                '@Override previene errores silenciosos de sobreescritura incorrecta',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuántas clases directas puede heredar una clase en Java mediante extends?', 'type' => 'single', 'answers' => [
                                    ['Exactamente una sola clase (herencia simple)', true, 'Java no permite herencia múltiple entre clases para evitar ambigüedades estructurales.'],
                                    ['Múltiples clases separadas por comas', false, 'La herencia múltiple de implementación no está soportada para clases en Java.'],
                                    ['Hasta un máximo de tres clases', false, 'No existe tal límite numérico; la regla es exactamente una.'],
                                    ['Cualquier número si son abstractas', false, 'Las clases abstractas también están sujetas a una sola herencia simple.'],
                                ]],
                                ['q' => '¿Qué función cumple la instrucción super(...) dentro del constructor de una subclase?', 'type' => 'single', 'answers' => [
                                    ['Invoca al constructor de la clase padre para inicializar su estado', true, 'Garantiza que la jerarquía base sea inicializada antes de la subclase.'],
                                    ['Crea una nueva instancia independiente de la clase padre', false, 'No crea un objeto aparte, inicializa la parte padre de la misma instancia.'],
                                    ['Sobreescribe todos los atributos de la subclase', false, 'No sobreescribe atributos.'],
                                    ['Cancela la ejecución de los métodos de la subclase', false, 'No detiene métodos de la subclase.'],
                                ]],
                                ['q' => '¿Por qué es una buena práctica utilizar siempre la anotación @Override?', 'type' => 'single', 'answers' => [
                                    ['Permite al compilador verificar que el método realmente existe en la superclase', true, 'Si la firma no coincide exactamente, el compilador genera un error y previene bugs difíciles de rastrear.'],
                                    ['Obliga a que el método se ejecute de forma asíncrona', false, 'No tiene relación con concurrencia.'],
                                    ['Aumenta la velocidad de ejecución en la JVM', false, 'Es una directiva de tiempo de compilación con retención informativa.'],
                                    ['Hace que el método sea visible para paquetes externos', false, 'La visibilidad depende del modificador de acceso, no de @Override.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'poo-java-polimorfismo-enlace-dinamico',
                        'title'    => 'Polimorfismo y Enlace Dinámico en Java',
                        'type'     => 'article',
                        'duration' => 15,
                        'blocks'   => [
                            ['h', 'Un único tipo estático, múltiples comportamientos dinámicos'],
                            ['p', 'El polimorfismo es la capacidad que tiene un objeto de responder a un mismo mensaje de diferentes maneras según su tipo real en tiempo de ejecución. En Java, podemos declarar una variable con el tipo de la superclase (tipo estático o aparente) y asignarle cualquier instancia de sus subclases (tipo dinámico o real). Esto se conoce como Upcasting y ocurre de manera automática y segura.'],
                            ['p', 'Cuando se invoca un método sobre la referencia polimórfica, la JVM consulta la tabla virtual de métodos (vtable) para ejecutar la implementación del tipo real del objeto. Este mecanismo se denomina despacho dinámico de métodos o enlace tardío (late binding).'],
                            ['code', 'java', <<<'JAVA'
// Referencia polimórfica en acción
Empleado emp1 = new Empleado("Laura", 3000.0);
Empleado emp2 = new Gerente("Carlos", 4000.0, 1500.0);

// Ambos se tratan como 'Empleado', pero su cálculo de salario difiere
System.out.println(emp1.calcularSalario()); // Imprime: 3000.0
System.out.println(emp2.calcularSalario()); // Imprime: 5500.0 (enlace dinámico)

// Colección polimórfica
List<Empleado> plantilla = List.of(emp1, emp2);
double total = 0;
for (Empleado e : plantilla) {
    total += e.calcularSalario(); // Llama a la versión adecuada automáticamente
}
JAVA],
                            ['h', 'Verificación segura con instanceof y Pattern Matching'],
                            ['p', 'Cuando es necesario comprobar si una referencia polimórfica corresponde a una subclase concreta para acceder a miembros específicos, utilizamos el operador instanceof. Desde Java 16, el Pattern Matching for instanceof permite realizar la comprobación y el casting en una única expresión limpia y segura.'],
                            ['code', 'java', <<<'JAVA'
if (emp2 instanceof Gerente g) {
    // 'g' ya está tipado como Gerente dentro de este bloque
    System.out.println("Es un gerente con bono: " + g.calcularSalario());
}
JAVA],
                            ['list', [
                                'Tipo estático: tipo con el que se declara la variable en el código fuente',
                                'Tipo dinámico: clase real de la instancia creada en memoria mediante new',
                                'Enlace tardío: la JVM resuelve en tiempo de ejecución qué método ejecutar',
                                'El polimorfismo permite escribir código extensible que no requiere modificar clientes existentes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ocurre cuando ejecutamos un método sobre una variable de tipo Empleado que contiene un objeto de tipo Gerente?', 'type' => 'single', 'answers' => [
                                    ['Se ejecuta la versión sobreescrita del método definida en Gerente', true, 'Gracias al enlace dinámico (late binding) de la JVM, se ejecuta el método del tipo real del objeto.'],
                                    ['Se ejecuta siempre la versión definida en Empleado', false, 'El polimorfismo delega la invocación al tipo real en el Heap.'],
                                    ['Se genera una excepción de tipo ClassCastException', false, 'El upcasting es transparente y no produce excepciones.'],
                                    ['La JVM solicita confirmación al compilador y detiene el hilo', false, 'La resolución ocurre automáticamente mediante la vtable interna de la JVM.'],
                                ]],
                                ['q' => '¿Qué ventaja ofrece el polimorfismo a la arquitectura de una aplicación?', 'type' => 'single', 'answers' => [
                                    ['Permite añadir nuevas clases derivadas sin modificar los algoritmos que consumen la clase base', true, 'Cumple directamente con el principio de Abierto/Cerrado (OCP).'],
                                    ['Elimina la necesidad de utilizar constructores en las clases', false, 'Toda clase necesita constructores para inicializarse.'],
                                    ['Reduce a cero el uso de memoria en el Heap', false, 'Las instancias consumen la memoria normal de sus campos.'],
                                    ['Evita tener que escribir pruebas unitarias', false, 'El código polimórfico requiere pruebas rigurosas.'],
                                ]],
                                ['q' => '¿Qué realiza la sintaxis if (obj instanceof Gerente g) en Java moderno?', 'type' => 'single', 'answers' => [
                                    ['Verifica el tipo y crea la variable casteada g automáticamente en el ámbito del bloque', true, 'Es la característica de Pattern Matching for instanceof introducida en las versiones modernas de Java.'],
                                    ['Convierte la clase Gerente en una interfaz estática', false, 'No altera la estructura de la clase.'],
                                    ['Obliga a que obj sea clonado en memoria', false, 'No realiza copias de memoria del objeto.'],
                                    ['Destruye la referencia anterior de obj', false, 'La referencia original permanece inalterada.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'poo-java-ejercicio-figuras-polimorficas',
                        'title'    => 'Ejercicio: Jerarquía Polimórfica de Figuras',
                        'type'     => 'code_challenge',
                        'duration' => 16,
                        'language' => 'java',
                        'blocks'   => [
                            ['h', 'Instrucciones del ejercicio'],
                            ['p', 'Crea una clase base Figura con un método public double calcularArea() que retorne 0.0. Luego, crea dos subclases: Rectangulo (con atributos base y altura y su constructor) y Circulo (con atributo radio y su constructor). Ambas subclases deben sobreescribir calcularArea() aplicando la fórmula correspondiente (base * altura para el rectángulo y Math.PI * radio * radio para el círculo).'],
                        ],
                        'starter'  => <<<'JAVA'
public class Figura {
    public double calcularArea() {
        return 0.0;
    }
}

// Implementa la clase Rectangulo que herede de Figura

// Implementa la clase Circulo que herede de Figura
JAVA,
                        'solution' => <<<'JAVA'
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
                        'hint'     => 'Recuerda utilizar extends Figura y sobreescribir el método calcularArea() con la anotación @Override.',
                        'tests'    => [
                            ['new Rectangulo(4, 5).calcularArea()', '20.0'],
                            ['Math.round(new Circulo(3).calcularArea() * 100.0) / 100.0', '28.27'],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Clases Abstractas e Interfaces en Java',
                'description' => 'Diseño basado en contratos, métodos abstractos, métodos default e implementación múltiple.',
                'lessons'     => [
                    [
                        'slug'     => 'poo-java-clases-abstractas',
                        'title'    => 'Clases Abstractas y Métodos Plantilla',
                        'type'     => 'article',
                        'duration' => 15,
                        'blocks'   => [
                            ['h', 'Conceptos incompletos que no deben ser instanciados'],
                            ['p', 'Existen entidades en nuestro dominio conceptual que representan ideas generales pero no entidades concretas listas para existir por sí solas. Por ejemplo, en un sistema de nómina existe la noción general de Empleado o en un sistema gráfico la noción de Figura, pero nunca quisiéramos instanciar una figura genérica sin forma definida. Para estos casos, Java provee la palabra clave abstract.'],
                            ['p', 'Una clase abstracta no puede ser instanciada directamente con new. Puede contener tanto métodos concretos con lógica compartida como métodos abstractos (sin llaves ni cuerpo), los cuales actúan como obligaciones contractuales que cualquier subclase concreta debe implementar obligatoriamente.'],
                            ['code', 'java', <<<'JAVA'
// Clase abstracta con patrón Template Method
public abstract class ProcesadorReporte {

    // Método plantilla (define el esqueleto invariable del algoritmo)
    public final void generarReporte() {
        abrirConexion();
        String datos = extraerDatos();
        String formateado = formatear(datos);
        guardar(formateado);
        cerrarConexion();
    }

    private void abrirConexion() {
        System.out.println("Abriendo conexión a la base de datos...");
    }

    private void cerrarConexion() {
        System.out.println("Cerrando conexión...");
    }

    // Métodos abstractos que cada formato concreto debe definir
    protected abstract String extraerDatos();
    protected abstract String formatear(String datos);
    protected abstract void guardar(String contenido);
}
JAVA],
                            ['h', 'El valor arquitectónico de la abstracción'],
                            ['p', 'Las clases abstractas permiten aplicar patrones clásicos como Template Method: la clase abstracta define el algoritmo de alto nivel y delega los pasos específicos a las clases hijas. De este modo, evitamos la duplicación de código en la estructura general y garantizamos que cada variante cumpla el protocolo establecido.'],
                            ['list', [
                                'abstract impide crear instancias directas con new',
                                'Los métodos abstractos terminan con punto y coma (;) y carecen de cuerpo',
                                'Las subclases concretas deben implementar todos los métodos abstractos heredados',
                                'Pueden contener estado (atributos), constructores y métodos concretos compartidos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ocurre si intentas ejecutar new Vehiculo() siendo Vehiculo una clase declarada como abstract?', 'type' => 'single', 'answers' => [
                                    ['El código no compila porque las clases abstractas no se pueden instanciar directamente', true, 'Java prohíbe la instanciación de clases abstractas para evitar objetos con métodos incompletos.'],
                                    ['La JVM crea un objeto anónimo vacío', false, 'No crea ningún objeto, el compilador detiene el proceso con error.'],
                                    ['Lanza una excepción NullPointerException en tiempo de ejecución', false, 'Es un error de compilación estático, no de tiempo de ejecución.'],
                                    ['Convierte la clase en una interfaz', false, 'Las clases abstractas e interfaces son construcciones diferentes.'],
                                ]],
                                ['q' => '¿Qué es obligatorio para que una subclase no abstracta pueda compilar si hereda de una clase abstracta?', 'type' => 'single', 'answers' => [
                                    ['Implementar todos los métodos abstractos declarados en la jerarquía', true, 'La subclase debe proporcionar un cuerpo concreto a cada método abstracto pendiente.'],
                                    ['Declarar todos sus atributos con modificador public', false, 'Los modificadores de atributos no dependen de la abstracción de métodos.'],
                                    ['Tener el mismo número de métodos que la clase padre', false, 'Puede añadir todos los métodos adicionales que necesite.'],
                                    ['Sobreescribir obligatoriamente todos los métodos concretos de la clase padre', false, 'Los métodos concretos se heredan opcionalmente.'],
                                ]],
                                ['q' => '¿Puede una clase abstracta en Java tener constructores y atributos con estado?', 'type' => 'single', 'answers' => [
                                    ['Sí, puede tener constructores y atributos que son invocados por las subclases vía super(...)', true, 'Aunque no se instancie directamente, su constructor prepara el estado base heredado.'],
                                    ['No, las clases abstractas solo pueden tener métodos estáticos', false, 'Pueden tener cualquier tipo de método y atributo.'],
                                    ['Solo si los atributos son finales y estáticos', false, 'Pueden tener atributos de instancia normales mutables o inmutables.'],
                                    ['No, los constructores están prohibidos en clases abstractas', false, 'Los constructores son plenamente válidos y comunes en clases abstractas.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'poo-java-interfaces-y-contratos',
                        'title'    => 'Interfaces: Contratos de Comportamiento e Implementación Múltiple',
                        'type'     => 'article',
                        'duration' => 16,
                        'blocks'   => [
                            ['h', 'Programar hacia una interfaz, no hacia una implementación'],
                            ['p', 'Una interfaz en Java define un contrato puro de comportamiento que una o más clases se comprometen a respetar. A diferencia de las clases, donde Java restringe a la herencia simple, una clase puede implementar múltiples interfaces (implements A, B, C). Esta capacidad desacopla el qué hace un componente del cómo lo hace, permitiendo intercambiar implementaciones sin alterar al consumidor.'],
                            ['p', 'Desde Java 8, las interfaces también admiten métodos con implementación por defecto mediante la palabra clave default, lo que permite evolucionar interfaces existentes sin romper las clases que ya las implementaban, así como métodos utilitarios estáticos.'],
                            ['code', 'java', <<<'JAVA'
// Contrato de notificación
public interface Notificador {
    void enviar(String destinatario, String mensaje);

    // Método default con comportamiento predeterminado
    default void enviarAlertaUrgente(String destinatario, String mensaje) {
        enviar(destinatario, "[URGENTE] " + mensaje);
    }
}

// Implementación 1: Correo electrónico
public class EmailNotificador implements Notificador {
    @Override
    public void enviar(String destinatario, String mensaje) {
        System.out.println("Enviando Email a " + destinatario + ": " + mensaje);
    }
}

// Implementación 2: Mensajería SMS
public class SmsNotificador implements Notificador {
    @Override
    public void enviar(String destinatario, String mensaje) {
        System.out.println("Enviando SMS al número " + destinatario + ": " + mensaje);
    }
}
JAVA],
                            ['h', 'Cuándo usar Interface y cuándo Clase Abstracta'],
                            ['p', 'La regla general de diseño en Java es: utiliza una interfaz cuando quieras definir una capacidad o rol transversal (como Serializable, Comparable, Notificador, Repositorio) que clases de jerarquías totalmente distintas pueden compartir. Utiliza una clase abstracta cuando exista una relación de parentesco conceptual estrecha ("es-un") y desees compartir código base y estado de instancia común.'],
                            ['list', [
                                'interface define capacidades y contratos desacoplados',
                                'implements permite implementar múltiples interfaces en una misma clase',
                                'default permite añadir lógica opcional sin romper implementaciones previas',
                                'Promueve el principio de Inversión de Dependencias (DIP) de SOLID',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuántas interfaces puede implementar una sola clase en Java?', 'type' => 'single', 'answers' => [
                                    ['Múltiples interfaces separadas por comas', true, 'Java permite implementación múltiple de interfaces, resolviendo la necesidad de combinar contratos de comportamiento.'],
                                    ['Solamente una sola interfaz', false, 'La restricción de una sola pertenece a la herencia de clases (extends), no a interfaces.'],
                                    ['Máximo dos interfaces', false, 'No existe límite superior.'],
                                    ['Ninguna si la clase ya tiene superclase', false, 'Puede extender una clase e implementar múltiples interfaces a la vez.'],
                                ]],
                                ['q' => '¿Qué propósito tienen los métodos default en las interfaces de Java?', 'type' => 'single', 'answers' => [
                                    ['Permitir agregar nuevos métodos con implementación a interfaces existentes sin romper clases que ya las implementaban', true, 'Fueron introducidos en Java 8 para habilitar la evolución compatible de la API de Streams y Collections.'],
                                    ['Hacer que los métodos no puedan ser sobreescritos por las clases', false, 'Las clases hijas pueden sobreescribir métodos default libremente.'],
                                    ['Convertir la interfaz en una clase final', false, 'No afecta la naturaleza de la interfaz.'],
                                    ['Ejecutar el método en un hilo en segundo plano', false, 'No tiene relación con concurrencia o hilos.'],
                                ]],
                                ['q' => '¿Cuál es la recomendación fundamental de la POO respecto al acoplamiento de dependencias?', 'type' => 'single', 'answers' => [
                                    ['Programar orientado a interfaces (abstracciones) y no a implementaciones concretas', true, 'Facilita la sustitución de componentes, pruebas unitarias con mocks y mantenibilidad del sistema.'],
                                    ['Usar siempre clases concretas para evitar la creación de interfaces', false, 'El acoplamiento a clases concretas vuelve al sistema rígido y frágil.'],
                                    ['Hacer que todas las clases sean estáticas', false, 'Destruye los principios del paradigma orientado a objetos.'],
                                    ['Evitar el uso de polimorfismo para ahorrar líneas de código', false, 'El polimorfismo es una de las mayores ventajas de la POO.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug'     => 'poo-java-ejercicio-notificador-interface',
                        'title'    => 'Ejercicio: Contrato de Notificación con Interfaces',
                        'type'     => 'code_challenge',
                        'duration' => 16,
                        'language' => 'java',
                        'blocks'   => [
                            ['h', 'Instrucciones del ejercicio'],
                            ['p', 'Crea una interfaz llamada Notificador con el método String notificar(String mensaje). Luego, implementa dos clases que la adopten: NotificadorEmail que devuelva "Email: " concatenado con el mensaje, y NotificadorSlack que devuelva "Slack: " concatenado con el mensaje. Diseña ambas clases respetando el contrato de la interfaz.'],
                        ],
                        'starter'  => <<<'JAVA'
public interface Notificador {
    String notificar(String mensaje);
}

// Implementa NotificadorEmail que implemente Notificador

// Implementa NotificadorSlack que implemente Notificador
JAVA,
                        'solution' => <<<'JAVA'
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
                        'hint'     => 'Utiliza la palabra clave implements Notificador en la declaración de las clases y sobreescribe notificar.',
                        'tests'    => [
                            ['new NotificadorEmail().notificar("Hola")', 'Email: Hola'],
                            ['new NotificadorSlack().notificar("Alerta")', 'Slack: Alerta'],
                        ],
                    ],
                ],
            ],
        ],
    ],
];

