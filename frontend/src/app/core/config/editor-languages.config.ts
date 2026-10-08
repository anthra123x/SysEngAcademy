/**
 * Configuración global y catálogo de lenguajes para el Editor Interactivo (IDE)
 * de SysEngAcademy.
 *
 * Permite que el editor comprenda, resalte, compile y ejecute cualquier lenguaje
 * que se enseña en la plataforma, adaptándose automáticamente según el curso,
 * módulo o ejercicio específico, al tiempo que ofrece opciones de anulación manual.
 */

export interface EditorLanguageDefinition {
  /** Identificador canónico del lenguaje */
  id: string;
  /** Nombre formal con versión */
  name: string;
  /** Nombre corto para etiquetas UI */
  shortName: string;
  /** Extensión de archivo incluyendo punto (.py, .psc, etc.) */
  extension: string;
  /** Nombre de archivo sugerido para la pestaña */
  defaultFilename: string;
  /** Comando de ejecución visible en la terminal */
  runCommand: string;
  /** Insignia para la cabecera */
  badge: string;
  /** Icono de Lucide para la interfaz */
  icon: string;
  /** Alias reconocidos */
  aliases: string[];
  /** Modo de sintaxis de CodeMirror */
  highlightMode: 'pseint' | 'python' | 'javascript' | 'typescript' | 'php' | 'java' | 'cpp' | 'sql' | 'csharp' | 'go' | 'rust' | 'bash';
  /** Familia de ejecución */
  family: 'interpreted' | 'compiled' | 'query' | 'shell';
  /** Plantilla inicial por defecto si el ejercicio no provee starter_code */
  defaultTemplate: string;
  /** Si tiene soporte nativo de ejecución en el cliente sin requerir backend */
  clientExecutable: boolean;
}

export const EDITOR_LANGUAGES: Record<string, EditorLanguageDefinition> = {
  pseint: {
    id: 'pseint',
    name: 'PSeInt (Pseudocódigo)',
    shortName: 'PSeInt',
    extension: '.psc',
    defaultFilename: 'algoritmo.psc',
    runCommand: 'pseint algoritmo.psc',
    badge: 'Pseudocódigo',
    icon: 'terminal',
    aliases: ['pseint', 'psc', 'pseudocodigo', 'pseudocódigo'],
    highlightMode: 'pseint',
    family: 'interpreted',
    clientExecutable: true,
    defaultTemplate: `Algoritmo MiAlgoritmo
    // Declara tus variables y escribe tu solución
    Definir nombre Como Cadena
    nombre <- "Ingeniero"
    Escribir "Bienvenido a SysEng Academy, ", nombre
FinAlgoritmo
`,
  },

  python: {
    id: 'python',
    name: 'Python 3.12',
    shortName: 'Python',
    extension: '.py',
    defaultFilename: 'main.py',
    runCommand: 'python main.py',
    badge: 'Python 3.12',
    icon: 'code',
    aliases: ['python', 'py', 'python3'],
    highlightMode: 'python',
    family: 'interpreted',
    clientExecutable: false,
    defaultTemplate: `# SysEngAcademy - Sandbox Python
def resolver():
    print("¡Hola desde Python en SysEng Academy!")

if __name__ == "__main__":
    resolver()
`,
  },

  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    shortName: 'JavaScript',
    extension: '.js',
    defaultFilename: 'index.js',
    runCommand: 'node index.js',
    badge: 'Node.js LTS',
    icon: 'code',
    aliases: ['javascript', 'js', 'node', 'nodejs'],
    highlightMode: 'javascript',
    family: 'interpreted',
    clientExecutable: true,
    defaultTemplate: `// SysEngAcademy - Sandbox JavaScript
function main() {
  console.log("¡Hola desde JavaScript en SysEng Academy!");
}

main();
`,
  },

  typescript: {
    id: 'typescript',
    name: 'TypeScript 5.x',
    shortName: 'TypeScript',
    extension: '.ts',
    defaultFilename: 'index.ts',
    runCommand: 'ts-node index.ts',
    badge: 'TypeScript 5',
    icon: 'code',
    aliases: ['typescript', 'ts'],
    highlightMode: 'typescript',
    family: 'compiled',
    clientExecutable: true,
    defaultTemplate: `// SysEngAcademy - Sandbox TypeScript
interface Mensaje {
  contenido: string;
  creadoEn: Date;
}

const msg: Mensaje = {
  contenido: "¡Hola desde TypeScript en SysEng Academy!",
  creadoEn: new Date(),
};

console.log(msg.contenido);
`,
  },

  php: {
    id: 'php',
    name: 'PHP 8.3',
    shortName: 'PHP',
    extension: '.php',
    defaultFilename: 'script.php',
    runCommand: 'php script.php',
    badge: 'PHP 8.3',
    icon: 'server',
    aliases: ['php', 'php8', 'laravel'],
    highlightMode: 'php',
    family: 'interpreted',
    clientExecutable: false,
    defaultTemplate: `<?php
// SysEngAcademy - Sandbox PHP
echo "¡Hola desde PHP en SysEng Academy!\n";
`,
  },

  java: {
    id: 'java',
    name: 'Java 21 (OpenJDK)',
    shortName: 'Java',
    extension: '.java',
    defaultFilename: 'Main.java',
    runCommand: 'javac Main.java && java Main',
    badge: 'Java 21',
    icon: 'coffee',
    aliases: ['java', 'openjdk'],
    highlightMode: 'java',
    family: 'compiled',
    clientExecutable: false,
    defaultTemplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("¡Hola desde Java en SysEng Academy!");
    }
}
`,
  },

  cpp: {
    id: 'cpp',
    name: 'C++ (GCC 13)',
    shortName: 'C++',
    extension: '.cpp',
    defaultFilename: 'main.cpp',
    runCommand: 'g++ -O2 main.cpp && ./a.out',
    badge: 'GCC 13',
    icon: 'zap',
    aliases: ['cpp', 'c++', 'cxx'],
    highlightMode: 'cpp',
    family: 'compiled',
    clientExecutable: false,
    defaultTemplate: `#include <iostream>
using namespace std;

int main() {
    cout << "¡Hola desde C++ en SysEng Academy!" << endl;
    return 0;
}
`,
  },

  c: {
    id: 'c',
    name: 'C (GCC 13)',
    shortName: 'C',
    extension: '.c',
    defaultFilename: 'main.c',
    runCommand: 'gcc -O2 main.c && ./a.out',
    badge: 'GCC C17',
    icon: 'zap',
    aliases: ['c', 'clang'],
    highlightMode: 'cpp',
    family: 'compiled',
    clientExecutable: false,
    defaultTemplate: `#include <stdio.h>

int main() {
    printf("¡Hola desde C en SysEng Academy!\\n");
    return 0;
}
`,
  },

  csharp: {
    id: 'csharp',
    name: 'C# (.NET 8)',
    shortName: 'C#',
    extension: '.cs',
    defaultFilename: 'Program.cs',
    runCommand: 'dotnet run',
    badge: '.NET 8',
    icon: 'layers',
    aliases: ['csharp', 'c#', 'cs', 'dotnet'],
    highlightMode: 'csharp',
    family: 'compiled',
    clientExecutable: false,
    defaultTemplate: `using System;

class Program {
    static void Main() {
        Console.WriteLine("¡Hola desde C# en SysEng Academy!");
    }
}
`,
  },

  go: {
    id: 'go',
    name: 'Go 1.22',
    shortName: 'Go',
    extension: '.go',
    defaultFilename: 'main.go',
    runCommand: 'go run main.go',
    badge: 'Go 1.22',
    icon: 'zap',
    aliases: ['go', 'golang'],
    highlightMode: 'go',
    family: 'compiled',
    clientExecutable: false,
    defaultTemplate: `package main

import "fmt"

func main() {
    fmt.Println("¡Hola desde Go en SysEng Academy!")
}
`,
  },

  rust: {
    id: 'rust',
    name: 'Rust 1.78',
    shortName: 'Rust',
    extension: '.rs',
    defaultFilename: 'main.rs',
    runCommand: 'rustc main.rs && ./main',
    badge: 'Rust 1.78',
    icon: 'shield',
    aliases: ['rust', 'rs'],
    highlightMode: 'rust',
    family: 'compiled',
    clientExecutable: false,
    defaultTemplate: `fn main() {
    println!("¡Hola desde Rust en SysEng Academy!");
}
`,
  },

  sql: {
    id: 'sql',
    name: 'SQL (PostgreSQL 16)',
    shortName: 'SQL',
    extension: '.sql',
    defaultFilename: 'query.sql',
    runCommand: 'psql -f query.sql',
    badge: 'PostgreSQL 16',
    icon: 'database',
    aliases: ['sql', 'postgresql', 'postgres'],
    highlightMode: 'sql',
    family: 'query',
    clientExecutable: false,
    defaultTemplate: `-- SysEngAcademy - Sandbox SQL
SELECT '¡Hola desde PostgreSQL en SysEng Academy!' AS mensaje;
`,
  },

  bash: {
    id: 'bash',
    name: 'Bash / Shell',
    shortName: 'Bash',
    extension: '.sh',
    defaultFilename: 'script.sh',
    runCommand: 'bash script.sh',
    badge: 'Bash 5.2',
    icon: 'terminal',
    aliases: ['bash', 'sh', 'shell', 'zsh'],
    highlightMode: 'bash',
    family: 'shell',
    clientExecutable: false,
    defaultTemplate: `#!/usr/bin/env bash
echo "¡Hola desde Bash en SysEng Academy!"
`,
  },
};

/**
 * Resuelve una definición de lenguaje a partir de su ID o cualquier alias conocido.
 */
export function resolveEditorLanguage(rawInput?: string | null): EditorLanguageDefinition {
  if (!rawInput) return EDITOR_LANGUAGES['python'];
  const cleaned = rawInput.toLowerCase().trim();

  // Coincidencia directa por ID
  if (EDITOR_LANGUAGES[cleaned]) {
    return EDITOR_LANGUAGES[cleaned];
  }

  // Búsqueda por alias
  for (const lang of Object.values(EDITOR_LANGUAGES)) {
    if (lang.aliases.includes(cleaned)) {
      return lang;
    }
  }

  // Fallback seguro: si parece lenguaje desconocido, crear definición genérica derivada
  return {
    id: cleaned,
    name: cleaned.toUpperCase(),
    shortName: cleaned.toUpperCase(),
    extension: `.${cleaned}`,
    defaultFilename: `solution.${cleaned}`,
    runCommand: `./run.${cleaned}`,
    badge: cleaned.toUpperCase(),
    icon: 'code',
    aliases: [cleaned],
    highlightMode: 'python',
    family: 'interpreted',
    clientExecutable: false,
    defaultTemplate: `// Solución en ${cleaned.toUpperCase()}\n`,
  };
}

/**
 * Inspecciona un contexto de módulo, ejercicio y código para deducir el lenguaje más exacto.
 */
export function detectLanguageFromContext(context: {
  language?: string | null;
  starter_code?: string | null;
  title?: string | null;
  slug?: string | null;
  moduleTitle?: string | null;
  courseTitle?: string | null;
  courseSlug?: string | null;
}): EditorLanguageDefinition {
  // 1. Lenguaje explícito en la lección o ejercicio
  if (context.language && context.language.trim()) {
    return resolveEditorLanguage(context.language);
  }

  // 2. Detección por firmas de código inicial
  const code = (context.starter_code || '').trim();
  if (code) {
    if (/^(Algoritmo|Proceso|SubProceso|SubAlgoritmo|Funcion|Definir)\b/i.test(code) ||
        /\b(FinAlgoritmo|FinProceso|FinFuncion|Escribir|Leer)\b/i.test(code) ||
        code.includes('<-')) {
      return EDITOR_LANGUAGES['pseint'];
    }
    if (code.includes('#include') || code.includes('std::') || code.includes('cout <<') || code.includes('cin >>')) {
      return EDITOR_LANGUAGES['cpp'];
    }
    if (/^\s*<\?php/i.test(code) || code.includes('Route::') || code.includes('$this->')) {
      return EDITOR_LANGUAGES['php'];
    }
    if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/i.test(code)) {
      return EDITOR_LANGUAGES['sql'];
    }
    if (code.includes('public class ') || code.includes('System.out.println') || code.includes('public static void main')) {
      return EDITOR_LANGUAGES['java'];
    }
    if (code.includes('namespace ') || code.includes('Console.WriteLine') || code.includes('using System;')) {
      return EDITOR_LANGUAGES['csharp'];
    }
    if (code.includes('package main') || code.includes('func main()')) {
      return EDITOR_LANGUAGES['go'];
    }
    if (code.includes('fn main()') || code.includes('println!(')) {
      return EDITOR_LANGUAGES['rust'];
    }
    if (code.includes('interface ') || code.includes(': string') || code.includes(': number') || code.includes(': boolean')) {
      return EDITOR_LANGUAGES['typescript'];
    }
  }

  // 3. Detección por contexto de módulo y curso
  const bag = `${context.title || ''} ${context.slug || ''} ${context.moduleTitle || ''} ${context.courseTitle || ''} ${context.courseSlug || ''}`.toLowerCase();

  if (bag.includes('pseint') || bag.includes('pseudocodigo') || bag.includes('pseudocódigo') || bag.includes('algoritmo')) {
    return EDITOR_LANGUAGES['pseint'];
  }
  if (bag.includes('c++') || bag.includes('cpp')) {
    return EDITOR_LANGUAGES['cpp'];
  }
  if (bag.includes('c#') || bag.includes('csharp') || bag.includes('.net')) {
    return EDITOR_LANGUAGES['csharp'];
  }
  if (bag.includes('sql') || bag.includes('postgres') || bag.includes('base de datos') || bag.includes('bases de datos') || bag.includes('consultas')) {
    return EDITOR_LANGUAGES['sql'];
  }
  if (bag.includes('php') || bag.includes('laravel') || bag.includes('backend') || bag.includes('poo-php')) {
    return EDITOR_LANGUAGES['php'];
  }
  if (bag.includes('java') && !bag.includes('javascript')) {
    return EDITOR_LANGUAGES['java'];
  }
  if (bag.includes('go') || bag.includes('golang')) {
    return EDITOR_LANGUAGES['go'];
  }
  if (bag.includes('rust')) {
    return EDITOR_LANGUAGES['rust'];
  }
  if (bag.includes('typescript') || bag.includes('angular')) {
    return EDITOR_LANGUAGES['typescript'];
  }
  if (bag.includes('javascript') || bag.includes('frontend') || bag.includes('web') || bag.includes('react') || bag.includes('node')) {
    return EDITOR_LANGUAGES['javascript'];
  }
  if (bag.includes('bash') || bag.includes('linux') || bag.includes('terminal') || bag.includes('shell')) {
    return EDITOR_LANGUAGES['bash'];
  }
  if (bag.includes('python') || bag.includes('ia') || bag.includes('machine learning')) {
    return EDITOR_LANGUAGES['python'];
  }

  return EDITOR_LANGUAGES['python'];
}

/**
 * Lista ordenada de todos los lenguajes soportados para selectores y menús.
 */
export function getAllSupportedLanguages(): EditorLanguageDefinition[] {
  return [
    EDITOR_LANGUAGES['pseint'],
    EDITOR_LANGUAGES['python'],
    EDITOR_LANGUAGES['javascript'],
    EDITOR_LANGUAGES['typescript'],
    EDITOR_LANGUAGES['php'],
    EDITOR_LANGUAGES['java'],
    EDITOR_LANGUAGES['cpp'],
    EDITOR_LANGUAGES['c'],
    EDITOR_LANGUAGES['csharp'],
    EDITOR_LANGUAGES['go'],
    EDITOR_LANGUAGES['rust'],
    EDITOR_LANGUAGES['sql'],
    EDITOR_LANGUAGES['bash'],
  ];
}
