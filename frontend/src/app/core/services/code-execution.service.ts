import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { runPseint } from './interpreters/pseint-interpreter';

export interface TestCase {
  input?: string;
  expected: string;
}

export interface TestResult {
  input?: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  tests?: TestResult[];
  execution_time_ms: number;
  language: string;
  error?: string;
  message?: string;
}

export interface SupportedLanguage {
  id: string;
  name: string;
  version: string;
  icon: string;
  extension: string;
  defaultTemplate: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: 'python',
    name: 'Python',
    version: '3.12',
    icon: '🐍',
    extension: '.py',
    defaultTemplate: `# SysEngAcademy - Sandbox Python
def saludar(nombre: str) -> str:
    return f"¡Hola {nombre}, bienvenido al mundo de la programación!"

print(saludar("Estudiante"))

# Prueba tus algoritmos aquí:
numeros = [1, 2, 3, 4, 5]
print("Suma:", sum(numeros))
`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: 'Node.js LTS',
    icon: '🟨',
    extension: '.js',
    defaultTemplate: `// SysEngAcademy - Sandbox JavaScript (Node.js)
function saludar(nombre) {
  return \`¡Hola \${nombre}! Bienvenido al entorno interactivo.\`;
}

console.log(saludar("Desarrollador"));

const valores = [10, 20, 30, 40];
const total = valores.reduce((acc, curr) => acc + curr, 0);
console.log("Total calculado:", total);
`,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    version: 'Bun Runtime',
    icon: '🔷',
    extension: '.ts',
    defaultTemplate: `// SysEngAcademy - Sandbox TypeScript
interface Estudiante {
  nombre: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  skills: string[];
}

const user: Estudiante = {
  nombre: "SysEng Dev",
  nivel: "Principiante",
  skills: ["Lógica", "Algoritmos", "VS Code"]
};

console.log(\`Estudiante: \${user.nombre} (\${user.nivel})\`);
console.log("Habilidades:", user.skills.join(", "));
`,
  },
  {
    id: 'php',
    name: 'PHP',
    version: '8.3',
    icon: '🐘',
    extension: '.php',
    defaultTemplate: `<?php
// SysEngAcademy - Sandbox PHP
function calcularPromedio(array $notas): float {
    return count($notas) > 0 ? array_sum($notas) / count($notas) : 0.0;
}

$calificaciones = [85, 92, 78, 95];
echo "Promedio de notas: " . calcularPromedio($calificaciones) . "\\n";
echo "¡A programar se aprende programando! 🚀\\n";
`,
  },
  {
    id: 'c_cpp',
    name: 'C / C++',
    version: 'GCC 13.x',
    icon: '⚡',
    extension: '.cpp',
    defaultTemplate: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "¡Hola desde C++ en SysEngAcademy!" << std::endl;
    std::vector<int> datos = {10, 25, 40, 15};
    int total = std::accumulate(datos.begin(), datos.end(), 0);
    std::cout << "Suma total: " << total << std::endl;
    return 0;
}
`,
  },
  {
    id: 'pseint',
    name: 'PSeInt (Pseudocódigo)',
    version: 'Nativo Browser',
    icon: '📝',
    extension: '.psc',
    defaultTemplate: `Algoritmo SaludoSysEng
    Definir nombre Como Cadena;
    Definir contador Como Entero;
    
    nombre <- "Estudiante";
    Escribir "¡Hola ", nombre, "! Bienvenido a Fundamentos de Programación.";
    
    Para contador <- 1 Hasta 3 Con Paso 1 Hacer
        Escribir "Paso ", contador, ": Dominando la lógica";
    FinPara
FinAlgoritmo
`,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CodeExecutionService {
  private readonly api = inject(ApiService);

  getLanguages(): SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }

  execute(
    language: string,
    code: string,
    stdin = '',
    tests: TestCase[] = []
  ): Observable<CodeExecutionResponse> {
    if (language === 'pseint') {
      const startTime = performance.now();
      const res = runPseint(code, stdin);
      const executionTime = Math.round(performance.now() - startTime);

      const testResults: TestResult[] = tests.map(t => {
        const testRes = runPseint(code, t.input || '');
        const actual = testRes.stdout.trim();
        const expected = (t.expected || '').trim();
        return {
          input: t.input,
          expected: t.expected,
          actual: testRes.stdout,
          passed: actual === expected,
        };
      });

      return of({
        stdout: res.stdout,
        stderr: res.stderr,
        exit_code: res.exit_code,
        tests: testResults,
        execution_time_ms: executionTime,
        language: 'pseint',
      });
    }

    return this.api.post<CodeExecutionResponse>('/code/execute', {
      language,
      code,
      stdin,
      tests,
    });
  }
}
