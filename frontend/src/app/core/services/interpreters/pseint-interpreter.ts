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
  line: number;
}

class PseintError extends Error {
  constructor(message: string, readonly line: number) {
    super(message);
  }
}

// ─────────────────────────────── Tokenizador ───────────────────────────────

function normalizeTokens(raw: Token[]): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < raw.length) {
    const curr = raw[i];
    const next = raw[i + 1];
    const third = raw[i + 2];

    // 'fin' + <palabra clave> -> 'fin<palabra clave>'
    if (
      curr.type === 'id' &&
      curr.value.toLowerCase() === 'fin' &&
      next &&
      next.type === 'id'
    ) {
      const nextWord = next.value.toLowerCase();
      if ([
        'algoritmo', 'proceso', 'si', 'mientras', 'para', 'segun',
        'funcion', 'subproceso', 'procedimiento', 'subalgoritmo',
      ].includes(nextWord)) {
        tokens.push({
          type: 'id',
          value: 'fin' + nextWord,
          pos: curr.pos,
          line: curr.line,
        });
        i += 2;
        continue;
      }
    }

    // 'sub' + 'proceso'/'algoritmo' -> 'subproceso'/'subalgoritmo'
    if (
      curr.type === 'id' &&
      curr.value.toLowerCase() === 'sub' &&
      next &&
      next.type === 'id' &&
      ['proceso', 'algoritmo'].includes(next.value.toLowerCase())
    ) {
      tokens.push({
        type: 'id',
        value: 'sub' + next.value.toLowerCase(),
        pos: curr.pos,
        line: curr.line,
      });
      i += 2;
      continue;
    }

    // 'sin' + ('saltar' | 'bajar') -> 'sinsaltar'
    if (
      curr.type === 'id' &&
      curr.value.toLowerCase() === 'sin' &&
      next &&
      next.type === 'id' &&
      ['saltar', 'bajar'].includes(next.value.toLowerCase())
    ) {
      tokens.push({
        type: 'id',
        value: 'sinsaltar',
        pos: curr.pos,
        line: curr.line,
      });
      i += 2;
      continue;
    }

    // 'limpiar'/'borrar' + 'pantalla' -> 'limpiarpantalla'
    if (
      curr.type === 'id' &&
      ['limpiar', 'borrar'].includes(curr.value.toLowerCase()) &&
      next &&
      next.type === 'id' &&
      next.value.toLowerCase() === 'pantalla'
    ) {
      tokens.push({
        type: 'id',
        value: 'limpiarpantalla',
        pos: curr.pos,
        line: curr.line,
      });
      i += 2;
      continue;
    }

    // 'hasta' + 'que' -> 'hastaque'
    if (
      curr.type === 'id' &&
      curr.value.toLowerCase() === 'hasta' &&
      next &&
      next.type === 'id' &&
      next.value.toLowerCase() === 'que'
    ) {
      tokens.push({
        type: 'id',
        value: 'hastaque',
        pos: curr.pos,
        line: curr.line,
      });
      i += 2;
      continue;
    }

    // 'si' + 'no' -> 'sino'
    if (
      curr.type === 'id' &&
      curr.value.toLowerCase() === 'si' &&
      next &&
      next.type === 'id' &&
      next.value.toLowerCase() === 'no'
    ) {
      tokens.push({
        type: 'id',
        value: 'sino',
        pos: curr.pos,
        line: curr.line,
      });
      i += 2;
      continue;
    }

    // 'de' + 'otro' + 'modo' -> 'otro'
    if (
      curr.type === 'id' &&
      curr.value.toLowerCase() === 'de' &&
      next &&
      next.type === 'id' &&
      next.value.toLowerCase() === 'otro' &&
      third &&
      third.type === 'id' &&
      third.value.toLowerCase() === 'modo'
    ) {
      tokens.push({
        type: 'id',
        value: 'otro',
        pos: curr.pos,
        line: curr.line,
      });
      i += 3;
      continue;
    }

    tokens.push(curr);
    i++;
  }

  return tokens;
}

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;

  const isDigit = (c: string) => c >= '0' && c <= '9';
  const isIdStart = (c: string) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]/.test(c);
  const isIdPart = (c: string) => isIdStart(c) || isDigit(c);

  while (i < src.length) {
    const c = src[i];

    if (c === '\n') {
      line++;
      i++;
      continue;
    }

    if (c === ' ' || c === '\t' || c === '\r') {
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
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') line++;
        i++;
      }
      i += 2;
      continue;
    }

    // Número (soporta decimales)
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1] ?? ''))) {
      let j = i;
      while (j < src.length && (isDigit(src[j]) || src[j] === '.')) j++;
      tokens.push({ type: 'num', value: src.slice(i, j).replace(/\.$/, ''), pos: i, line });
      i = j;
      continue;
    }

    // Cadena entre comillas dobles (PSeInt no escapa; se cierra en la 2ª comilla)
    if (c === '"') {
      const startLine = line;
      const end = src.indexOf('"', i + 1);
      if (end === -1) throw new PseintError('Cadena sin cerrar', startLine);
      const val = src.slice(i + 1, end);
      tokens.push({ type: 'str', value: val, pos: i, line: startLine });
      line += (val.match(/\n/g) || []).length;
      i = end + 1;
      continue;
    }

    // Identificador (puede traer subíndices/accesos: a[i], a[1])
    if (isIdStart(c)) {
      let j = i;
      while (j < src.length && isIdPart(src[j])) j++;
      tokens.push({ type: 'id', value: src.slice(i, j), pos: i, line });
      i = j;
      continue;
    }

    // Operadores de dos caracteres
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '<>', '<-', ':=', '&&', '||', '==', '!='].includes(two)) {
      tokens.push({ type: 'op', value: two, pos: i, line });
      i += 2;
      continue;
    }

    if ('+-*/^()[]<>=,;%&|!~:'.includes(c)) {
      tokens.push({ type: 'op', value: c, pos: i, line });
      i++;
      continue;
    }

    // Acento de operador (mod, y, o, no) o símbolo suelto
    tokens.push({ type: 'op', value: c, pos: i, line });
    i++;
  }

  return normalizeTokens(tokens);
}

function lineOf(src: string, pos: number): number {
  return src.slice(0, pos).split('\n').length;
}

// ─────────────────────────────── Parser (AST) ──────────────────────────────

type Node =
  | { kind: 'block'; body: Node[] }
  | { kind: 'escribir'; args: Expr[]; sinSaltar?: boolean }
  | { kind: 'leer'; targets: Expr[] }
  | { kind: 'definir'; names: string[]; arrays?: { name: string; size: number }[]; type?: NumType }
  | { kind: 'dimension'; name: string; size: Expr }
  | { kind: 'asign'; target: Expr; value: Expr }
  | { kind: 'si'; cond: Expr; then: Node[]; otherwise: Node[] | null }
  | { kind: 'mientras'; cond: Expr; body: Node[] }
  | { kind: 'repetir'; body: Node[]; cond: Expr }
  | { kind: 'para'; varName: string; from: Expr; to: Expr; step: Expr | null; body: Node[] }
  | { kind: 'segun'; subject: Expr; cases: { value: number; body: Node[] }[]; fallback: Node[] | null }
  | { kind: 'procedimiento'; name: string; params: string[]; body: Node[]; returnVar?: string; byRefs?: boolean[] }
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

const TYPE_ALIASES: Record<string, NumType> = {
  enter: 'ent',
  entero: 'ent',
  enteros: 'ent',
  int: 'ent',
  integer: 'ent',
  numero: 'ent',
  numerico: 'ent',
  real: 'real',
  reales: 'real',
  decimal: 'real',
  decimales: 'real',
  float: 'real',
  flotante: 'real',
  cadena: 'otro',
  cadenas: 'otro',
  texto: 'otro',
  text: 'otro',
  string: 'otro',
  caracter: 'otro',
  caracteres: 'otro',
  char: 'otro',
  letra: 'otro',
  logico: 'otro',
  logicos: 'otro',
  booleano: 'otro',
  booleana: 'otro',
  bool: 'otro',
  boolean: 'otro',
};

const TYPES = new Set(Object.keys(TYPE_ALIASES));

const KEYWORDS = new Set([
  'algoritmo', 'proceso', 'finalgoritmo', 'finproceso', 'escribir', 'mostrar', 'imprimir',
  'leer', 'ingresar', 'definir', 'dimension', 'si', 'entonces', 'sino', 'si_no', 'finsi',
  'mientras', 'hacer', 'finmientras', 'repetir', 'hasta', 'hastaque', 'que', 'para', 'finpara',
  'segun', 'caso', 'otro', 'de_otro_modo', 'finsegun', 'procedimiento', 'subproceso', 'subalgoritmo', 'funcion',
  'finprocedimiento', 'finsubproceso', 'finsubalgoritmo', 'finfuncion', 'devolver', 'retornar', 'y', 'o', 'no',
  'mod', 'paso', 'con', 'como', 'limpiarpantalla', 'borrarpantalla', 'esperar', 'sinsaltar', 'por', 'referencia', 'valor',
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
    if (t.type === 'str' || t.type === 'num') return false;
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
        t ? t.line : 0,
      );
    }
  }

  private expectId(): string {
    const t = this.next();
    if (!t || t.type !== 'id') throw new PseintError('Se esperaba un identificador', t ? t.line : 0);
    return t.value;
  }

  /** Programa completo → lista de sentencias. */
  parseProgram(): Node[] {
    const body: Node[] = [];

    // Orden válido en PSeInt: subprogramas, luego Algoritmo/Proceso con su
    // cuerpo, y subprogramas again. Aceptamos cualquiera de los tres sitios.
    while (this.at('procedimiento') || this.at('subproceso') || this.at('subalgoritmo') || this.at('funcion')) {
      body.push(this.parseProcedure());
    }

    if (this.at('algoritmo') || this.at('proceso')) {
      this.p++;
      this.expectId();
      while (this.eat(';')) {}
    }

    body.push(...this.parseStatements(() => this.at('finalgoritmo') || this.at('finproceso')));

    if (this.at('finalgoritmo') || this.at('finproceso')) {
      this.p++;
      while (this.eat(';')) {}
    }

    while (this.at('procedimiento') || this.at('subproceso') || this.at('subalgoritmo') || this.at('funcion')) {
      body.push(this.parseProcedure());
    }
    return body;
  }

  private parseProcedure(): Node {
    this.p++; // Procedimiento | SubProceso | SubAlgoritmo | Funcion
    let returnVar: string | undefined;
    let name = this.expectId();

    // PSeInt función con retorno:
    // Funcion ret <- Doble(x)
    // SubProceso ret = Doble(x)
    // Funcion ret := Doble(x)
    if (this.eat('<-') || this.eat(':=') || this.eat('=')) {
      returnVar = name;
      name = this.expectId();
    }

    const params: string[] = [];
    const byRefs: boolean[] = [];
    if (this.eat('(')) {
      while (!this.at(')')) {
        params.push(this.expectId());
        let isRef = false;
        if (this.eat('por')) {
          if (this.eat('referencia')) isRef = true;
          else this.eat('valor');
        }
        if (this.eat('como')) {
          this.next(); // tipo de parámetro (ignorado en tiempo de ejecución)
        }
        byRefs.push(isRef);
        if (!this.eat(',')) break;
      }
      this.expect(')');
    }
    while (this.eat(';')) {}
    const isEnd = () =>
      this.at('finprocedimiento') ||
      this.at('finsubproceso') ||
      this.at('finsubalgoritmo') ||
      this.at('finfuncion');
    const body = this.parseStatements(isEnd);
    if (
      !this.eat('finprocedimiento') &&
      !this.eat('finsubproceso') &&
      !this.eat('finsubalgoritmo') &&
      !this.eat('finfuncion')
    ) {
      throw new PseintError('Se esperaba FinProcedimiento, FinSubProceso o FinFuncion', this.peek()?.line ?? 0);
    }
    while (this.eat(';')) {}
    return { kind: 'procedimiento', name, params, body, returnVar, byRefs };
  }

  /** Lee sentencias hasta que `done()` sea cierto. */
  private parseStatements(done: () => boolean): Node[] {
    const out: Node[] = [];
    while (this.p < this.tokens.length && !done()) {
      while (this.eat(';')) {}
      if (this.p >= this.tokens.length || done()) break;
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
        case 'subalgoritmo':
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
        case 'finprocedimiento':
        case 'finsubproceso':
        case 'finsubalgoritmo':
        case 'finfuncion':
          return out; // el cierre lo consume quien llama
        default:
          out.push(this.parseSimple());
      }
      while (this.eat(';')) {}
    }
    return out;
  }

  private isStatementEndOrNextStatement(): boolean {
    const t = this.peek();
    if (!t) return true;
    if (t.value === ';') return true;
    if (t.type !== 'id') return false;

    const w = t.value.toLowerCase();
    // Terminadores de bloque
    if ([
      'finalgoritmo', 'finproceso', 'finsi', 'finmientras', 'finpara', 'finsegun',
      'finprocedimiento', 'finsubproceso', 'finsubalgoritmo', 'finfuncion', 'sino', 'si_no',
      'hasta', 'hastaque', 'caso', 'otro', 'de_otro_modo',
    ].includes(w)) {
      return true;
    }

    // Inicios de sentencia
    if ([
      'escribir', 'mostrar', 'imprimir', 'leer', 'ingresar', 'definir', 'dimension',
      'si', 'mientras', 'repetir', 'para', 'segun', 'procedimiento', 'subproceso', 'subalgoritmo',
      'funcion', 'devolver', 'retornar', 'limpiarpantalla', 'borrarpantalla', 'esperar',
    ].includes(w)) {
      return true;
    }

    // Tipos canónicos como inicio de declaración ("Enter i", "Real x")
    if (TYPES.has(w)) {
      return true;
    }

    // Asignación: variable <- ... o variable = ... o variable := ...
    if (t.type === 'id') {
      let offset = 1;
      const nextTok = this.peek(offset);
      if (nextTok?.value === '[') {
        while (this.peek(offset) && this.peek(offset)?.value !== ']') offset++;
        if (this.peek(offset)?.value === ']') offset++;
      }
      const afterTarget = this.peek(offset);
      if (afterTarget && (afterTarget.value === '<-' || afterTarget.value === ':=' || afterTarget.value === '=')) {
        return true;
      }
    }

    return false;
  }

  private parseSimple(): Node {
    const t = this.peek()!;
    const word = t.value.toLowerCase();

    if (word === 'limpiarpantalla' || word === 'borrarpantalla') {
      this.p++;
      while (this.eat(';')) {}
      return { kind: 'block', body: [] };
    }

    if (word === 'esperar') {
      this.p++;
      while (this.p < this.tokens.length && !this.at(';') && !this.isStatementEndOrNextStatement()) {
        this.next();
      }
      while (this.eat(';')) {}
      return { kind: 'block', body: [] };
    }

    if (word === 'escribir' || word === 'mostrar' || word === 'imprimir') {
      this.p++;
      let sinSaltar = false;
      if (this.at('sinsaltar')) {
        this.p++;
        sinSaltar = true;
      }
      const args: Expr[] = [];
      while (this.p < this.tokens.length) {
        if (this.at(';') || this.isStatementEndOrNextStatement()) break;
        if (this.at('sinsaltar')) {
          this.p++;
          sinSaltar = true;
          break;
        }
        args.push(this.parseExpr());
        this.eat(','); // coma opcional
        if (this.at(';') || this.isStatementEndOrNextStatement()) break;
      }
      if (args.length === 0) {
        args.push({ kind: 'str', value: '' });
      }
      while (this.eat(';')) {}
      return { kind: 'escribir', args, sinSaltar };
    }

    if (word === 'leer' || word === 'ingresar') {
      this.p++;
      const targets: Expr[] = [this.parseExpr()];
      while (this.eat(',')) targets.push(this.parseExpr());
      while (this.eat(';')) {}
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
      // "Dimension 3" (literal) o "Dimension a[3]" o "Dimension n" (variable)
      const first = this.next();
      if (!first) throw new PseintError('Dimension sin valor', t.line);
      let name = '';
      let size: Expr = { kind: 'num', value: Number(first.value) };
      if (first.type === 'id') {
        name = first.value;
        this.expect('[');
        size = this.parseExpr();
        this.expect(']');
      } else if (first.type !== 'num') {
        throw new PseintError('Dimension inválido', t.line);
      }
      if (name) this.pendingArrays.push({ name, size });
      while (this.eat(';')) {}
      return { kind: 'dimension', name, size };
    }

    if (word === 'devolver' || word === 'retornar') {
      this.p++;
      const value = this.parseExpr();
      while (this.eat(';')) {}
      return { kind: 'devolver', value };
    }

    // Asignación explícita: a <- expr | a := expr | a = expr | a[i] <- expr ...
    if (t.type === 'id') {
      let offset = 1;
      let isIndex = false;
      if (this.peek(offset)?.value === '[') {
        isIndex = true;
        while (this.peek(offset) && this.peek(offset)?.value !== ']') offset++;
        if (this.peek(offset)?.value === ']') offset++;
      }
      const assignOp = this.peek(offset);
      if (assignOp && (assignOp.value === '<-' || assignOp.value === ':=' || assignOp.value === '=')) {
        let target: Expr;
        if (isIndex) {
          const name = this.expectId();
          this.expect('[');
          const index = this.parseExpr();
          this.expect(']');
          target = { kind: 'index', name, index };
        } else {
          target = { kind: 'var', name: this.expectId() };
        }
        this.next(); // consume '<-' | ':=' | '='
        const value = this.parseExpr();
        while (this.eat(';')) {}
        return { kind: 'asign', target, value };
      }
    }

    const target = this.parseExpr();

    if (target.kind === 'call') {
      while (this.eat(';')) {}
      return { kind: 'llamada', name: target.name, args: target.args };
    }

    if (target.kind === 'var') {
      // Invocación de procedimiento sin paréntesis: Saludar nombre, "texto"
      const args: Expr[] = [];
      while (this.p < this.tokens.length && !this.at(';') && !this.isStatementEndOrNextStatement()) {
        args.push(this.parseExpr());
        this.eat(','); // coma opcional
      }
      while (this.eat(';')) {}
      return { kind: 'llamada', name: target.name, args };
    }

    throw new PseintError(`Sentencia no reconocida: "${t.value}"`, t.line);
  }

  /** Declara variables y arreglos: `Definir a, b Como Entero` o `Real a[5], b`. */
  private parseDeclaracion(tipoPrimero: boolean, tipo?: string): Node {
    const names: string[] = [];
    let type: NumType | undefined = tipoPrimero ? TYPE_ALIASES[(tipo ?? '').toLowerCase()] ?? 'ent' : undefined;
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

      this.eat('como');
      const after = this.peek();
      const afterNext = this.peek(1);
      if (
        after &&
        after.type === 'id' &&
        TYPES.has(after.value.toLowerCase()) &&
        afterNext?.value === ','
      ) {
        this.p++;
        type = TYPE_ALIASES[after.value.toLowerCase()] ?? type;
      }
    } while (this.eat(','));

    if (!tipoPrimero) {
      this.eat('como');
      const t = this.peek();
      if (t && t.type === 'id' && TYPES.has(t.value.toLowerCase())) {
        this.p++;
        type = TYPE_ALIASES[t.value.toLowerCase()] ?? 'ent';
      }
    }

    while (this.eat(';')) {}

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
    while (this.eat(';')) {}
    return { kind: 'si', cond, then, otherwise };
  }

  private parseMientras(): Node {
    this.p++; // Mientras
    const cond = this.parseExpr();
    this.eat('hacer'); // opcional: muchos autores lo omiten
    const body = this.parseStatements(() => this.at('finmientras'));
    this.expect('finmientras');
    while (this.eat(';')) {}
    return { kind: 'mientras', cond, body };
  }

  private parseRepetir(): Node {
    this.p++; // Repetir
    const body = this.parseStatements(() => this.at('hasta') || this.at('hastaque'));
    // Sintaxis PSeInt: "Hasta Que <cond>"; también se admite "HastaQue <cond>".
    if (this.at('hastaque')) {
      this.p++;
    } else if (this.at('hasta')) {
      this.p++;
      this.eat('que');
    }
    const cond = this.parseExpr();
    while (this.eat(';')) {}
    return { kind: 'repetir', body, cond };
  }

  private parsePara(): Node {
    this.p++; // Para
    const varName = this.expectId();
    if (!this.eat('<-') && !this.eat(':=') && !this.eat('=')) {
      throw new PseintError('Se esperaba "<-" o "=" en Para', this.peek()?.line ?? 0);
    }
    const from = this.parseExpr();
    // To | Hasta
    if (!this.eat('to') && !this.eat('hasta')) {
      throw new PseintError('Se esperaba "Para … Hasta/To"', this.peek()?.line ?? 0);
    }
    this.eat('que'); // opcional "Hasta Que"
    const to = this.parseExpr();
    let step: Expr | null = null;
    this.eat('con'); // opcional "Con Paso"
    if (this.eat('paso')) step = this.parseExpr();
    this.eat('hacer'); // opcional
    const body = this.parseStatements(() => this.at('finpara'));
    this.expect('finpara');
    while (this.eat(';')) {}
    return { kind: 'para', varName, from, to, step, body };
  }

  private parseSegun(): Node {
    this.p++; // Segun
    const subject = this.parseExpr();
    this.eat('hacer'); // "Segun x Hacer" (opcional en la práctica)
    const cases: { value: number; body: Node[] }[] = [];
    let fallback: Node[] | null = null;

    for (;;) {
      if (this.eat('finsegun')) break;
      if (this.eat('caso')) {
        const values: number[] = [];
        do {
          let sign = 1;
          if (this.eat('-')) sign = -1;
          else this.eat('+');
          const numTok = this.next();
          if (!numTok || numTok.type !== 'num') {
            throw new PseintError('Valor de Caso inválido', numTok ? numTok.line : 0);
          }
          values.push(sign * Number(numTok.value));
        } while (this.eat(','));
        this.expect(':');
        const body = this.parseStatements(() => this.at('caso') || this.at('otro') || this.at('finsegun'));
        for (const val of values) {
          cases.push({ value: val, body });
        }
        continue;
      }
      if (this.eat('otro')) {
        this.eat(':');
        fallback = this.parseStatements(() => this.at('finsegun'));
        continue;
      }
      throw new PseintError('Se esperaba "Caso", "Otro" o "FinSegun"', this.peek()?.line ?? 0);
    }
    while (this.eat(';')) {}
    return { kind: 'segun', subject, cases, fallback };
  }

  // ── Expresiones (precedencia de menor a mayor) ──
  parseExpr(): Expr {
    return this.parseLogicalOr();
  }

  private atLogicalOr(): boolean {
    if (this.isStatementEndOrNextStatement()) return false;
    const t = this.peek();
    if (!t) return false;
    const v = t.value.toLowerCase();
    if (['||', '|', 'or'].includes(v)) return true;
    if (v === 'o') {
      const next = this.peek(1);
      if (next && (next.value === '<-' || next.value === ':=' || next.value === '=')) {
        return false;
      }
      return true;
    }
    return false;
  }

  private parseLogicalOr(): Expr {
    let left = this.parseLogicalAnd();
    while (this.atLogicalOr()) {
      this.p++;
      left = { kind: 'bin', op: 'o', left, right: this.parseLogicalAnd() };
    }
    return left;
  }

  private atLogicalAnd(): boolean {
    if (this.isStatementEndOrNextStatement()) return false;
    const t = this.peek();
    if (!t) return false;
    const v = t.value.toLowerCase();
    if (['&&', '&', 'and'].includes(v)) return true;
    if (v === 'y') {
      const next = this.peek(1);
      if (next && (next.value === '<-' || next.value === ':=' || next.value === '=')) {
        return false;
      }
      return true;
    }
    return false;
  }

  private parseLogicalAnd(): Expr {
    let left = this.parseComparison();
    while (this.atLogicalAnd()) {
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
      if (!['=', '==', '<>', '!=', '<', '>', '<=', '>='].includes(op)) break;
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
      if (t.value.toLowerCase() === 'mod' || t.value === '%') {
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
    if (this.at('no') || this.eat('not') || this.eat('!') || this.eat('~')) {
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
      if (low === 'verdadero' || low === 'true') return { kind: 'num', value: 1 };
      if (low === 'falso' || low === 'false') return { kind: 'num', value: 0 };
      if (low === 'pi') return { kind: 'num', value: Math.PI };
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

    if (t.type === 'op' && ['verdadero', 'falso', 'true', 'false'].includes(t.value.toLowerCase())) {
      const low = t.value.toLowerCase();
      return { kind: 'num', value: low === 'verdadero' || low === 'true' ? 1 : 0 };
    }

    throw new PseintError(`Token inesperado: "${t.value}"`, t.line);
  }

  get position(): number {
    return this.p;
  }
}

// ─────────────────────────────── Intérprete ───────────────────────────────

class Runtime {
  private vars = new Map<string, Value>();
  private types = new Map<string, NumType>();
  private procedures = new Map<string, { params: string[]; body: Node[]; returnVar?: string; byRefs?: boolean[] }>();
  private out: string[] = [];
  private input: string[] = [];
  private inputIdx = 0;
  private steps = 0;
  private lastSinSaltar = false;

  constructor(private readonly stdin: string, private readonly maxSteps = 200_000) {
    // PSeInt lee valores separados por espacios o saltos de línea:
    // `Leer a, b, c` con "5 3 8" consume 5, luego 3, luego 8.
    this.input = stdin.replace(/\r/g, '').split(/\s+/).filter((v) => v !== '');
  }

  define(name: string, value: Value): void {
    this.vars.set(name.toLowerCase(), value);
  }

  /** Tipo declarado de una variable (Enter/Real). Por defecto, entero. */
  declareType(name: string, type: NumType): void {
    this.types.set(name.toLowerCase(), type);
  }

  /** Tipo efectivo de una expresión. */
  private typeOf(e: Expr): NumType {
    switch (e.kind) {
      case 'num':
        // Se usa el texto original del literal: Number('2.0') es 2 y perdería
        // el decimal que lo distingue de un Enter.
        return (e.raw ?? String(e.value)).includes('.') ? 'real' : 'ent';
      case 'var':
        return this.types.get(e.name.toLowerCase()) ?? 'ent';
      case 'index':
        return this.types.get(e.name.toLowerCase()) ?? 'ent';
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
    return this.vars.get(name.toLowerCase()) ?? null;
  }

  set(name: string, value: Value): void {
    this.vars.set(name.toLowerCase(), value);
  }

  registerProcedure(
    name: string,
    params: string[],
    body: Node[],
    returnVar?: string,
    byRefs?: boolean[],
  ): void {
    this.procedures.set(name.toLowerCase(), { params, body, returnVar, byRefs });
  }

  get stdout(): string {
    return this.out.join('\n');
  }

  private static readonly MAX_OUT_LINES = 5_000;

  private push(text: string, append = false): void {
    if (append && this.out.length > 0) {
      this.out[this.out.length - 1] += text;
      return;
    }
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

  // ── Funciones integradas (Built-ins de PSeInt) ──
  private callBuiltin(name: string, argExprs: Expr[]): Value | undefined {
    const args = argExprs.map((a) => this.eval(a));
    switch (name) {
      case 'rc':
      case 'raiz':
        return Math.sqrt(toNum(args[0]));
      case 'abs':
        return Math.abs(toNum(args[0]));
      case 'trunc':
        return Math.trunc(toNum(args[0]));
      case 'redon':
        return Math.round(toNum(args[0]));
      case 'azar':
        return Math.floor(Math.random() * toNum(args[0]));
      case 'aleatorio': {
        const min = toNum(args[0]);
        const max = toNum(args[1]);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      case 'longitud':
        return toText(args[0]).length;
      case 'mayusculas':
        return toText(args[0]).toUpperCase();
      case 'minusculas':
        return toText(args[0]).toLowerCase();
      case 'subcadena': {
        const str = toText(args[0]);
        let start = Math.trunc(toNum(args[1]));
        const end = Math.min(str.length, Math.trunc(toNum(args[2])));
        if (start > 0) start -= 1;
        if (start < 0) start = 0;
        return start >= end ? '' : str.substring(start, end);
      }
      case 'concatenar':
        return toText(args[0]) + toText(args[1]);
      case 'convertiranumero':
      case 'val':
        return toNum(args[0]);
      case 'convertiratexto':
      case 'str':
        return toText(args[0]);
      case 'sen':
        return Math.sin(toNum(args[0]));
      case 'cos':
        return Math.cos(toNum(args[0]));
      case 'tan':
        return Math.tan(toNum(args[0]));
      case 'asin':
        return Math.asin(toNum(args[0]));
      case 'acos':
        return Math.acos(toNum(args[0]));
      case 'atan':
        return Math.atan(toNum(args[0]));
      case 'ln':
        return Math.log(toNum(args[0]));
      case 'exp':
        return Math.exp(toNum(args[0]));
      case 'pi':
        return Math.PI;
      default:
        return undefined;
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
          if (!this.vars.has(n.toLowerCase())) this.vars.set(n.toLowerCase(), node.type === 'real' ? 0 : 0);
          this.declareType(n, node.type ?? 'ent');
        }
        // Tamaño + 1 para permitir tanto indexación en base 0 como base 1
        for (const arr of node.arrays ?? []) {
          if (!Array.isArray(this.vars.get(arr.name.toLowerCase()))) {
            this.vars.set(arr.name.toLowerCase(), new Array(Math.max(0, arr.size) + 1).fill(0));
          }
        }
        return undefined;

      case 'dimension': {
        // Tamaño + 1 para permitir tanto indexación en base 0 como base 1
        const size = Math.max(0, Math.trunc(Number(this.eval(node.size))));
        this.vars.set(node.name.toLowerCase(), new Array(size + 1).fill(0));
        return undefined;
      }

      case 'asign':
        this.assign(node.target, this.eval(node.value));
        return undefined;

      case 'escribir': {
        const parts = node.args.map((a) => toText(this.eval(a)));
        const text = parts.join('');
        this.push(text, this.lastSinSaltar);
        this.lastSinSaltar = !!node.sinSaltar;
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
        this.call(node.name, node.args);
        return undefined;

      case 'procedimiento':
        // Ya registrado en la pasada previa; se mantiene idempotente.
        this.registerProcedure(node.name, node.params, node.body, node.returnVar, node.byRefs);
        return undefined;

      case 'block':
        return this.execBlock(node.body);
    }
  }

  /** Invoca un subprocedimiento. Los arreglos se pasan por referencia (como PSeInt). */
  call(name: string, argExprs: Expr[]): Value | undefined {
    const low = name.toLowerCase();
    const proc = this.procedures.get(low);

    if (!proc) {
      const builtinVal = this.callBuiltin(low, argExprs);
      if (builtinVal !== undefined) return builtinVal;
      throw new PseintError(`No existe el subprocedimiento "${name}"`, 0);
    }

    const args = argExprs.map((a) => this.eval(a));

    // En PSeInt cada subprograma tiene su propio ámbito: sus variables locales
    // (y los tipos declarados) no sobreviven a la llamada. Sin este aislamiento,
    // una recursión se pisa a sí misma (p. ej. el `p` de Quicksort).
    const savedVars = new Map(this.vars);
    const savedTypes = new Map(this.types);

    proc.params.forEach((param, i) => this.vars.set(param.toLowerCase(), args[i] ?? null));
    if (proc.returnVar) {
      this.vars.set(proc.returnVar.toLowerCase(), 0);
    }

    let result: Value | undefined;
    try {
      result = this.execBlock(proc.body);
      if (result === undefined && proc.returnVar) {
        result = this.vars.get(proc.returnVar.toLowerCase());
      }
    } finally {
      // Propagar parámetros pasados por referencia
      if (proc.byRefs) {
        proc.params.forEach((param, i) => {
          if (proc.byRefs![i] && argExprs[i]?.kind === 'var') {
            const callerVar = (argExprs[i] as { name: string }).name.toLowerCase();
            savedVars.set(callerVar, this.vars.get(param.toLowerCase()) ?? null);
          }
        });
      }
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
    case '%':
    case 'mod': {
      const d = toNum(b);
      if (d === 0) throw new PseintError('Módulo por cero', 0);
      return toNum(a) % d;
    }
    case '^': return Math.pow(toNum(a), toNum(b));
    case '==':
    case '=': return looseEq(a, b) ? 1 : 0;
    case '!=':
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
        rt.registerProcedure(node.name, node.params, node.body, node.returnVar, node.byRefs);
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
