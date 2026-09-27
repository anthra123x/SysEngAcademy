/**
 * Intérprete de PSeInt en TypeScript puro (sin dependencias).
 *
 * Subset soportado:
 *   - Bloques: Algoritmo/Proceso … FinAlgoritmo/FinProceso
 *   - SubProgramas: Procedimiento/SubProceso … FinProcedimiento/FinSubProceso
 *     (con parámetros y `Devolver`; los arreglos se pasan por referencia)
 *   - Declaración: Definir a, b, c  [Enter|Real|Cadena|Caracter|Logico]
 *   - Arreglos 1D: Dimension n, con índices a[i]
 *   - Entrada/Salida: Leer a, b  /  Escribir x, "texto", y
 *   - Control: Si…Entonces…Sino…FinSi, Mientras…Hacer…FinMientras,
 *     Repetir…Hasta Que, Para…Para…FinPara, Segun…Caso…FinSegun
 *   - Operadores: + - * / ^ mod, = <> < > <= >=, y, o, no
 *   - Comentarios: // y /* … *\/
 */

export type PseintTone = 'info' | 'tip' | 'warning' | 'danger';

export interface PseintResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  error?: { line: number; message: string };
}

type Value = number | string | boolean | null | Value[];

/** Tipo lógico de una expresión, para respetar la división entera de PSeInt. */
type NumType = 'ent' | 'real' | 'otro';

interface Token {
  type: 'num' | 'str' | 'id' | 'op';
  value: string;
  pos: number;
}

class PseintError extends Error {
  constructor(message: string, readonly line: number) {
    super(message);
  }
}

// ─────────────────────────────── Tokenizador ───────────────────────────────

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isDigit = (c: string) => c >= '0' && c <= '9';
  const isIdStart = (c: string) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]/.test(c);
  const isIdPart = (c: string) => isIdStart(c) || isDigit(c);

  while (i < src.length) {
    const c = src[i];

    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
      i++;
      continue;
    }

    // Comentario de línea
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }

    // Comentario de bloque
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // Número (soporta decimales)
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1] ?? ''))) {
      let j = i;
      while (j < src.length && (isDigit(src[j]) || src[j] === '.')) j++;
      tokens.push({ type: 'num', value: src.slice(i, j).replace(/\.$/, ''), pos: i });
      i = j;
      continue;
    }

    // Cadena entre comillas dobles (PSeInt no escapa; se cierra en la 2ª comilla)
    if (c === '"') {
      const end = src.indexOf('"', i + 1);
      if (end === -1) throw new PseintError('Cadena sin cerrar', lineOf(src, i));
      tokens.push({ type: 'str', value: src.slice(i + 1, end), pos: i });
      i = end + 1;
      continue;
    }

    // Identificador (puede traer subíndices/accesos: a[i], a[1])
    if (isIdStart(c)) {
      let j = i;
      while (j < src.length && isIdPart(src[j])) j++;
      tokens.push({ type: 'id', value: src.slice(i, j), pos: i });
      i = j;
      continue;
    }

    // Operadores de dos caracteres
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '<>', '<-'].includes(two)) {
      tokens.push({ type: 'op', value: two, pos: i });
      i += 2;
      continue;
    }

    if ('+-*/^()[]<>=,'.includes(c)) {
      tokens.push({ type: 'op', value: c, pos: i });
      i++;
      continue;
    }

    // Acento de operador (mod, y, o, no) o símbolo suelto
    tokens.push({ type: 'op', value: c, pos: i });
    i++;
  }

  return tokens;
}

function lineOf(src: string, pos: number): number {
  return src.slice(0, pos).split('\n').length;
}

// ─────────────────────────────── Parser (AST) ──────────────────────────────

type Node =
  | { kind: 'block'; body: Node[] }
  | { kind: 'escribir'; args: Expr[] }
  | { kind: 'leer'; targets: Expr[] }
  | { kind: 'definir'; names: string[]; arrays?: { name: string; size: number }[]; type?: NumType }
  | { kind: 'dimension'; name: string; size: Expr }
  | { kind: 'asign'; target: Expr; value: Expr }
  | { kind: 'si'; cond: Expr; then: Node[]; otherwise: Node[] | null }
  | { kind: 'mientras'; cond: Expr; body: Node[] }
  | { kind: 'repetir'; body: Node[]; cond: Expr }
  | { kind: 'para'; varName: string; from: Expr; to: Expr; step: Expr | null; body: Node[] }
  | { kind: 'segun'; subject: Expr; cases: { value: number; body: Node[] }[]; fallback: Node[] | null }
  | { kind: 'procedimiento'; name: string; params: string[]; body: Node[] }
  | { kind: 'devolver'; value: Expr }
  | { kind: 'llamada'; name: string; args: Expr[] };

type Expr =
  | { kind: 'num'; value: number; raw?: string }
  | { kind: 'str'; value: string }
  | { kind: 'var'; name: string }
  | { kind: 'index'; name: string; index: Expr }
  | { kind: 'call'; name: string; args: Expr[] }
  | { kind: 'bin'; op: string; left: Expr; right: Expr }
  | { kind: 'un'; op: string; operand: Expr };

const TYPES = new Set(['enter', 'real', 'cadena', 'caracter', 'logico']);
const TIPO_NUMERICO: Record<string, NumType> = { enter: 'ent', real: 'real' };

const KEYWORDS = new Set([
  'algoritmo', 'proceso', 'finalgoritmo', 'finproceso', 'escribir', 'leer', 'definir',
  'dimension', 'si', 'entonces', 'sino', 'si_no', 'finsi', 'mientras', 'hacer', 'finmientras',
  'repetir', 'hasta', 'hastaque', 'que', 'para', 'finpara', 'segun', 'caso', 'otro', 'finsegun',
  'procedimiento', 'subproceso', 'finprocedimiento', 'finsubproceso', 'devolver', 'y', 'o', 'no',
  'mod', 'paso',
]);

class Parser {
  private p = 0;
  private pendingArrays: { name: string; size: Expr }[] = [];
  private arraysDeclared: { name: string; size: number }[] = [];

  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token | undefined {
    return this.tokens[this.p + offset];
  }

  private next(): Token | undefined {
    return this.tokens[this.p++];
  }

  /**
   * ¿El token actual coincide con `value`?
   *
   * Importante: las palabras clave (Si, Sino, no, y, o, caso…) se comparan
   * SOLO contra tokens de tipo identificador. Si no, el texto entre comillas
   * `Escribir "no"` se confundiría con el operador lógico `no`, o `"si"` con
   * la palabra clave `Si`, y el parser se comería la siguiente instrucción.
   */
  private at(value: string): boolean {
    const t = this.peek();
    if (!t) return false;
    if (t.value.toLowerCase() !== value.toLowerCase()) return false;
    // Las palabras (solo letras) deben llegar como identificadores, nunca como
    // cadenas literales ni como operadores.
    return /^[a-z_]+$/i.test(value) ? t.type === 'id' : true;
  }

  private eat(value: string): boolean {
    if (this.at(value)) {
      this.p++;
      return true;
    }
    return false;
  }

  private expect(value: string): void {
    if (!this.eat(value)) {
      const t = this.peek();
      throw new PseintError(
        `Se esperaba "${value}"${t ? ` pero se encontró "${t.value}"` : ' (fin de la entrada)'}`,
        t ? lineOf('', 0) : 0,
      );
    }
  }

  private expectId(): string {
    const t = this.next();
    if (!t || t.type !== 'id') throw new PseintError('Se esperaba un identificador', 0);
    return t.value;
  }

  /** Programa completo → lista de sentencias. */
  parseProgram(): Node[] {
    const body: Node[] = [];

    // Orden válido en PSeInt: subprogramas, luego Algoritmo/Proceso con su
    // cuerpo, y subprogramas again. Aceptamos cualquiera de los tres sitios.
    while (this.at('procedimiento') || this.at('subproceso') || this.at('funcion')) {
      body.push(this.parseProcedure());
    }

    if (this.at('algoritmo') || this.at('proceso')) {
      this.p++;
      this.expectId();
    }

    body.push(...this.parseStatements(() => this.at('finalgoritmo') || this.at('finproceso')));

    if (this.at('finalgoritmo') || this.at('finproceso')) this.p++;

    while (this.at('procedimiento') || this.at('subproceso') || this.at('funcion')) {
      body.push(this.parseProcedure());
    }
    return body;
  }

  private parseProcedure(): Node {
    this.p++; // Procedimiento | SubProceso | Funcion
    const name = this.expectId();
    const params: string[] = [];
    if (this.eat('(')) {
      while (!this.at(')')) {
        params.push(this.expectId());
        if (!this.eat(',')) break;
      }
      this.expect(')');
    }
    const body = this.parseStatements(() =>
      this.at('finprocedimiento') || this.at('finsubproceso') || this.at('finfuncion'));
    if (!this.eat('finprocedimiento')) {
      if (!this.eat('finsubproceso')) this.expect('finfuncion');
    }
    return { kind: 'procedimiento', name, params, body };
  }

  /** Lee sentencias hasta que `done()` sea cierto. */
  private parseStatements(done: () => boolean): Node[] {
    const out: Node[] = [];
    while (this.p < this.tokens.length && !done()) {
      const t = this.peek();
      if (!t) break;
      const word = t.value.toLowerCase();

      switch (word) {
        case 'si':
          out.push(this.parseSi());
          break;
        case 'mientras':
          out.push(this.parseMientras());
          break;
        case 'repetir':
          out.push(this.parseRepetir());
          break;
        case 'para':
          out.push(this.parsePara());
          break;
        case 'segun':
          out.push(this.parseSegun());
          break;
        case 'procedimiento':
        case 'subproceso':
        case 'funcion':
          // Declaración de subprograma: se registra y el cuerpo continúa.
          out.push(this.parseProcedure());
          break;
        case 'finmientras':
        case 'finsi':
        case 'finpara':
        case 'finsegun':
        case 'finalgoritmo':
        case 'finproceso':
          return out; // el cierre lo consume quien llama
        default:
          out.push(this.parseSimple());
      }
    }
    return out;
  }

  private parseSimple(): Node {
    const t = this.peek()!;
    const word = t.value.toLowerCase();

    if (word === 'escribir') {
      this.p++;
      const args: Expr[] = [this.parseExpr()];
      while (this.eat(',')) args.push(this.parseExpr());
      return { kind: 'escribir', args };
    }

    if (word === 'leer') {
      this.p++;
      const targets: Expr[] = [this.parseExpr()];
      while (this.eat(',')) targets.push(this.parseExpr());
      return { kind: 'leer', targets };
    }

    if (word === 'definir') {
      this.p++;
      return this.parseDeclaracion(false);
    }

    // Forma canónica con el tipo delante: "Real a[5]", "Enter i, j", "Cadena nombre"
    if (TYPES.has(word)) {
      this.p++;
      return this.parseDeclaracion(true, word);
    }

    if (word === 'dimension') {
      this.p++;
      // "Dimension 3" (literal) o "Dimension n" (variable)
      const first = this.next();
      if (!first) throw new PseintError('Dimension sin valor', 0);
      let name = '';
      let size: Expr = { kind: 'num', value: Number(first.value) };
      if (first.type === 'id') {
        name = first.value;
        this.expect('[');
        size = this.parseExpr();
        this.expect(']');
      } else if (first.type !== 'num') {
        throw new PseintError('Dimension inválido', 0);
      }
      if (name) this.pendingArrays.push({ name, size });
      return { kind: 'dimension', name, size };
    }

    if (word === 'devolver') {
      this.p++;
      return { kind: 'devolver', value: this.parseExpr() };
    }

    // Asignación: a <- expr   |   a = expr  (dentro de subprograma)
    const target = this.parseExpr();
    if (this.eat('<-') || this.eat('=')) {
      const value = this.parseExpr();
      if (target.kind !== 'var' && target.kind !== 'index') {
        throw new PseintError('El destino de la asignación debe ser una variable', 0);
      }
      return { kind: 'asign', target, value };
    }

    if (target.kind === 'call') {
      return { kind: 'llamada', name: target.name, args: target.args };
    }

    if (target.kind === 'var') {
      return { kind: 'llamada', name: target.name, args: [] };
    }

    throw new PseintError(`Sentencia no reconocida: "${t.value}"`, 0);
  }


  /** Declara variables y arreglos: `Definir a, b Enter` o `Real a[5], b`. */
  private parseDeclaracion(tipoPrimero: boolean, tipo?: string): Node {
    const names: string[] = [];
    let type: NumType | undefined = tipoPrimero ? TIPO_NUMERICO[(tipo ?? '').toLowerCase()] ?? 'ent' : undefined;
    do {
      if (this.at('[')) { // dimensión reutilizada: "Real [5]" no se usa; se ignora
        this.p++;
        this.next();
        this.expect(']');
      }
      const name = this.expectId();
      names.push(name);
      if (this.eat('[')) {
        // "Real a[5]" crea el arreglo con la dimensión indicada
        const size = this.parseExpr();
        this.expect(']');
        this.pendingArrays.push({ name, size });
      }
      // Toleramos el tipo por variable ("Definir a Enter, b Enter"), aunque en
      // PSeInt lo habitual es ponerlo una sola vez al final. Solo se consume si
      // detrás viene una coma: de lo contrario ese tipo pertenece a la
      // declaración siguiente ("Real a[5], aux" seguido de "Enter i, j").
      const after = this.peek();
      const afterNext = this.peek(1);
      if (
        after &&
        after.type === 'id' &&
        TYPES.has(after.value.toLowerCase()) &&
        afterNext?.value === ','
      ) {
        this.p++;
        type = TIPO_NUMERICO[after.value.toLowerCase()] ?? type;
      }
    } while (this.eat(','));

    if (!tipoPrimero) {
      const t = this.peek();
      if (t && TYPES.has(t.value.toLowerCase())) {
        this.p++;
        type = TIPO_NUMERICO[t.value.toLowerCase()] ?? 'ent';
      }
    }

    // materializa los arreglos declarados con tamaño explícito
    for (const arr of this.pendingArrays.splice(0)) {
      const size = Math.max(0, Math.trunc(Number(this.literalOf(arr.size))));
      this.arraysDeclared.push({ name: arr.name, size });
    }

    return { kind: 'definir', names, arrays: this.arraysDeclared.splice(0), type };
  }

  /** Evalúa una expresión que solo puede ser literal numérico (tamaño de arreglo). */
  private literalOf(e: Expr): number {
    if (e.kind === 'num') return e.value;
    if (e.kind === 'bin') {
      const l = this.literalOf(e.left);
      const r = this.literalOf(e.right);
      if (e.op === '+') return l + r;
      if (e.op === '-') return l - r;
      if (e.op === '*') return l * r;
    }
    return 0;
  }

  private parseSi(): Node {
    this.p++; // Si
    const cond = this.parseExpr();
    this.eat('entonces'); // opcional: se omite al escribir el bloque en varias líneas
    const then = this.parseStatements(() => this.at('sino') || this.at('si_no') || this.at('finsi'));
    let otherwise: Node[] | null = null;
    if (this.eat('sino') || this.eat('si_no')) {
      otherwise = this.parseStatements(() => this.at('finsi'));
    }
    this.expect('finsi');
    return { kind: 'si', cond, then, otherwise };
  }

  private parseMientras(): Node {
    this.p++; // Mientras
    const cond = this.parseExpr();
    this.eat('hacer'); // opcional: muchos autores lo omiten
    const body = this.parseStatements(() => this.at('finmientras'));
    this.expect('finmientras');
    return { kind: 'mientras', cond, body };
  }

  private parseRepetir(): Node {
    this.p++; // Repetir
    const body = this.parseStatements(() => this.at('hasta') || this.at('hastaque'));
    // Sintaxis PSeInt: "Hasta Que <cond>"; también se admite "HastaQue <cond>".
    // Hay que consumir AMBAS palabras: si solo seughtera "Hasta", el token
    // "Que" se interpretaría como el inicio de la condición.
    if (this.at('hastaque')) {
      this.p++; // "HastaQue" pegado
    } else if (this.at('hasta')) {
      this.p++; // "Hasta"
      this.eat('que'); // "Que"
    }
    const cond = this.parseExpr();
    return { kind: 'repetir', body, cond };
  }

  private parsePara(): Node {
    this.p++; // Para
    const varName = this.expectId();
    this.expect('<-');
    const from = this.parseExpr();
    // To | Hasta
    if (!this.eat('to') && !this.eat('hasta')) {
      throw new PseintError('Se esperaba "Para … Hasta/To"', 0);
    }
    const to = this.parseExpr();
    // `Paso` es opcional: si el autor no lo escribe, el sentido del recorrido
    // se decide en tiempo de ejecución comparando los valores reales (aquí solo
    // hay tokens, y un límite como "der - 1" todavía no se puede evaluar).
    let step: Expr | null = null;
    if (this.eat('paso')) step = this.parseExpr();
    this.eat('hacer'); // opcional
    const body = this.parseStatements(() => this.at('finpara'));
    this.expect('finpara');
    return { kind: 'para', varName, from, to, step, body };
  }

  private parseSegun(): Node {
    this.p++; // Segun
    const subject = this.parseExpr();
    this.eat('hacer'); // "Segun x Hacer" (opcional en la práctica)
    // No se exige un "Caso" inicial: el bucle de abajo procesa todos.
    const cases: { value: number; body: Node[] }[] = [];
    let fallback: Node[] | null = null;

    for (;;) {
      if (this.eat('finsegun')) break;
      if (this.eat('caso')) {
        const numTok = this.next();
        if (!numTok || numTok.type !== 'num') throw new PseintError('Valor de Caso inválido', 0);
        this.expect(':');
        const body = this.parseStatements(() => this.at('caso') || this.at('otro') || this.at('finsegun'));
        cases.push({ value: Number(numTok.value), body });
        continue;
      }
      if (this.eat('otro')) {
        this.expect(':');
        fallback = this.parseStatements(() => this.at('finsegun'));
        continue;
      }
      throw new PseintError('Se esperaba "Caso", "Otro" o "FinSegun"', 0);
    }
    return { kind: 'segun', subject, cases, fallback };
  }

  // ── Expresiones (precedencia de menor a mayor) ──
  parseExpr(): Expr {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): Expr {
    let left = this.parseLogicalAnd();
    while (this.at('o')) {
      this.p++;
      left = { kind: 'bin', op: 'o', left, right: this.parseLogicalAnd() };
    }
    return left;
  }

  private parseLogicalAnd(): Expr {
    let left = this.parseComparison();
    while (this.at('y')) {
      this.p++;
      left = { kind: 'bin', op: 'y', left, right: this.parseComparison() };
    }
    return left;
  }

  private parseComparison(): Expr {
    let left = this.parseAdditive();
    for (;;) {
      const t = this.peek();
      if (!t || t.type !== 'op') break;
      const op = t.value;
      if (!['=', '<>', '<', '>', '<=', '>='].includes(op)) break;
      this.p++;
      left = { kind: 'bin', op, left, right: this.parseAdditive() };
    }
    return left;
  }

  private parseAdditive(): Expr {
    let left = this.parseMultiplicative();
    for (;;) {
      const t = this.peek();
      if (!t || (t.value !== '+' && t.value !== '-')) break;
      this.p++;
      left = { kind: 'bin', op: t.value, left, right: this.parseMultiplicative() };
    }
    return left;
  }

  private parseMultiplicative(): Expr {
    let left = this.parsePower();
    for (;;) {
      const t = this.peek();
      if (!t) break;
      if (t.value === '*' || t.value === '/') {
        this.p++;
        left = { kind: 'bin', op: t.value, left, right: this.parsePower() };
        continue;
      }
      if (t.value.toLowerCase() === 'mod') {
        this.p++;
        left = { kind: 'bin', op: 'mod', left, right: this.parsePower() };
        continue;
      }
      // Ningún operador multiplicativo: termina el bucle (si no, bucle infinito).
      break;
    }
    return left;
  }

  private parsePower(): Expr {
    const base = this.parseUnary();
    if (this.at('^')) {
      this.p++;
      return { kind: 'bin', op: '^', left: base, right: this.parsePower() }; // asociativo por la derecha
    }
    return base;
  }

  private parseUnary(): Expr {
    if (this.at('-')) {
      this.p++;
      return { kind: 'un', op: '-', operand: this.parseUnary() };
    }
    if (this.at('no')) {
      this.p++;
      return { kind: 'un', op: 'no', operand: this.parseUnary() };
    }
    if (this.at('+')) {
      this.p++;
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Expr {
    const t = this.next();
    if (!t) throw new PseintError('Expresión incompleta', 0);

    if (t.type === 'num') return { kind: 'num', value: Number(t.value), raw: t.value };
    if (t.type === 'str') return { kind: 'str', value: t.value };

    if (t.type === 'id') {
      const low = t.value.toLowerCase();
      if (low === 'verdadero') return { kind: 'num', value: 1 };
      if (low === 'falso') return { kind: 'num', value: 0 };
      if (this.at('[')) {
        this.p++;
        const idx = this.parseExpr();
        this.expect(']');
        return { kind: 'index', name: t.value, index: idx };
      }
      if (this.at('(')) {
        this.p++;
        const args: Expr[] = [];
        while (!this.at(')')) {
          args.push(this.parseExpr());
          if (!this.eat(',')) break;
        }
        this.expect(')');
        return { kind: 'call', name: t.value, args };
      }
      return { kind: 'var', name: t.value };
    }

    if (t.value === '(') {
      const e = this.parseExpr();
      this.expect(')');
      return e;
    }

    if (t.type === 'op' && ['verdadero', 'falso'].includes(t.value.toLowerCase())) {
      return { kind: 'num', value: t.value.toLowerCase() === 'verdadero' ? 1 : 0 };
    }

    throw new PseintError(`Token inesperado: "${t.value}"`, 0);
  }

  get position(): number {
    return this.p;
  }
}

// ─────────────────────────────── Intérprete ───────────────────────────────

class Runtime {
  private vars = new Map<string, Value>();
  private types = new Map<string, NumType>();
  private procedures = new Map<string, { params: string[]; body: Node[] }>();
  private out: string[] = [];
  private input: string[] = [];
  private inputIdx = 0;
  private steps = 0;

  constructor(private readonly stdin: string, private readonly maxSteps = 200_000) {
    // PSeInt lee valores separados por espacios o saltos de línea:
    // `Leer a, b, c` con "5 3 8" consume 5, luego 3, luego 8.
    this.input = stdin.replace(/\r/g, '').split(/\s+/).filter((v) => v !== '');
  }

  define(name: string, value: Value): void {
    this.vars.set(name, value);
  }

  /** Tipo declarado de una variable (Enter/Real). Por defecto, entero. */
  declareType(name: string, type: NumType): void {
    this.types.set(name, type);
  }

  /** Tipo efectivo de una expresión. */
  private typeOf(e: Expr): NumType {
    switch (e.kind) {
      case 'num':
        // Se usa el texto original del literal: Number('2.0') es 2 y perdería
        // el decimal que lo distingue de un Enter.
        return (e.raw ?? String(e.value)).includes('.') ? 'real' : 'ent';
      case 'var':
        return this.types.get(e.name) ?? 'ent';
      case 'index':
        return this.types.get(e.name) ?? 'ent';
      case 'un':
        return this.typeOf(e.operand);
      case 'bin': {
        if (!['+', '-', '*', '/', '^', 'mod'].includes(e.op)) return 'otro';
        const l = this.typeOf(e.left);
        const r = this.typeOf(e.right);
        if (l === 'real' || r === 'real') return 'real';
        if (l === 'ent' && r === 'ent') return 'ent';
        return 'otro';
      }
      default:
        return 'otro';
    }
  }

  get(name: string): Value {
    return this.vars.get(name) ?? null;
  }

  set(name: string, value: Value): void {
    this.vars.set(name, value);
  }

  registerProcedure(name: string, params: string[], body: Node[]): void {
    this.procedures.set(name.toLowerCase(), { params, body });
  }

  get stdout(): string {
    return this.out.join('\n');
  }

  private static readonly MAX_OUT_LINES = 5_000;

  private push(text: string): void {
    if (this.out.length >= Runtime.MAX_OUT_LINES) {
      throw new PseintError('El programa imprime demasiadas líneas (posible bucle infinito)', 0);
    }
    this.out.push(text);
  }

  private tick(): void {
    if (++this.steps > this.maxSteps) {
      throw new PseintError('El programa excedió el límite de operaciones (posible bucle infinito)', 0);
    }
  }

  // ── Expresiones ──
  eval(e: Expr): Value {
    switch (e.kind) {
      case 'num':
        return e.value;
      case 'str':
        return e.value;
      case 'var':
        return this.get(e.name);
      case 'index': {
        const arr = this.get(e.name);
        const i = Math.trunc(Number(this.eval(e.index)));
        if (!Array.isArray(arr)) {
          throw new PseintError(`"${e.name}" no es un arreglo`, 0);
        }
        if (i < 0 || i >= arr.length) {
          throw new PseintError(`Índice ${i} fuera de rango en "${e.name}"`, 0);
        }
        return arr[i] ?? null;
      }
      case 'call':
        return this.call(e.name, e.args) ?? null;
      case 'un': {
        const v = this.eval(e.operand);
        if (e.op === '-') return -Number(v ?? 0);
        return truthy(v) ? 0 : 1;
      }
      case 'bin': {
        // Cortocircuito: sin él, "Mientras j >= 0 Y a[j] > aux" intentaría
        // leer a[-1] aunque la primera condición ya sea falsa.
        if (e.op === 'y') {
          return truthy(this.eval(e.left)) ? (truthy(this.eval(e.right)) ? 1 : 0) : 0;
        }
        if (e.op === 'o') {
          return truthy(this.eval(e.left)) ? 1 : (truthy(this.eval(e.right)) ? 1 : 0);
        }
        if (e.op === '/') {
          const lt = this.typeOf(e.left);
          const rt = this.typeOf(e.right);
          const a = this.eval(e.left);
          const b = this.eval(e.right);
          if (lt === 'ent' && rt === 'ent') {
            const d = toNum(b);
            if (d === 0) throw new PseintError('División entre cero', 0);
            // PSeInt: Enter / Enter devuelve Enter (división entera)
            return Math.trunc(toNum(a) / d);
          }
          return binary(e.op, a, b);
        }
        const a = this.eval(e.left);
        const b = this.eval(e.right);
        return binary(e.op, a, b);
      }
    }
  }

  /** Asigna a variable o a índice de arreglo. */
  assign(target: Expr, value: Value): void {
    if (target.kind === 'var') {
      this.set(target.name, value);
      return;
    }
    if (target.kind !== 'index') {
      throw new PseintError('El destino de la asignación debe ser una variable o un índice', 0);
    }
    const arr = this.get(target.name);
    if (!Array.isArray(arr)) {
      throw new PseintError(`"${target.name}" no es un arreglo`, 0);
    }
    const i = Math.trunc(Number(this.eval(target.index)));
    if (i < 0 || i >= arr.length) {
      throw new PseintError(`Índice ${i} fuera de rango en "${target.name}"`, 0);
    }
    arr[i] = value;
  }

  // ── Sentencias ──
  execBlock(body: Node[]): Value | undefined {
    for (const node of body) {
      const ret = this.exec(node);
      if (ret !== undefined) return ret;
    }
    return undefined;
  }

  exec(node: Node): Value | undefined {
    this.tick();

    switch (node.kind) {
      case 'definir':
        for (const n of node.names) {
          if (!this.vars.has(n)) this.vars.set(n, node.type === 'real' ? 0 : 0);
          this.declareType(n, node.type ?? 'ent');
        }
        for (const arr of node.arrays ?? []) {
          if (!Array.isArray(this.vars.get(arr.name))) {
            this.vars.set(arr.name, new Array(Math.max(0, arr.size)).fill(0));
          }
        }
        return undefined;

      case 'dimension': {
        const size = Math.max(0, Math.trunc(Number(this.eval(node.size))));
        this.vars.set(node.name, new Array(size).fill(0));
        return undefined;
      }

      case 'asign':
        this.assign(node.target, this.eval(node.value));
        return undefined;

      case 'escribir': {
        const parts = node.args.map((a) => toText(this.eval(a)));
        this.push(parts.join(''));
        return undefined;
      }

      case 'leer': {
        for (const t of node.targets) {
          const raw = this.input[this.inputIdx] ?? '';
          this.inputIdx++;
          const value = parseInput(raw);
          this.assign(t, value);
        }
        return undefined;
      }

      case 'si':
        if (truthy(this.eval(node.cond))) return this.execBlock(node.then);
        if (node.otherwise) return this.execBlock(node.otherwise);
        return undefined;

      case 'mientras':
        while (truthy(this.eval(node.cond))) {
          this.tick();
          const ret = this.execBlock(node.body);
          if (ret !== undefined) return ret;
        }
        return undefined;

      case 'repetir':
        do {
          this.tick();
          const ret = this.execBlock(node.body);
          if (ret !== undefined) return ret;
        } while (!truthy(this.eval(node.cond)));
        return undefined;

      case 'para': {
        const from = Number(this.eval(node.from));
        const to = Number(this.eval(node.to));
        // Sin "Paso" explícito, PSeInt recorre hacia atrás si el límite final
        // es menor que el inicial (p. ej. "Para i <- 3 Hasta 1").
        const step = node.step ? Number(this.eval(node.step)) : from <= to ? 1 : -1;
        this.set(node.varName, from);
        const ascending = step > 0;
        for (let i = from; ascending ? i <= to : i >= to; i += step) {
          this.tick();
          this.set(node.varName, i);
          const ret = this.execBlock(node.body);
          if (ret !== undefined) return ret;
        }
        return undefined;
      }

      case 'segun': {
        const subject = Math.trunc(Number(this.eval(node.subject)));
        const found = node.cases.find((c) => c.value === subject);
        if (found) return this.execBlock(found.body);
        if (node.fallback) return this.execBlock(node.fallback);
        return undefined;
      }

      case 'devolver':
        return this.eval(node.value);

      case 'llamada':
        return this.call(node.name, node.args);

      case 'procedimiento':
        // Ya registrado en la pasada previa; se mantiene idempotente.
        this.registerProcedure(node.name, node.params, node.body);
        return undefined;

      case 'block':
        return this.execBlock(node.body);
    }
  }

  /** Invoca un subprocedimiento. Los arreglos se pasan por referencia (como PSeInt). */
  call(name: string, argExprs: Expr[]): Value | undefined {
    const proc = this.procedures.get(name.toLowerCase());
    if (!proc) throw new PseintError(`No existe el subprocedimiento "${name}"`, 0);

    const args = argExprs.map((a) => this.eval(a));

    // En PSeInt cada subprograma tiene su propio ámbito: sus variables locales
    // (y los tipos declarados) no sobreviven a la llamada. Sin este aislamiento,
    // una recursión se pisa a sí misma (p. ej. el `p` de Quicksort).
    const savedVars = new Map(this.vars);
    const savedTypes = new Map(this.types);

    proc.params.forEach((param, i) => this.vars.set(param, args[i] ?? null));

    let result: Value | undefined;
    try {
      result = this.execBlock(proc.body);
    } finally {
      this.vars = savedVars;
      this.types = savedTypes;
    }
    return result;
  }
}

// ─────────────────────────────── Utilidades ───────────────────────────────

function truthy(v: Value): boolean {
  if (v === null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  return true;
}

function toText(v: Value): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'Verdadero' : 'Falso';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6)));
  }
  return String(v);
}

function toNum(v: Value): number {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

/** Convierte una línea de entrada al tipo que se espera (numérico si es número). */
function parseInput(raw: string): Value {
  const text = raw.trim();
  if (text === '') return '';
  const n = Number(text);
  return Number.isNaN(n) ? text : n;
}

function binary(op: string, a: Value, b: Value): Value {
  switch (op) {
    case '+':
      if (typeof a === 'string' || typeof b === 'string') {
        return toText(a) + toText(b);
      }
      return toNum(a) + toNum(b);
    case '-': return toNum(a) - toNum(b);
    case '*': return toNum(a) * toNum(b);
    case '/': {
      const d = toNum(b);
      if (d === 0) throw new PseintError('División entre cero', 0);
      return toNum(a) / d;
    }
    case 'mod': {
      const d = toNum(b);
      if (d === 0) throw new PseintError('Módulo por cero', 0);
      return toNum(a) % d;
    }
    case '^': return Math.pow(toNum(a), toNum(b));
    case '=': return looseEq(a, b) ? 1 : 0;
    case '<>': return looseEq(a, b) ? 0 : 1;
    case '<': return compare(a, b) < 0 ? 1 : 0;
    case '>': return compare(a, b) > 0 ? 1 : 0;
    case '<=': return compare(a, b) <= 0 ? 1 : 0;
    case '>=': return compare(a, b) >= 0 ? 1 : 0;
    case 'y': return truthy(a) && truthy(b) ? 1 : 0;
    case 'o': return truthy(a) || truthy(b) ? 1 : 0;
    default: throw new PseintError(`Operador no soportado: ${op}`, 0);
  }
}

function looseEq(a: Value, b: Value): boolean {
  if (typeof a === 'string' || typeof b === 'string') {
    return toText(a).toLowerCase() === toText(b).toLowerCase();
  }
  return toNum(a) === toNum(b);
}

function compare(a: Value, b: Value): number {
  if (typeof a === 'string' || typeof b === 'string') {
    const sa = toText(a);
    const sb = toText(b);
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  }
  const na = toNum(a);
  const nb = toNum(b);
  return na < nb ? -1 : na > nb ? 1 : 0;
}

// ─────────────────────────────── API pública ─────────────────────────────

/**
 * Ejecuta un programa PSeInt.
 * @param code   código fuente
 * @param stdin  líneas de entrada para `Leer`
 */
export function runPseint(code: string, stdin = ''): PseintResult {
  let program: Node[];
  try {
    program = new Parser(tokenize(code)).parseProgram();
  } catch (e) {
    const err = e as PseintError;
    return {
      stdout: '',
      stderr: `Error de sintaxis: ${err.message}`,
      exit_code: 1,
      error: { line: err.line ?? 0, message: err.message },
    };
  }

  const rt = new Runtime(stdin);
  try {
    // Primera pasada: registrar todos los subprogramas. En PSeInt se declaran
    // después del algoritmo principal, así que deben existir antes de ejecutarlo.
    for (const node of program) {
      if (node.kind === 'procedimiento') {
        rt.registerProcedure(node.name, node.params, node.body);
      }
    }
    rt.execBlock(program);
    return { stdout: rt.stdout, stderr: '', exit_code: 0 };
  } catch (e) {
    const err = e as PseintError;
    return {
      stdout: rt.stdout,
      stderr: `Error de ejecución: ${err.message}`,
      exit_code: 1,
      error: { line: err.line ?? 0, message: err.message },
    };
  }
}

/**
 * Normaliza la salida para poder compararla con la esperada.
 *
 * PSeInt imprime un salto de línea por cada `Escribir` y conserva los espacios
 * que el propio programa emite (por ejemplo `Escribir a[i], " "` deja una
 * posición al final de la línea). Esos espacios son un artefacto del formato, no
 * una diferencia de resultado, así que se recortan por línea.
 */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
    .trim();
}
