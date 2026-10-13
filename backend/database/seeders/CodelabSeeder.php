<?php

namespace Database\Seeders;

use App\Models\CodelabChallenge;
use App\Models\CodelabTestCase;
use Illuminate\Database\Seeder;

class CodelabSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Spotlight: Inversión de Árbol Binario con Límite de Memoria O(1)
        $c1 = CodelabChallenge::updateOrCreate(
            ['slug' => 'inversion-arbol-binario-limite-memoria-o1'],
            [
                'title' => 'Inversión de Árbol Binario con Límite de Memoria O(1)',
                'description' => 'Dado el nodo raíz de un árbol binario balanceado, invierte los subárboles izquierdo y derecho sin usar recursión profunda ni pilas auxiliares que violen la cota de memoria O(1) auxiliar (Algoritmo de Morris modificado).',
                'difficulty' => 'media',
                'acceptance_rate' => 64.20,
                'xp' => 50,
                'category' => 'estructuras',
                'tags' => ['#estructuras-de-datos', '#algoritmos'],
                'languages' => ['Python 3.12', 'C++20', 'Rust'],
                'author_name' => 'Mateo',
                'author_username' => 'mateo_dev',
                'author_role' => 'Estudiante Semestre 6 • Ing. Sistemas',
                'author_avatar' => 'M',
                'is_official' => false,
                'is_community' => true,
                'is_spotlight' => true,
                'upvotes' => 248,
                'comments_count' => 39,
                'starter_code' => [
                    'python' => "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\nclass Solution:\n    def invertTree(self, root: TreeNode) -> TreeNode:\n        # Tu implementación con memoria O(1) auxiliar aquí\n        pass\n",
                    'javascript' => "function invertTree(root) {\n  // Escribe tu solución aquí\n  return root;\n}\n",
                    'cpp' => "struct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nclass Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Tu solución O(1) aquí\n        return root;\n    }\n};\n",
                ],
                'solution_preview' => [
                    'filename' => 'solution_morris.py',
                    'benchmark' => '1.84ms benchmark',
                    'passedCases' => '14/14 superados',
                    'memoryMb' => '14.1 MB (Top 98%)',
                    'code' => "class Solution:\n    def invertTreeMorris(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        curr = root\n        while curr:\n            # Swap left & right branches in place\n            curr.left, curr.right = curr.right, curr.left\n            curr = curr.right\n        return root\n\n# Test Case 01: [4, 2, 7, 1, 3, 6, 9] -> PASS (0.42ms)",
                ],
                'status' => 'active',
            ]
        );

        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c1->id, 'order' => 1],
            ['input' => '[4, 2, 7, 1, 3, 6, 9]', 'expected_output' => '[4, 7, 2, 9, 6, 3, 1]', 'is_hidden' => false, 'label' => 'Caso 1']
        );
        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c1->id, 'order' => 2],
            ['input' => '[2, 1, 3]', 'expected_output' => '[2, 3, 1]', 'is_hidden' => false, 'label' => 'Caso 2']
        );
        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c1->id, 'order' => 3],
            ['input' => '[]', 'expected_output' => '[]', 'is_hidden' => true, 'label' => 'Caso 3 (Borde: Vacío)']
        );

        \App\Models\CodelabComment::updateOrCreate(
            ['challenge_id' => $c1->id, 'author_username' => 'mateo_dev'],
            [
                'author_name' => 'Mateo',
                'author_role' => 'Estudiante Semestre 6',
                'author_avatar' => 'M',
                'is_ai' => false,
                'content' => 'Para no violar O(1) de memoria auxiliar, no uses recursión simple ya que el call stack toma O(h) de espacio. Recomiendo usar punteros in-situ inspirados en el recorrido de Morris.',
                'code_snippet' => 'curr.left, curr.right = curr.right, curr.left',
                'upvotes' => 14,
            ]
        );

        \App\Models\CodelabComment::updateOrCreate(
            ['challenge_id' => $c1->id, 'author_username' => 'byte_ai'],
            [
                'author_name' => 'Byte IA',
                'author_role' => 'Agente Algorítmico IA',
                'author_avatar' => 'IA',
                'is_ai' => true,
                'content' => 'Nota pedagógica: La inversión de árbol binario O(1) auxiliar exige manipular los punteros sin recursión profunda. Muy formativo para pruebas técnicas de ingeniería de sistemas.',
                'upvotes' => 28,
            ]
        );

        // 2. Raft Algorithm
        $c2 = CodelabChallenge::updateOrCreate(
            ['slug' => 'implementacion-algoritmo-raft-consenso'],
            [
                'title' => 'Implementación de Algoritmo Raft (Consenso Simplificado)',
                'description' => 'Diseña la máquina de estados de elección de líder y latidos (heartbeats) con tolerancia a particiones de red.',
                'difficulty' => 'dificil',
                'acceptance_rate' => 87.00,
                'xp' => 75,
                'category' => 'concurrencia',
                'tags' => ['#concurrencia', '#distribuidos'],
                'languages' => ['Go', 'Rust'],
                'author_name' => 'Sofía',
                'author_username' => 'sofia_sys',
                'author_role' => 'Top Contribuidor',
                'author_avatar' => 'S',
                'is_official' => false,
                'is_community' => true,
                'is_spotlight' => false,
                'upvotes' => 184,
                'comments_count' => 31,
                'starter_code' => [
                    'go' => "package main\n\ntype RaftNode struct {\n    ID int\n    CurrentTerm int\n    IsLeader bool\n}\n\nfunc (r *RaftNode) RequestVote(candidateID, term int) bool {\n    return false\n}\n",
                ],
                'status' => 'active',
            ]
        );

        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c2->id, 'order' => 1],
            ['input' => 'nodes: 3, leader_fail: true', 'expected_output' => 'NEW_LEADER_ELECTED: Term 2', 'is_hidden' => false, 'label' => 'Caso 1']
        );

        // 3. Valid Parentheses
        $c3 = CodelabChallenge::updateOrCreate(
            ['slug' => 'validar-secuencia-parentesis-memoria-restringida'],
            [
                'title' => 'Validar Secuencia de Paréntesis en Memoria Restringida',
                'description' => "Determina si un flujo entrante de tokens '()[]{}' es balanceado con espacio auxiliar menor a 512 bytes.",
                'difficulty' => 'facil',
                'acceptance_rate' => 92.00,
                'xp' => 30,
                'category' => 'estructuras',
                'tags' => ['#pilas'],
                'languages' => ['Python', 'JavaScript'],
                'author_name' => 'SysEng Faculty',
                'author_username' => 'faculty',
                'author_role' => 'Curaduría Oficial',
                'author_avatar' => 'FAC',
                'is_official' => true,
                'is_community' => false,
                'is_spotlight' => false,
                'upvotes' => 412,
                'comments_count' => 56,
                'starter_code' => [
                    'python' => "def isValid(s: str) -> bool:\n    # Escribe tu solución aquí\n    return True\n",
                    'javascript' => "function isValid(s) {\n    return true;\n}\n",
                ],
                'status' => 'active',
            ]
        );

        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c3->id, 'order' => 1],
            ['input' => '()[]{}', 'expected_output' => 'true', 'is_hidden' => false, 'label' => 'Caso 1']
        );
        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c3->id, 'order' => 2],
            ['input' => '(]', 'expected_output' => 'false', 'is_hidden' => false, 'label' => 'Caso 2']
        );

        // 4. Round Robin Scheduler
        $c4 = CodelabChallenge::updateOrCreate(
            ['slug' => 'simulador-planificador-procesos-round-robin'],
            [
                'title' => 'Simulador de Planificador de Procesos Round Robin',
                'description' => 'Simula el cambio de contexto con un quantum de tiempo variante y calcula el turnaround time y waiting time promedio.',
                'difficulty' => 'media',
                'acceptance_rate' => 58.00,
                'xp' => 50,
                'category' => 'so',
                'tags' => ['#sistemas-operativos'],
                'languages' => ['C', 'C++'],
                'author_name' => 'Camilo',
                'author_username' => 'camilo',
                'author_role' => 'Tú',
                'author_avatar' => 'C',
                'is_official' => false,
                'is_community' => true,
                'is_spotlight' => false,
                'upvotes' => 98,
                'comments_count' => 19,
                'starter_code' => [
                    'cpp' => "#include <vector>\nusing namespace std;\n\nvoid roundRobin(vector<int> burst, int quantum) {\n    // Tu implementación\n}\n",
                ],
                'status' => 'active',
            ]
        );

        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c4->id, 'order' => 1],
            ['input' => 'quantum=2, burst=[5, 3, 1]', 'expected_output' => 'AVG_WAITING: 4.33, AVG_TURNAROUND: 7.33', 'is_hidden' => false, 'label' => 'Caso 1']
        );

        // 5. SQL Query Optimization
        $c5 = CodelabChallenge::updateOrCreate(
            ['slug' => 'optimizacion-consultas-sql-millones-registros'],
            [
                'title' => 'Optimización de Consultas SQL sobre Millones de Registros',
                'description' => 'Reescribe una consulta de agregación multi-JOIN con planes de ejecución EXPLAIN ANALYZE menores a 45ms en PostgreSQL.',
                'difficulty' => 'media',
                'acceptance_rate' => 71.00,
                'xp' => 45,
                'category' => 'bd',
                'tags' => ['#database', '#sql'],
                'languages' => ['PostgreSQL 16'],
                'author_name' => 'SysEng DB Lab',
                'author_username' => 'db_lab',
                'author_role' => 'Curaduría Oficial',
                'author_avatar' => 'DB',
                'is_official' => true,
                'is_community' => false,
                'is_spotlight' => false,
                'upvotes' => 215,
                'comments_count' => 44,
                'starter_code' => [
                    'sql' => "EXPLAIN ANALYZE\nSELECT u.country, count(o.id)\nFROM users u\nINNER JOIN orders o ON o.user_id = u.id\nGROUP BY u.country;\n",
                ],
                'status' => 'active',
            ]
        );

        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c5->id, 'order' => 1],
            ['input' => 'TABLE: orders (1M rows)', 'expected_output' => 'ROWS: 48, EXEC_TIME_MS: 38.2', 'is_hidden' => false, 'label' => 'Caso 1']
        );

        // 6. Lexer Mini-Pascal
        $c6 = CodelabChallenge::updateOrCreate(
            ['slug' => 'compilador-lexico-mini-pascal-automatas-finitos'],
            [
                'title' => 'Compilador Léxico Mini-Pascal con Autómatas Finitos Deterministas',
                'description' => 'Construye el analizador léxico que tokeniza identificadores, palabras reservadas y literales numéricos sin regex.',
                'difficulty' => 'dificil',
                'acceptance_rate' => 43.00,
                'xp' => 80,
                'category' => 'compiladores',
                'tags' => ['#compiladores', '#rust', 'Teoría de Autómatas'],
                'languages' => ['Rust', 'Python'],
                'author_name' => 'Alex',
                'author_username' => 'alex_lang',
                'author_role' => 'Monitor Compiladores',
                'author_avatar' => 'A',
                'is_official' => false,
                'is_community' => true,
                'is_spotlight' => false,
                'upvotes' => 167,
                'comments_count' => 28,
                'starter_code' => [
                    'rust' => "fn tokenize(source: &str) -> Vec<String> {\n    // AFD\n    Vec::new()\n}\n",
                ],
                'status' => 'active',
            ]
        );

        CodelabTestCase::updateOrCreate(
            ['challenge_id' => $c6->id, 'order' => 1],
            ['input' => 'program Test; begin var x := 42; end.', 'expected_output' => 'TOKENS: [PROGRAM, ID(Test), SEMICOLON, BEGIN, VAR, ID(x), ASSIGN, INT(42), SEMICOLON, END, DOT]', 'is_hidden' => false, 'label' => 'Caso 1']
        );
    }
}
