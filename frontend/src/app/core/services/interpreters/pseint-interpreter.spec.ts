/**
 * Pruebas del intérprete PSeInt contra las soluciones de referencia reales
 * de los ejercicios (backend/database/seeders/exercise_payloads.php).
 */
import { describe, expect, it } from 'bun:test';
import { normalizeOutput, runPseint } from './pseint-interpreter';
import pseintFixtures from './pseint-fixtures.json';

const run = (code: string, stdin = '') => {
  const r = runPseint(code, stdin);
  return { ...r, out: normalizeOutput(r.stdout) };
};

describe('PSeInt · bloque y salida', () => {
  it('imprime con Escribir', () => {
    expect(run('Algoritmo H\nEscribir "Hola, mundo!"\nFinAlgoritmo').out).toBe('Hola, mundo!');
  });

  it('concatena varios argumentos con comas', () => {
    expect(run('Algoritmo H\nEscribir "a", 1, "b"\nFinAlgoritmo').out).toBe('a1b');
  });

  it('acepta Proceso como cabecera', () => {
    expect(run('Proceso H\nEscribir 7\nFinarProceso'.replace('Finar', 'Fin')).out).toBe('7');
  });

  it('ignora comentarios de línea y de bloque', () => {
    const code = `Algoritmo H
      // comentario
      /* bloque
         multilínea */
      Escribir "ok"
    FinAlgoritmo`;
    expect(run(code).out).toBe('ok');
  });
});

describe('PSeInt · variables y entrada', () => {
  it('Definir + asignación + lectura aritmética', () => {
    const code = `Algoritmo H
      Definir x Enter
      x <- 7
      Escribir x * 3
    FinAlgoritmo`;
    expect(run(code).out).toBe('21');
  });

  it('Leer toma valores de stdin', () => {
    const code = `Algoritmo H
      Definir a, b Enter
      Leer a, b
      Escribir a + b
    FinAlgoritmo`;
    expect(run(code, '4\n6').out).toBe('10');
  });

  it('potencia y módulo', () => {
    const code = `Algoritmo H
      Escribir 2 ^ 10
      Escribir 17 mod 5
    FinAlgoritmo`;
    const r = run(code);
    expect(r.out.split('\n')).toEqual(['1024', '2']);
  });

  it('división entera entre Enter (PSeInt trunca)', () => {
    const code = `Algoritmo H
      Definir a, b Enter
      a <- (0 + 99) / 2
      b <- 7 / 2
      Escribir a
      Escribir b
    FinAlgoritmo`;
    expect(run(code).out.split('\n')).toEqual(['49', '3']);
  });

  it('división real cuando el divisor es Real', () => {
    const code = `Algoritmo H
      Definir x Real
      x <- 7 / 2.0
      Escribir x
    FinAlgoritmo`;
    expect(run(code).out).toBe('3.5');
  });
});

describe('PSeInt · control de flujo', () => {
  it('Si / Entonces / Sino', () => {
    const code = `Algoritmo H
      Definir n Enter
      Leer n
      Si n > 10
        Escribir "grande"
      Sino
        Escribir "chico"
      FinSi
    FinAlgoritmo`;
    expect(run(code, '50').out).toBe('grande');
    expect(run(code, '2').out).toBe('chico');
  });

  it('Si sin Sino', () => {
    const code = `Algoritmo H
      Si 1 > 2
        Escribir "no"
      FinSi
      Escribir "fin"
    FinAlgoritmo`;
    expect(run(code).out).toBe('fin');
  });

  it('Mientras', () => {
    const code = `Algoritmo H
      Definir i Enter
      i <- 1
      Mientras i <= 3
        Escribir i
        i <- i + 1
      FinMientras
    FinAlgoritmo`;
    expect(run(code).out).toBe('1\n2\n3');
  });

  it('Repetir … Hasta Que', () => {
    const code = `Algoritmo H
      Definir i Enter
      i <- 0
      Repetir
        i <- i + 1
      Hasta Que i >= 3
      Escribir i
    FinAlgoritmo`;
    expect(run(code).out).toBe('3');
  });

  it('Para con Paso', () => {
    const code = `Algoritmo H
      Para i <- 0 Hasta 10 Paso 5
        Escribir i
      FinPara
    FinAlgoritmo`;
    expect(run(code).out).toBe('0\n5\n10');
  });

  it('Para descendente (Para … Hasta menor)', () => {
    const code = `Algoritmo H
      Para i <- 3 Hasta 1
        Escribir i
      FinPara
    FinAlgoritmo`;
    expect(run(code).out).toBe('3\n2\n1');
  });

  it('Segun / Caso / Otro', () => {
    const code = `Algoritmo H
      Definir op Enter
      Leer op
      Segun op Hacer
        Caso 1:
          Escribir "uno"
        Caso 2:
          Escribir "dos"
        Otro:
          Escribir "otro"
      FinSegun
    FinAlgoritmo`;
    expect(run(code, '1').out).toBe('uno');
    expect(run(code, '2').out).toBe('dos');
    expect(run(code, '9').out).toBe('otro');
  });
});

describe('PSeInt · arreglos', () => {
  it('Dimension + índices', () => {
    const code = `Algoritmo H
      Dimension 3
      Real a[3]
      a[0] <- 5
      a[2] <- 9
      Escribir a[0] + a[2]
    FinAlgoritmo`;
    expect(run(code).out).toBe('14');
  });
});

describe('PSeInt · subprocedimientos', () => {
  it('Parámetros y Devolver', () => {
    const code = `Algoritmo H
      Escribir Doble(5)
    FinAlgoritmo

    Funcion Doble(x)
      Devolver x * 2
    FinFuncion`;
    // el lenguaje de la prueba usa Procedimiento en el proyecto; aquí comprobamos
    // que la forma canónica del proyecto (SubProceso + Devolver) también funciona
    expect(run(code).out).toBe('10');
  });

  it('SubProceso con arreglos por referencia (fusiona dos mitades ordenadas)', () => {
    const code = `Algoritmo H
      Dimension 4
      Enter a[4], aux[4]
      a[0] <- 1
      a[1] <- 4
      a[2] <- 2
      a[3] <- 3
      Fusionar(0, 1, 3, a, aux)
      Para i <- 0 Hasta 3
        Escribir a[i], " "
      FinPara
    FinAlgoritmo

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
    FinSubProceso`;
    expect(run(code).out).toBe('1\n2\n3\n4');
  });
});

describe('PSeInt · errores', () => {
  it('división entre cero', () => {
    const r = run('Algoritmo H\nEscribir 1 / 0\nFinAlgoritmo');
    expect(r.exit_code).toBe(1);
    expect(r.stderr).toContain('División entre cero');
  });

  it('índice fuera de rango', () => {
    const r = run('Algoritmo H\nDimension 2\nReal a[2]\nEscribir a[5]\nFinAlgoritmo');
    expect(r.exit_code).toBe(1);
    expect(r.stderr).toContain('fuera de rango');
  });

  it('subprocedimiento inexistente', () => {
    const r = run('Algoritmo H\nNoExiste()\nFinAlgoritmo');
    expect(r.exit_code).toBe(1);
  });

  it('protege contra bucles infinitos', () => {
    const r = run('Algoritmo H\nMientras Verdadero\nEscribir 1\nFinMientras\nFinAlgoritmo');
    expect(r.exit_code).toBe(1);
    expect(r.stderr).toContain('bucle infinito');
  });
});

/**
 * Integración: el intérprete debe ejecutar las soluciones de referencia reales
 * de los 7 ejercicios de PSeInt y producir la salida que el alumno debe lograr.
 * El fixture se genera desde backend/database/seeders/exercise_payloads.php.
 */
describe('PSeInt · soluciones reales de los ejercicios', () => {
  const fixtures = pseintFixtures as Record<string, { solution: string; tests: [string, string][] }>;

  for (const [slug, { solution, tests }] of Object.entries(fixtures)) {
    it(`${slug} supera sus casos de prueba`, () => {
      for (const [stdin, expected] of tests) {
        const r = runPseint(solution, stdin);
        expect(r.stderr).toBe('');
        expect({ slug, stdin, exit: r.exit_code, out: normalizeOutput(r.stdout) })
          .toEqual({ slug, stdin, exit: 0, out: normalizeOutput(expected) });
      }
    });
  }
});

describe('PSeInt · tolerancia de sintaxis y casos de alumnos', () => {
  it('ejecuta el código reportado por el alumno con definir ... como caracter y concatenación adyacente', () => {
    const code = `Algoritmo hola_mundo
definir n como caracter

escribir "escriba su nombre"
leer n

escribir "hola, ", n "!"
FinAlgoritmo`;
    const res = run(code, 'Carlos');
    expect(res.stderr).toBe('');
    expect(res.exit_code).toBe(0);
    expect(res.out).toBe('escriba su nombre\nhola, Carlos!');
  });

  it('soporta puntos y coma opcionales al final de sentencias', () => {
    const code = `Algoritmo con_puntoycoma;
      Definir x Como Entero;
      Definir nombre Como Cadena;
      x <- 10;
      Leer nombre;
      Escribir "Hola ", nombre, " valor=", x;
    FinAlgoritmo;`;
    const res = run(code, 'Mundo');
    expect(res.stderr).toBe('');
    expect(res.out).toBe('Hola Mundo valor=10');
  });

  it('soporta palabras clave compuestas con espacio (Fin Algoritmo, Fin Si, etc.)', () => {
    const code = `Algoritmo espacio
      Definir a Entero
      a <- 5
      Si a > 0 Entonces
        Escribir "positivo"
      Si No
        Escribir "no positivo"
      Fin Si
    Fin Algoritmo`;
    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('positivo');
  });

  it('soporta sinónimos de tipos: Entero, Texto, Booleano, Reales', () => {
    const code = `Algoritmo tipos
      Definir a Como Entero
      Definir b Como Real
      Definir c Como Texto
      Definir d Como Booleano
      a <- 42
      b <- 3.14
      c <- "SysEng"
      d <- Verdadero
      Escribir a, " ", b, " ", c, " ", d
    FinAlgoritmo`;
    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('42 3.14 SysEng 1');
  });

  it('soporta alias Mostrar e Imprimir para Escribir', () => {
    const code = `Algoritmo salidas
      Mostrar "salida con mostrar"
      Imprimir "salida con imprimir"
    FinAlgoritmo`;
    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('salida con mostrar\nsalida con imprimir');
  });

  it('soporta asignación con := y operador módulo con %', () => {
    const code = `Algoritmo pascal_style
      Definir x Entero
      x := 17 % 5
      Escribir x
    FinAlgoritmo`;
    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('2');
  });
});

describe('PSeInt · estrés y casos reales extremos', () => {
  it('resuelve el problema de funciones_y_parametros en todas sus variantes habituales', () => {
    // 1. Variante estándar con Procedimiento antes de Algoritmo
    const code1 = `Procedimiento Saludar(nombre)
      Escribir "Hola, ", nombre, "!"
    FinProcedimiento

    Algoritmo funciones_y_parametros
      Definir nombre Como Cadena
      Leer nombre
      Saludar(nombre)
    FinAlgoritmo`;
    expect(run(code1, 'Ana').out).toBe('Hola, Ana!');

    // 2. Variante con SubProceso dentro del Algoritmo
    const code2 = `Algoritmo funciones_y_parametros
      SubProceso Saludar(nombre)
        Escribir "Hola, ", nombre, "!"
      FinSubProceso

      Definir nombre Como Cadena
      Leer nombre
      Saludar(nombre)
    FinAlgoritmo`;
    expect(run(code2, 'Carlos').out).toBe('Hola, Carlos!');

    // 3. Variante con Funcion al final de Algoritmo
    const code3 = `Algoritmo funciones_y_parametros
      Definir nombre Como Cadena
      Leer nombre
      Saludar(nombre)
    FinAlgoritmo

    Funcion Saludar(nombre)
      Escribir "Hola, ", nombre, "!"
    FinFuncion`;
    expect(run(code3, 'Elena').out).toBe('Hola, Elena!');

    // 4. Variante invocando sin paréntesis (Saludar nombre)
    const code4 = `SubProceso Saludar(nombre)
      Escribir "Hola, ", nombre, "!"
    FinSubProceso

    Algoritmo funciones_y_parametros
      Definir nombre Como Cadena
      Leer nombre
      Saludar nombre
    FinAlgoritmo`;
    expect(run(code4, 'Mateo').out).toBe('Hola, Mateo!');
  });

  it('soporta funciones con variable de retorno oficial de PSeInt (ret <- Funcion(x))', () => {
    const code = `Algoritmo retorno_test
      Definir x, y, z Entero
      x <- Doble(5)
      y <- Triple(4)
      z <- Cuadrado(3)
      Escribir x, " ", y, " ", z
    FinAlgoritmo

    Funcion res <- Doble(n)
      res <- n * 2
    FinFuncion

    SubProceso res = Triple(n)
      res = n * 3
    FinSubProceso

    Funcion res := Cuadrado(n)
      res := n * n
    FinFuncion`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('10 12 9');
  });

  it('soporta paso de parámetros Por Referencia, Por Valor y con tipo', () => {
    const code = `SubProceso Incrementar(num Por Referencia, cant Por Valor, etiqueta Como Cadena)
      num <- num + cant
      Escribir etiqueta, ": ", num
    FinSubProceso

    Algoritmo test_refs
      Definir val Entero
      val <- 10
      Incrementar(val, 5, "Valor incrementado")
      Escribir "Final: ", val
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('Valor incrementado: 15\nFinal: 15');
  });

  it('soporta funciones matemáticas y de cadena nativas de PSeInt', () => {
    const code = `Algoritmo builtins
      Definir r1, r2, a, tr, rd Entero
      Definir cad Como Cadena
      r1 <- Raiz(16)
      r2 <- Rc(25)
      a <- Abs(-42)
      tr <- Trunc(9.8)
      rd <- Redon(9.8)
      cad <- "Hola Mundo"

      Escribir r1, " ", r2, " ", a, " ", tr, " ", rd
      Escribir Longitud(cad)
      Escribir Mayusculas("pseint")
      Escribir Minusculas("SYSENG")
      Escribir Subcadena(cad, 1, 4)
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('4 5 42 9 10\n10\nPSEINT\nsyseng\nHola');
  });

  it('soporta arreglos con indexación 1-based tradicional de PSeInt (1..N)', () => {
    const code = `Algoritmo arreglos_1_based
      Dimension lista[5]
      Para i <- 1 Hasta 5
        lista[i] <- i * 10
      FinPara

      Para i <- 1 Hasta 5
        Escribir lista[i], " "
      FinPara
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('10\n20\n30\n40\n50');
  });

  it('soporta bucle Para con sintaxis libre (Para i = 1 Hasta 5 Con Paso 2 Hacer)', () => {
    const code = `Algoritmo para_flexible
      Para i = 1 Hasta 5 Con Paso 2 Hacer
        Escribir i
      FinPara
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('1\n3\n5');
  });

  it('soporta Segun con múltiples valores por caso y números negativos', () => {
    const code = `Algoritmo segun_multiple
      Definir x Entero
      Leer x
      Segun x Hacer
        Caso -1:
          Escribir "menos uno"
        Caso 1, 2, 3:
          Escribir "bajo"
        Caso 4, 5:
          Escribir "medio"
        De Otro Modo:
          Escribir "otro"
      FinSegun
    FinAlgoritmo`;

    expect(run(code, '-1').out).toBe('menos uno');
    expect(run(code, '2').out).toBe('bajo');
    expect(run(code, '5').out).toBe('medio');
    expect(run(code, '99').out).toBe('otro');
  });

  it('soporta Limpiar Pantalla, Esperar Tecla y Escribir Sin Saltar', () => {
    const code = `Algoritmo comandos_interactivos
      Limpiar Pantalla
      Borrar Pantalla
      Esperar 1 Segundos
      Esperar Tecla
      Escribir "Cargando... " Sin Saltar
      Escribir "100%"
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('Cargando... 100%');
  });

  it('es totalmente insensible a mayúsculas y minúsculas en nombres de variables', () => {
    const code = `Algoritmo case_insens
      Definir MiVariable Como Entero
      mivariable <- 100
      MIVARIABLE <- mivariable + 50
      Escribir MiVariable
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('150');
  });

  it('soporta operadores lógicos modernos (==, !=, AND, OR, NOT, True, False)', () => {
    const code = `Algoritmo logica_moderna
      Definir a, b Entero
      a <- 10
      b <- 20
      Si (a != b) AND (a < b OR NOT True) Entonces
        Escribir "condicion cumplida"
      FinSi
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('condicion cumplida');
  });

  it('soporta funciones recursivas (Factorial y Fibonacci con variable de retorno)', () => {
    const code = `Algoritmo recursion
      Escribir Factorial(5)
      Escribir Fibonacci(7)
    FinAlgoritmo

    Funcion res <- Factorial(n)
      Si n <= 1 Entonces
        res <- 1
      Sino
        res <- n * Factorial(n - 1)
      FinSi
    FinFuncion

    Funcion f <- Fibonacci(n)
      Si n <= 0 Entonces
        f <- 0
      Sino
        Si n = 1 Entonces
          f <- 1
        Sino
          f <- Fibonacci(n - 1) + Fibonacci(n - 2)
        FinSi
      FinSi
    FinFuncion`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('120\n13');
  });

  it('soporta variables con nombres que contienen prefijos de palabras clave (operacion, siguiente, finalizado)', () => {
    const code = `Algoritmo prefijos
      Definir operacion, siguiente, finalizado Entero
      operacion <- 10
      siguiente <- operacion + 1
      finalizado <- siguiente * 2
      Escribir operacion, " ", siguiente, " ", finalizado
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('10 11 22');
  });

  it('soporta expresiones negativas complejas y anidamiento de paréntesis', () => {
    const code = `Algoritmo expresion_compleja
      Definir a, b, c, res Entero
      a <- 5
      b <- 15
      c <- 2
      res <- -(a + b) * c + (-10 / -2)
      Escribir res
    FinAlgoritmo`;

    const res = run(code);
    expect(res.stderr).toBe('');
    expect(res.out).toBe('-35');
  });
});
