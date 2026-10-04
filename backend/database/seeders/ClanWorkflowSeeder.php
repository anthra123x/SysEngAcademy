<?php

namespace Database\Seeders;

use App\Models\Clan;
use App\Models\ClanMember;
use App\Models\ClanProject;
use App\Models\ClanProjectCommit;
use App\Models\ClanProjectPullRequest;
use App\Models\ClanProjectTask;
use App\Models\ClanPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClanWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('role', 'teacher')->first() ?: User::first();
        $student = User::where('role', 'student')->first() ?: User::first();

        $clansData = [
            [
                'id'          => 'krnl',
                'name'        => 'Kernel & C++ Systems Hackers',
                'tag'         => '[KRNL]',
                'category'    => 'systems',
                'description' => 'Desarrollo de un núcleo básico modular en C++20 con soporte para interrupciones de temporizador y conmutación de contexto.',
                'lines'       => ['Gestión de Memoria y Paginación x86_64', 'Concurrencia Lock-Free & Atomics', 'Llamadas POSIX & Observabilidad eBPF'],
                'streak'      => 4,
                'level'       => 3,
                'level_title' => 'Laboratorio I+D de Sistemas',
                'xp'          => 3450,
                'next_xp'     => 5000,
                'challenge'   => ['title' => 'Micro-Kernel Modular y Planificador Round-Robin', 'xpReward' => 350, 'completed' => false],
                'quest'       => [
                    'title'        => 'Simulacro SEV-1: Deadlock por Inversión de Prioridades en Scheduler',
                    'description'  => 'Una tarea de baja prioridad adquiere un spinlock de memoria física antes de ser desalojada por el timer. Reproducir en QEMU y desplegar parche con protocolo de herencia de prioridad (PIP).',
                    'targetCount'  => 3,
                    'currentCount' => 1,
                    'xpReward'     => 450,
                    'completed'    => false,
                ],
                'project' => [
                    'id'          => 'prj_krnl_sched',
                    'title'       => 'Micro-Kernel Modular y Planificador Round-Robin',
                    'description' => 'Desarrollo de un núcleo básico modular en C++20 con soporte para interrupciones de temporizador y conmutación de contexto.',
                    'stack'       => ['C++20', 'Assembly x86', 'QEMU', 'CMake'],
                    'branch'      => 'main',
                    'domain'      => 'https://syseng-kernel.vercel.app',
                    'commit'      => 'd9c359a',
                    'tasks'       => [
                        ['id' => 'tk1', 'title' => 'Rutina de interrupción de timer en Assembly x86', 'desc' => 'Manejador de IRQ0 para temporización por hardware con 100 ticks/seg.', 'status' => 'completed', 'type' => 'feature', 'assigned' => 'Director Cátedra', 'xp' => 45],
                        ['id' => 'tk2', 'title' => 'Cola de estados de procesos (Ready, Running, Blocked)', 'desc' => 'Estructura circular de ProcessControlBlock para conmutación eficiente.', 'status' => 'completed', 'type' => 'feature', 'assigned' => 'Alex Torres', 'xp' => 45],
                        ['id' => 'tk3', 'title' => 'Implementar algoritmo Round-Robin con quantum de 10ms', 'desc' => 'Conectar interrupción periódica del timer con la cola de tareas listos.', 'status' => 'in_progress', 'type' => 'feature', 'assigned' => 'Alex Torres', 'xp' => 45],
                        ['id' => 'tk4', 'title' => 'Soporte para prioridades dinámicas multinivel (MLFQ)', 'desc' => 'Evitar inanición de procesos CPU-bound degradando colas en base a tiempo de ejecución.', 'status' => 'pending', 'type' => 'arch', 'assigned' => null, 'xp' => 55],
                    ],
                    'prs' => [
                        [
                            'id'          => 'pr_4',
                            'number'      => 4,
                            'title'       => 'feat(sched): Implementar algoritmo Round-Robin con quantum de 10ms',
                            'description' => 'Conecta la interrupción periódica del temporizador (IRQ0) con la cola circular de tareas. Cada 10ms guarda el contexto del frame actual en el PCB y conmuta hacia la siguiente tarea en cola de listos.',
                            'source'      => 'feature/round-robin-quantum',
                            'target'      => 'main',
                            'status'      => 'open',
                            'author'      => 'Alex Torres',
                            'role'        => 'Cadete Investigador',
                            'preview'     => 'https://syseng-kernel-git-sched-preview.vercel.app',
                            'diff'        => [
                                'filename'  => 'kernel/sched/round_robin.cpp',
                                'additions' => [
                                    '+ void ScheduleNextProcess(InterruptFrame* frame) {',
                                    '+   ProcessControlBlock* current = GetRunningProcess();',
                                    '+   if (current && current->state == ProcessState::RUNNING) {',
                                    '+       current->saved_esp = frame->esp;',
                                    '+       current->state = ProcessState::READY;',
                                    '+       ready_queue.push(current);',
                                    '+   }',
                                    '+   ProcessControlBlock* next = ready_queue.pop();',
                                    '+   next->state = ProcessState::RUNNING;',
                                    '+   SwitchContext(frame, next->saved_esp);',
                                    '+ }',
                                ],
                                'deletions' => [
                                    '- void ScheduleNextProcess(InterruptFrame* frame) {',
                                    '-   // TODO: implementar planificador round-robin',
                                    '- }',
                                ],
                            ],
                            'reviews'     => [
                                [
                                    'reviewer'  => 'Director Cátedra Sistemas',
                                    'isTeacher' => true,
                                    'verdict'   => 'approved',
                                    'comment'   => 'Revisión técnica de cátedra: Conmutación atómica de pila validada. Sin condiciones de carrera en el frame.',
                                    'timeAgo'   => 'hace 2h',
                                ],
                            ],
                            'issue_id'    => 'tk3',
                        ],
                        [
                            'id'          => 'pr_3',
                            'number'      => 3,
                            'title'       => 'feat(proc): Cola circular de estados de procesos',
                            'description' => 'Estructura circular de PCBs con locks atómicos para operaciones libres de bloqueos.',
                            'source'      => 'feature/process-states',
                            'target'      => 'main',
                            'status'      => 'merged',
                            'author'      => 'Alex Torres',
                            'role'        => 'Cadete Investigador',
                            'merged_by'   => 'Alex Torres',
                            'merged_at'   => 'hace 6h',
                            'preview'     => 'https://syseng-kernel.vercel.app',
                            'diff'        => [
                                'filename'  => 'kernel/proc/queue.cpp',
                                'additions' => ['+ void ProcessQueue::push(PCB* p) { atomic_push(p); }'],
                                'deletions' => ['- void ProcessQueue::push(PCB* p) { queue.push(p); }'],
                            ],
                            'reviews'     => [],
                            'issue_id'    => 'tk2',
                        ]
                    ]
                ]
            ],
            [
                'id'          => 'arch',
                'name'        => 'Arquitectura Backend & APIs',
                'tag'         => '[ARCH]',
                'category'    => 'backend',
                'description' => 'Sistemas distribuidos de alto rendimiento, microservicios asíncronos y arquitecturas orientadas a eventos.',
                'lines'       => ['Patrones Event-Driven con Kafka/RabbitMQ', 'Consenso Distribuido Raft', 'API Gateways & Rate Limiting con Redis'],
                'streak'      => 5,
                'level'       => 4,
                'level_title' => 'Cluster de Alta Disponibilidad',
                'xp'          => 4200,
                'next_xp'     => 6000,
                'challenge'   => ['title' => 'Motor de Eventos Distribuido con Consenso Raft', 'xpReward' => 400, 'completed' => false],
                'quest'       => [
                    'title'        => 'Simulacro SEV-2: Partición de Red (Split-Brain) en Clúster Raft',
                    'description'  => 'Inducir fallo de red entre 2 de 5 nodos y verificar que el quorum mantenga la coherencia linealizable sin pérdidas.',
                    'targetCount'  => 3,
                    'currentCount' => 2,
                    'xpReward'     => 500,
                    'completed'    => false,
                ],
                'project' => [
                    'id'          => 'prj_arch_bus',
                    'title'       => 'Motor de Eventos y Bus Asíncrono de Cátedra',
                    'description' => 'Implementación de protocolo pub-sub distribuido con replicación multi-nodo y entrega al menos una vez (at-least-once).',
                    'stack'       => ['Go 1.22', 'gRPC', 'Protocol Buffers', 'Redis'],
                    'branch'      => 'main',
                    'domain'      => 'https://syseng-eventbus.vercel.app',
                    'commit'      => 'c41f802',
                    'tasks'       => [
                        ['id' => 'tk_arch1', 'title' => 'Diseño de Envelope de Mensajes protobuf con idempotency-key', 'desc' => 'Prevenir duplicados ante reintentos de red.', 'status' => 'completed', 'type' => 'arch', 'assigned' => 'Elena Vega', 'xp' => 50],
                        ['id' => 'tk_arch2', 'title' => 'Heartbeat y Detección de Caídas de Nodos en Raft', 'desc' => 'Elección de líder cuando el timer de elección expira.', 'status' => 'in_progress', 'type' => 'feature', 'assigned' => 'Elena Vega', 'xp' => 60],
                        ['id' => 'tk_arch3', 'title' => 'Prueba de Carga con 10k mensajes/seg concurrentes', 'desc' => 'Benchmarking sintético con k6 y profiling de memoria Go.', 'status' => 'pending', 'type' => 'perf', 'assigned' => null, 'xp' => 70],
                    ],
                    'prs' => [
                        [
                            'id'          => 'pr_arch_1',
                            'number'      => 12,
                            'title'       => 'feat(raft): Protocolo de elección de líder con quórum dinámico',
                            'description' => 'Manejo de RequestVoteRPC con term increments y votos persistidos en disco WAL.',
                            'source'      => 'feat/raft-leader-election',
                            'target'      => 'main',
                            'status'      => 'open',
                            'author'      => 'Elena Vega',
                            'role'        => 'Cadete Investigadora',
                            'preview'     => 'https://syseng-eventbus-git-raft-election.vercel.app',
                            'diff'        => [
                                'filename'  => 'consensus/raft.go',
                                'additions' => ['+ func (r *Raft) RequestVote(ctx context.Context, req *VoteRequest) (*VoteResponse, error) {', '+   if req.Term > r.currentTerm { r.becomeFollower(req.Term) }', '+   return &VoteResponse{VoteGranted: true}, nil', '+ }'],
                                'deletions' => ['- func (r *Raft) RequestVote(...) { /* stub */ }'],
                            ],
                            'reviews'     => [],
                            'issue_id'    => 'tk_arch2',
                        ]
                    ]
                ]
            ],
            [
                'id'          => 'sec',
                'name'        => 'Red Team & Application Security',
                'tag'         => '[SEC]',
                'category'    => 'security',
                'description' => 'Auditoría de código estática/dinámica, mitigación de vulnerabilidades OWASP Top 10 y hardening.',
                'lines'       => ['Fuzzing con AFL++ y LibFuzzer', 'Criptografía Aplicada & TLS 1.3', 'Protección contra Ataques DoS & Timing Attacks'],
                'streak'      => 7,
                'level'       => 5,
                'level_title' => 'Bastión de Defensa Ciberespacial',
                'xp'          => 5600,
                'next_xp'     => 7500,
                'challenge'   => ['title' => 'Auditoría Estricta de Memory Corruption con ASAN', 'xpReward' => 450, 'completed' => false],
                'quest'       => [
                    'title'        => 'Simulacro SEV-1: Exfiltración mediante SSRF Ciego en Webhook',
                    'description'  => 'Aislar egress de peticiones HTTP en sandbox de red con iptables y validar lista blanca de rangos IP permitidos.',
                    'targetCount'  => 3,
                    'currentCount' => 1,
                    'xpReward'     => 450,
                    'completed'    => false,
                ],
                'project' => [
                    'id'          => 'prj_sec_waf',
                    'title'       => 'WAF perimetral defensivo y Sanitizador de Tokens',
                    'description' => 'Módulo de inspección profunda de cabeceras, detección de firmas regex maliciosas y validación criptográfica HMAC.',
                    'stack'       => ['Rust', 'Tokio', 'eBPF/XDP', 'OpenSSL'],
                    'branch'      => 'main',
                    'domain'      => 'https://syseng-shield.vercel.app',
                    'commit'      => 'a19b88f',
                    'tasks'       => [
                        ['id' => 'tk_sec1', 'title' => 'Implementar rate limiting de token bucket con redis atómico', 'desc' => 'Mitigación de fuerza bruta en login.', 'status' => 'completed', 'type' => 'security', 'assigned' => 'Carlos Mendoza', 'xp' => 50],
                        ['id' => 'tk_sec2', 'title' => 'Filtro eBPF en kernel para descarte de paquetes SYN flood', 'desc' => 'Procesamiento en driver XDP antes de stack de red.', 'status' => 'in_progress', 'type' => 'security', 'assigned' => 'Carlos Mendoza', 'xp' => 60],
                    ],
                    'prs' => []
                ]
            ],
            [
                'id'          => 'algo',
                'name'        => 'Clan de Algoritmos & Grafos',
                'tag'         => '[ALGO]',
                'category'    => 'algorithms',
                'description' => 'Optimización combinatoria, estructuras de datos avanzadas y algoritmos de grafos paralelos.',
                'lines'       => ['Grafos Consecutivos & Tarjan SCC', 'Estructuras Succinct & Bloom Filters', 'Programación Dinámica Concurrente'],
                'streak'      => 3,
                'level'       => 2,
                'level_title' => 'Laboratorio de Algorítmica',
                'xp'          => 2100,
                'next_xp'     => 3500,
                'challenge'   => ['title' => 'Planificador de Rutas Bellman-Ford Concurrente', 'xpReward' => 300, 'completed' => false],
                'quest'       => [
                    'title'        => 'Simulacro: Detección de Ciclos Negativos en Mercados de Arbitraje',
                    'description'  => 'Correr Bellman-Ford con escala de 10,000 nodos y podar ramas tempranas para alertar en menos de 5ms.',
                    'targetCount'  => 3,
                    'currentCount' => 1,
                    'xpReward'     => 350,
                    'completed'    => false,
                ],
                'project' => [
                    'id'          => 'prj_algo_graph',
                    'title'       => 'Motor de Ruteo y Grafos de Alta Dimensión',
                    'description' => 'Biblioteca algorítmica para análisis de grafos ponderados con evaluación en paralelo OpenMP.',
                    'stack'       => ['C++20', 'OpenMP', 'Google Benchmark'],
                    'branch'      => 'main',
                    'domain'      => 'https://syseng-graphs.vercel.app',
                    'commit'      => '7fa142b',
                    'tasks'       => [
                        ['id' => 'tk_algo1', 'title' => 'Matriz dispersa con formato CSR para compresión de grafos', 'desc' => 'Ahorro del 80% en uso de RAM vs lista de adyacencia estándar.', 'status' => 'completed', 'type' => 'perf', 'assigned' => 'Sofía Paz', 'xp' => 45],
                        ['id' => 'tk_algo2', 'title' => 'Paralelización de Dijkstra con cola de prioridad Lock-Free', 'desc' => 'Escalamiento lineal en CPUs multinúcleo.', 'status' => 'in_progress', 'type' => 'feature', 'assigned' => 'Sofía Paz', 'xp' => 50],
                    ],
                    'prs' => []
                ]
            ],
            [
                'id'          => 'ai',
                'name'        => 'Machine Learning & IA Aplicada',
                'tag'         => '[AI]',
                'category'    => 'ai',
                'description' => 'Modelos neuronales para ingeniería inversa, compiladores con optimizaciones basadas en ML e inferencia distribuida.',
                'lines'       => ['Quantization AWQ & GGUF en Edge Devices', 'Vector Databases & Hybrid Search RAG', 'Optimización de Grafos de Cómputo ONNX/TensorRT'],
                'streak'      => 6,
                'level'       => 4,
                'level_title' => 'Laboratorio de IA y Redes Neuronales',
                'xp'          => 4900,
                'next_xp'     => 6500,
                'challenge'   => ['title' => 'Agente de Verificación Formal de Código con LLM Local', 'xpReward' => 450, 'completed' => false],
                'quest'       => [
                    'title'        => 'Simulacro: Mitigación de Alucinaciones en Asistente de Cátedra',
                    'description'  => 'Integrar filtrado de similitud coseno con reranker cross-encoder para garantizar que solo se cite bibliografía oficial.',
                    'targetCount'  => 3,
                    'currentCount' => 2,
                    'xpReward'     => 450,
                    'completed'    => false,
                ],
                'project' => [
                    'id'          => 'prj_ai_agent',
                    'title'       => 'Copiloto de Auditoría Estática con Modelos de Código',
                    'description' => 'Microservicio de embeddings y reranking para análisis sintáctico y semántico en pipelines de CI/CD.',
                    'stack'       => ['Python 3.11', 'PyTorch', 'FastAPI', 'Qdrant'],
                    'branch'      => 'main',
                    'domain'      => 'https://syseng-copilot.vercel.app',
                    'commit'      => 'e32b91c',
                    'tasks'       => [
                        ['id' => 'tk_ai1', 'title' => 'Extracción de Abstract Syntax Trees con tree-sitter', 'desc' => 'Tokenización granular de funciones en C/C++ y Go.', 'status' => 'completed', 'type' => 'feature', 'assigned' => 'Mateo Rios', 'xp' => 45],
                        ['id' => 'tk_ai2', 'title' => 'Cuantización INT8 con llama.cpp en contenedores Docker', 'desc' => 'Latencia de respuesta menor a 400ms por snippet.', 'status' => 'in_progress', 'type' => 'perf', 'assigned' => 'Mateo Rios', 'xp' => 55],
                    ],
                    'prs' => []
                ]
            ],
        ];

        foreach ($clansData as $clanInfo) {
            $clan = Clan::updateOrCreate(
                ['id' => $clanInfo['id']],
                [
                    'name'              => $clanInfo['name'],
                    'tag'               => $clanInfo['tag'],
                    'category'          => $clanInfo['category'],
                    'description'       => $clanInfo['description'],
                    'lines_of_research' => $clanInfo['lines'],
                    'streak_days'       => $clanInfo['streak'],
                    'level'             => $clanInfo['level'],
                    'level_title'       => $clanInfo['level_title'],
                    'current_xp'        => $clanInfo['xp'],
                    'next_level_xp'     => $clanInfo['next_xp'],
                    'weekly_challenge'  => $clanInfo['challenge'],
                    'weekly_quest'      => $clanInfo['quest'],
                ]
            );

            // Asociar miembros
            if ($student) {
                ClanMember::firstOrCreate(
                    ['clan_id' => $clan->id, 'user_id' => $student->id],
                    ['role' => 'Cadete Investigador', 'joined_at' => now()]
                );
            }
            if ($teacher) {
                ClanMember::firstOrCreate(
                    ['clan_id' => $clan->id, 'user_id' => $teacher->id],
                    ['role' => 'Director Cátedra', 'joined_at' => now()]
                );
            }

            // Proyecto
            $projData = $clanInfo['project'];
            $project = ClanProject::updateOrCreate(
                ['id' => $projData['id']],
                [
                    'clan_id'               => $clan->id,
                    'title'                 => $projData['title'],
                    'description'           => $projData['description'],
                    'lead_researcher'       => $teacher?->name ?? 'Director Cátedra Sistemas',
                    'status'                => 'en_progreso',
                    'tech_stack'            => $projData['stack'],
                    'members_joined'        => [$student?->name ?? 'Alex Torres', $teacher?->name ?? 'Director Cátedra'],
                    'active_branch'         => $projData['branch'],
                    'production_deployment' => [
                        'domain'        => $projData['domain'],
                        'status'        => 'ready',
                        'commitHash'    => $projData['commit'],
                        'commitMessage' => "Release estable v1.0 ({$clan->tag})",
                        'branch'        => 'main',
                        'deployedAt'    => 'hace 2h por ' . ($student?->name ?? 'Alex Torres'),
                    ],
                ]
            );

            // Tareas
            foreach ($projData['tasks'] as $t) {
                ClanProjectTask::updateOrCreate(
                    ['id' => $t['id']],
                    [
                        'project_id'  => $project->id,
                        'clan_id'     => $clan->id,
                        'title'       => $t['title'],
                        'description' => $t['desc'],
                        'status'      => $t['status'],
                        'type'        => $t['type'],
                        'assigned_to' => $t['assigned'],
                        'xp_reward'   => $t['xp'],
                        'completed'   => ($t['status'] === 'completed'),
                    ]
                );
            }

            // Pull requests
            if (!empty($projData['prs'])) {
                foreach ($projData['prs'] as $pr) {
                    ClanProjectPullRequest::updateOrCreate(
                        ['id' => $pr['id']],
                        [
                            'project_id'      => $project->id,
                            'clan_id'         => $clan->id,
                            'number'          => $pr['number'],
                            'title'           => $pr['title'],
                            'description'     => $pr['description'],
                            'source_branch'   => $pr['source'],
                            'target_branch'   => $pr['target'],
                            'status'          => $pr['status'],
                            'ci_status'       => 'passed',
                            'author'          => $pr['author'],
                            'author_role'     => $pr['role'],
                            'merged_by'       => $pr['merged_by'] ?? null,
                            'merged_at'       => $pr['merged_at'] ?? null,
                            'preview_url'     => $pr['preview'],
                            'build_duration'  => '22s',
                            'code_diff'       => $pr['diff'],
                            'reviews'         => $pr['reviews'] ?? [],
                            'xp_reward'       => 90,
                            'linked_issue_id' => $pr['issue_id'] ?? null,
                        ]
                    );
                }
            }

            // Commits iniciales
            ClanProjectCommit::updateOrCreate(
                ['id' => 'cmt_' . $projData['commit']],
                [
                    'project_id' => $project->id,
                    'clan_id'    => $clan->id,
                    'hash'       => $projData['commit'],
                    'message'    => "Despliegue inicial a producción ({$clan->tag})",
                    'author'     => $student?->name ?? 'Alex Torres',
                    'branch'     => 'main',
                    'time_ago'   => 'hace 2h',
                ]
            );
        }

        // Post RFC con Aval de Cátedra de ejemplo
        $krnlClan = Clan::find('krnl');
        if ($krnlClan) {
            ClanPost::updateOrCreate(
                ['id' => 1],
                [
                    'clan_id'             => 'krnl',
                    'user_id'             => $student?->id ?? 1,
                    'title'               => 'RFC-001: Propuesta de Planificador con Conmutación de Contexto Atómica',
                    'content'             => "He documentado los diagramas de transición de estados y la estructura de PCB para el kernel en C++20.\n\nRevisar especialmente la sección de preservación de registros en la pila del frame de interrupción.",
                    'type'                => 'propuesta',
                    'code_snippet'        => "struct PCB {\n    uint32_t pid;\n    ProcessState state;\n    uintptr_t saved_esp;\n    uint32_t priority;\n};",
                    'code_language'       => 'cpp',
                    'teacher_endorsement' => [
                        'teacherName' => $teacher?->name ?? 'Director Cátedra Sistemas',
                        'note'        => 'Excelente especificación técnica. Aprobado para implementación en el Sprint 3 con aval de cátedra.',
                        'date'        => 'hace 3h',
                        'xpAwarded'   => 80,
                    ],
                ]
            );
        }
    }
}
