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
                            ['Clase("El principito", "Saint-Exupery").mostrar()', 'El principito - Saint-Exupery'],
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
];
