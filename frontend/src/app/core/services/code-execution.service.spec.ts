import '@angular/compiler';
import { describe, expect, it } from 'bun:test';
import { matchesOutput } from './code-execution.service';

describe('code-execution · matchesOutput intelligent test matcher', () => {
  it('coincidencia exacta tras normalizar saltos CRLF y espacios al final', () => {
    expect(matchesOutput("Hola, mundo!\r\n", "Hola, mundo!")).toBe(true);
    expect(matchesOutput("Linea 1   \nLinea 2\t\n", "Linea 1\nLinea 2")).toBe(true);
  });

  it('coincidencia insensible a mayúsculas/minúsculas', () => {
    expect(matchesOutput("hola mundo", "HOLA MUNDO")).toBe(true);
    expect(matchesOutput("VERDADERO", "verdadero")).toBe(true);
  });

  it('ignora prompts interactivos si la salida esperada está al final', () => {
    expect(matchesOutput("escriba su nombre\nHola, Carlos!", "Hola, Carlos!")).toBe(true);
    expect(matchesOutput("Ingrese n1:\nIngrese n2:\nResultado: 42", "Resultado: 42")).toBe(true);
  });

  it('permite coincidencia si el valor esperado es de una línea y está al final de la última línea', () => {
    expect(matchesOutput("El total calculado es: 100", "100")).toBe(true);
  });

  it('acepta equivalencia numérica en punto flotante', () => {
    expect(matchesOutput("121.0", "121")).toBe(true);
    expect(matchesOutput("121", "121.0")).toBe(true);
    expect(matchesOutput("0.0", "0")).toBe(true);
    expect(matchesOutput("3.14159", "3.14159")).toBe(true);
    expect(matchesOutput("121.5", "121")).toBe(false);
  });

  it('acepta equivalencia por secuencia de tokens para arreglos y listas ordenadas', () => {
    expect(matchesOutput("1 2 3 4 5", "1\n2\n3\n4\n5")).toBe(true);
    expect(matchesOutput("1\n2\n3\n4\n5", "1 2 3 4 5")).toBe(true);
    expect(matchesOutput("1.0 2.0 3.0", "1 2 3")).toBe(true);
    expect(matchesOutput("1 2 9", "1 2 3")).toBe(false);
  });
});
