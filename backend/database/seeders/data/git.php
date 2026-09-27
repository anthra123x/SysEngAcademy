<?php

/*
 * Cursos de Git y control de versiones.
 */

return [
    // =====================================================================
    // 1. Git desde cero
    // =====================================================================
    [
        'slug' => 'git-desde-cero',
        'title' => 'Git desde cero',
        'description' => 'Instala Git, haz tus primeros commits y domina los tres estados, las ramas y el viaje por la historia sin miedo.',
        'category' => 'git',
        'difficulty' => 'beginner',
        'duration_hours' => 10,
        'is_free' => true,
        'learning_path' => 'git-y-control-versiones',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'Primeros pasos',
                'description' => 'Instalación, commits y el modelo de estados de Git.',
                'lessons' => [
                    [
                        'slug' => 'que-es-git',
                        'title' => '¿Qué es Git y por qué usarlo?',
                        'type' => 'article',
                        'duration' => 14,
                        'preview' => true,
                        'blocks' => [
                            ['h', '¿Qué es Git y por qué usarlo?'],
                            ['p', 'Git es un sistema de control de versiones distribuido: guarda el historial completo de tu proyecto en cada copia del repositorio. Cada cambio queda registrado con autor, fecha y mensaje, y puedes volver a cualquier punto de la historia.'],
                            ['p', 'A diferencia de sistemas centralizados (SVN), Git funciona offline y cada clon es un respaldo completo. Es el estándar de la industria: GitHub, GitLab y Bitbucket lo usan de base para colaborar, revisar código y desplegar.'],
                            ['code', 'bash', <<<'BASH'
# Configuración inicial (una sola vez)
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"

# Crear un repositorio
cd mi-proyecto
git init
BASH],
                            ['h', 'Qué aporta Git'],
                            ['list', [
                                'Historial completo y versionado de cada cambio',
                                'Trabajo offline y repositorios respaldados en cada clon',
                                'Ramas para experimentar sin romper lo estable',
                                'Colaboración con revisión de código en plataformas',
                                'Rollback a cualquier punto de la historia',
                            ]],
                            ['p', 'Git no es solo guardar versiones: es la base de los flujos modernos. Pull requests, code review, despliegues por rama y trazabilidad de bugs dependen de un historial limpio y bien comunicado.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Git es distribuido: cada clon es un respaldo',
                                'Registra autor, fecha y mensaje por cambio',
                                'Los repositorios locales te dejan trabajar sin red',
                                'git config prepara tu identidad para los commits',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué significa que Git sea distribuido?', 'type' => 'single', 'answers' => [
                                    ['Cada clon contiene el historial completo del repositorio', true, 'No dependes de un servidor central para trabajar ni para tener historia.'],
                                    ['Requiere un servidor central siempre conectado', false, 'Eso es un sistema centralizado como SVN.'],
                                    ['Solo funciona con internet', false, 'Git funciona offline.'],
                                    ['Reparte el código entre varios discos', false, 'No reparte nada; replica el historial.'],
                                ]],
                                ['q' => '¿Qué comando prepara tu identidad para los commits?', 'type' => 'single', 'answers' => [
                                    ['git config --global user.name / user.email', true, 'Asocia cada commit a una identidad.'],
                                    ['git init', false, 'Inicializa el repositorio.'],
                                    ['git clone', false, 'Copia un repositorio remoto.'],
                                    ['git status', false, 'Muestra el estado, no configura identidad.'],
                                ]],
                                ['q' => '¿Para qué sirve el historial de Git?', 'type' => 'multiple', 'answers' => [
                                    ['Volver a cualquier punto anterior del proyecto', true, 'Puedes restaurar o inspeccionar cualquier commit.'],
                                    ['Saber quién cambió cada línea y cuándo', true, 'Cada cambio tiene autor, fecha y mensaje.'],
                                    ['Sustituir al sistema de archivos del servidor', false, 'Git versiona contenido, no reemplaza el FS.'],
                                    ['Evitar escribir código', false, 'No tiene relación.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'primeros-commits',
                        'title' => 'Tus primeros commits',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Tus primeros commits'],
                            ['p', 'Un commit es un punto de control: una foto del estado de tus archivos con un mensaje que explique qué y por qué. Cuanto más atómico y claro sea el mensaje, más fácil será leer el historial meses después.'],
                            ['p', 'El flujo básico es git add para preparar archivos, git commit para sellar el punto de control y git status para ver en qué punto estás. git log muestra la historia y git diff las diferencias pendientes.'],
                            ['code', 'bash', <<<'BASH'
# Primer commit
git status                 # ¿qué ha cambiado?
git add index.html         # prepara un archivo
git add src/               # o toda una carpeta
git commit -m "feat: página inicial con tarjeta de curso"

# Revisar la historia y cambios
git log --oneline          # lista resumida de commits
git diff                   # cambios aún sin preparar
git diff --staged          # cambios ya en el staging
BASH],
                            ['h', 'Buenas prácticas de commits'],
                            ['list', [
                                'Mensajes claros: qué y por qué, no solo qué',
                                'Commits atómicos: un cambio lógico por commit',
                                'No versionar archivos generados ni secretos (.gitignore)',
                                'Revisar git status y git diff antes de commitear',
                                'Mensaje imperativo: "add", "fix", "refactor"',
                            ]],
                            ['p', 'Un buen mensaje de commit es el dif más valioso del proyecto: responde por qué se tomó una decisión. El formato Conventional Commits (feat, fix, refactor, docs...) hace esa lectura consistente y habilita changelogs y releases automáticas.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'git add prepara; git commit sella',
                                'git status y git diff te muestran el terreno',
                                'git log cuenta la historia resumida',
                                'Mensajes atómicos y claros = historial útil',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace git add?', 'type' => 'single', 'answers' => [
                                    ['Prepara (staging) los cambios para el próximo commit', true, 'Los archivos quedan listos para sellarse con commit.'],
                                    ['Guarda los cambios permanentemente', false, 'Eso es git commit.'],
                                    ['Elimina archivos del repositorio', false, 'Eliminar es git rm.'],
                                    ['Descarga los cambios del remoto', false, 'Eso es git pull.'],
                                ]],
                                ['q' => '¿Qué comando muestra los cambios que aún no has preparado?', 'type' => 'single', 'answers' => [
                                    ['git diff', true, 'Compara working directory con staging.'],
                                    ['git diff --staged', false, 'Eso muestra los ya preparados.'],
                                    ['git log', false, 'Muestra el historial, no los pendientes.'],
                                    ['git init', false, 'Inicializa el repositorio.'],
                                ]],
                                ['q' => '¿Por qué se recomiendan commits atómicos?', 'type' => 'multiple', 'answers' => [
                                    ['Cada commit representa un cambio lógico y revisable', true, 'Facilita entender y revertir por separado.'],
                                    ['Simplifica el code review y el bisect de bugs', true, 'Un commit pequeño se revisa y se aísla mejor.'],
                                    ['El historial se vuelve legible', true, 'Mensajes claros y cambios únicos se leen solos.'],
                                    ['Git funciona más rápido con muchos commits', false, 'El número de commits no acelera nada.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'estados-y-staging',
                        'title' => 'Los tres estados: working, staging y commit',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Los tres estados: working, staging y commit'],
                            ['p', 'Git divide tu trabajo en tres áreas: el working directory (tus archivos editados), el staging area (cambios preparados) y el repositorio (commits sellados). Cada archivo puede estar modificado, preparado o confirmado.'],
                            ['p', 'Entender las áreas explica comandos que parecen mágicos: git add mueve de working a staging; git commit mueve de staging al repositorio; git restore devuelve archivos al estado de un commit.'],
                            ['code', 'bash', <<<'BASH'
# Flujo entre áreas
echo "cambio" >> README.md
git status                # README modificado (working)
git add README.md
git status                # README en staging
git commit -m "docs: mejora el README"
git log --oneline         # nuevo commit en el repositorio

# Moverse hacia atrás
git restore README.md         # descarta cambios del working
git restore --staged README.md  # saca del staging sin borrar
BASH],
                            ['h', 'Las tres áreas'],
                            ['list', [
                                'Working directory: archivos que editas',
                                'Staging area: cambios preparados, aún no sellados',
                                'Repositorio: historial de commits',
                                'git status te dice en qué área está cada archivo',
                                'git restore regresa archivos de un área a otra',
                            ]],
                            ['p', 'El staging permite construir commits con precisión: puedes preparar solo una parte de los cambios de un archivo (git add -p) y dejar el resto fuera. Es la herramienta clave para commits atómicos aunque hayas tocado varias cosas a la vez.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Working, staging y repositorio: el modelo mental de Git',
                                'add prepara, commit sella',
                                'git restore descarta o saca del staging',
                                'git status narra el estado completo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hay en el staging area?', 'type' => 'single', 'answers' => [
                                    ['Los cambios preparados para el próximo commit', true, 'Es el puente entre editar y sellar.'],
                                    ['El historial completo de commits', false, 'Eso es el repositorio.'],
                                    ['Los archivos que editas', false, 'Eso es el working directory.'],
                                    ['Las ramas remotas', false, 'Las ramas remotas son otro concepto.'],
                                ]],
                                ['q' => '¿Qué hace git restore README.md?', 'type' => 'single', 'answers' => [
                                    ['Descarta los cambios sin preparar y vuelve al estado del último commit', true, 'Restaura el archivo desde el índice o commit.'],
                                    ['Crea un commit nuevo', false, 'restore no commitea.'],
                                    ['Sube el archivo al remoto', false, 'Eso sería push.'],
                                    ['Borra el archivo', false, 'Restaura contenido, no lo borra.'],
                                ]],
                                ['q' => '¿Para qué sirve git add -p?', 'type' => 'multiple', 'answers' => [
                                    ['Preparar por partes un mismo archivo', true, 'Eliges qué hunks entran al commit.'],
                                    ['Construir commits atómicos con cambios mezclados', true, 'Separar lógicamente lo que tocaste junto.'],
                                    ['Revisar visualmente los cambios antes de prepararlos', false, 'Lo revisas por texto con diffs, no es un visor gráfico.'],
                                    ['Borrar archivos del repositorio', false, 'No borra nada.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Ramas e historia',
                'description' => 'Ramas, viaje por el historial y estrategias de organización.',
                'lessons' => [
                    [
                        'slug' => 'ramas-y-merge',
                        'title' => 'Ramas y merge',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Ramas y merge'],
                            ['p', 'Una rama es un puntero a un commit que se mueve con tus nuevos commits. Crear una rama te permite experimentar sin tocar la línea principal; cuando el trabajo está listo, la integras con merge de vuelta a main.'],
                            ['p', 'El merge combina historias: si los cambios no se pisan, Git crea un merge automático; si tocan las mismas líneas, aparecen conflictos que resuelves a mano. Los conflictos no son un fracaso: son el momento de decidir qué versión gana.'],
                            ['code', 'bash', <<<'BASH'
# Crear y cambiar de rama
git checkout -b feature/pagos   # crea y se posiciona
git branch                      # lista ramas

# Trabajar y volver
git add . && git commit -m "feat: flujo de pagos"
git checkout main
git merge feature/pagos         # integra la rama

# Si hay conflicto
# 1. edita los archivos marcados por Git
# 2. git add archivo-resuelto
# 3. git commit
BASH],
                            ['h', 'Cómo pensar en ramas'],
                            ['list', [
                                'main: línea estable, siempre desplegable',
                                'Ramas cortas por feature o fix',
                                'Merge integra historias divergentes',
                                'El conflicto se resuelve conservando ambas intenciones',
                                'Borra la rama tras integrarla',
                            ]],
                            ['p', 'Las ramas son baratas: crear una no copia nada, solo apunta a un commit. Por eso los flujos modernos crean una rama por tarea, integran pronto y evitan ramas longevas que divergen demasiado y multiplican los conflictos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Una rama es un puntero a commits',
                                'checkout -b crea y cambia en un paso',
                                'merge integra; el conflicto se resuelve a mano',
                                'Ramas cortas y merges frecuentes evitan dolores',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es una rama en Git?', 'type' => 'single', 'answers' => [
                                    ['Un puntero a un commit que avanza con tus nuevos commits', true, 'Crear ramas es barato porque solo es un puntero.'],
                                    ['Una copia de todos los archivos', false, 'No duplica archivos.'],
                                    ['Un repositorio separado', false, 'La rama vive en el mismo repositorio.'],
                                    ['Un backup del servidor', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Cuándo aparece un conflicto de merge?', 'type' => 'single', 'answers' => [
                                    ['Cuando las ramas modifican las mismas líneas de los mismos archivos', true, 'Git no puede decidir solo y pide tu criterio.'],
                                    ['Cuando un archivo está muy largo', false, 'El tamaño no genera conflictos.'],
                                    ['Siempre que haces merge', false, 'La mayoría de merges son automáticos.'],
                                    ['Cuando hay dos ramas', false, 'Dos ramas pueden fusionarse sin conflicto.'],
                                ]],
                                ['q' => '¿Qué comandos crean y cambian a una rama nueva en un solo paso?', 'type' => 'multiple', 'answers' => [
                                    ['git checkout -b feature/x', true, 'Crea la rama y te posiciona en ella.'],
                                    ['git switch -c feature/x', true, 'Forma moderna equivalente a checkout -b.'],
                                    ['git branch feature/x', false, 'branch solo la crea, no cambia.'],
                                    ['git merge feature/x', false, 'Eso integra, no crea.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'historia-y-revert',
                        'title' => 'Viajar por la historia: log, diff y revert',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Viajar por la historia: log, diff y revert'],
                            ['p', 'Git es una máquina del tiempo: puedes leer la historia, comparar versiones y deshacer cambios con precisión. git log cuenta la historia, git diff compara versiones y git revert deshace un commit creando otro que lo compensa.'],
                            ['p', 'Revert es la forma segura de deshacer en equipos: en vez de borrar historia (lo que haría un reset), añade un commit inverso y mantiene el historial íntegro y sincronizable con el remoto.'],
                            ['code', 'bash', <<<'BASH'
# Leer la historia
git log --oneline --graph      # historia con grafo de ramas
git show abc123                # detalle de un commit
git diff main..feature         # diferencias entre ramas
git diff HEAD~2 HEAD           # cambios entre dos puntos

# Deshacer con seguridad
git revert abc123              # nuevo commit que deshace abc123
git revert --no-commit abc123  # prepara sin commitear (varios juntos)
BASH],
                            ['h', 'Comandos de la máquina del tiempo'],
                            ['list', [
                                'git log: historia con mensajes y hashes',
                                'git show: desglose de un commit concreto',
                                'git diff: comparación entre dos puntos',
                                'git revert: deshace creando un commit inverso',
                                'git reset: peligroso en compartido; evítalo en remoto',
                            ]],
                            ['p', 'El hash (abc123) identifica cada commit de forma única. Con él puedes comparar, inspeccionar o revertir cualquier punto. Aprender a leer git log --graph te da el mapa mental de cómo evolucionó el proyecto.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'log narra, diff compara, revert deshace',
                                'El hash localiza cualquier commit',
                                'revert es seguro en ramas compartidas',
                                'reset reescribe historia: solo en local y con cuidado',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace git revert abc123?', 'type' => 'single', 'answers' => [
                                    ['Crea un nuevo commit que deshace los cambios de abc123', true, 'La historia se conserva y el equipo puede sincronizar sin choques.'],
                                    ['Borra abc123 del historial', false, 'Eso sería un reset, no un revert.'],
                                    ['Ignora el commit para siempre', false, 'Sigue en el historial; se compensa con otro commit.'],
                                    ['Cambia la rama actual a abc123', false, 'Eso sería checkout del hash.'],
                                ]],
                                ['q' => '¿Por qué se prefiere revert sobre reset en rama compartida?', 'type' => 'single', 'answers' => [
                                    ['revert no reescribe historia, así todos sincronizan sin conflictos', true, 'reset reescribiría historia ya distribuida.'],
                                    ['revert es más rápido siempre', false, 'No es cuestión de velocidad.'],
                                    ['reset no existe en Git', false, 'reset existe, pero es destructivo en compartido.'],
                                    ['revert borra el repositorio', false, 'Al contrario: es la opción conservadora.'],
                                ]],
                                ['q' => '¿Qué comandos te ayudan a investigar la historia?', 'type' => 'multiple', 'answers' => [
                                    ['git log --oneline --graph', true, 'Historia resumida con el grafo de ramas.'],
                                    ['git show abc123', true, 'Detalle del commit con sus cambios.'],
                                    ['git diff main..feature', true, 'Comparación entre ramas o puntos.'],
                                    ['git push', false, 'push sube, no investiga historia.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'gitignore-y-estrategias',
                        'title' => '.gitignore, aliases y estrategias de commit',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', '.gitignore, aliases y estrategias de commit'],
                            ['p', 'Un repositorio limpio no versiona lo generado: node_modules, vendor, .env, build/. El archivo .gitignore dice a Git qué ignorar, evitando repos hinchados y secretos filtrados.'],
                            ['p', 'Los aliases personalizan Git para tu flujo diario: gl para un log bonito, co para checkout... Además, decidir una estrategia de commits (Conventional Commits, commits atómicos) mantiene la historia legible y habilita releases automáticas.'],
                            ['code', 'bash', <<<'BASH'
# .gitignore
node_modules/
vendor/
.env
dist/
*.log

# Aliases útiles
git config --global alias.gl "log --oneline --graph --all"
git config --global alias.co checkout
git config --global alias.st status

# Uso
git gl       # historia bonita en un vistazo
BASH],
                            ['h', 'Qué tener en el radar'],
                            ['list', [
                                'Ignora dependencias, builds y secretos',
                                'Aliases para comandos que repites',
                                'Conventional Commits: feat, fix, refactor, docs, chore',
                                'Commits atómicos por responsabilidad',
                                'Commit temprano y seguido: checkpoints pequeños',
                            ]],
                            ['p', 'Un patrón sólido: commits convencionales + ramas cortas + revisión en PR. La historia resulta un relato coherente de decisiones, y herramientas como changelogs automáticos o semver funcionan sin esfuerzo extra.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                '.gitignore mantiene el repo limpio y seguro',
                                'Los aliases aceleran tu flujo diario',
                                'Conventional Commits estandariza el historial',
                                'Commits pequeños y frecuentes = checkpoints útiles',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué archivo se debe ignorar y nunca versionar?', 'type' => 'single', 'answers' => [
                                    ['.env (contiene secretos del entorno)', true, 'Los secretos nunca van al historial.'],
                                    ['README.md', false, 'El README suele versionarse.'],
                                    ['src/', false, 'El código fuente se versiona.'],
                                    ['composer.json', false, 'El manifiesto de dependencias se versiona.'],
                                ]],
                                ['q' => '¿Para qué sirven los aliases de Git?', 'type' => 'multiple', 'answers' => [
                                    ['Abreviar comandos que usas a diario', true, 'gl, co o st ahorran tecleo.'],
                                    ['Personalizar la salida, como un log con grafo', true, 'El alias puede incluir opciones fijas.'],
                                    ['Cambiar el comportamiento de Git internamente', false, 'Los aliases solo invocan comandos existentes.'],
                                    ['Guardar secretos', false, 'Los aliases no guardan secretos.'],
                                ]],
                                ['q' => '¿Qué formato de mensaje usa feat:, fix:, docs:?', 'type' => 'single', 'answers' => [
                                    ['Conventional Commits', true, 'Estandariza el tipo de cambio en el prefijo.'],
                                    ['Mensajes aleatorios', false, 'Todo lo contrario.'],
                                    ['Markdown', false, 'Markdown es formato de texto, no de commits.'],
                                    ['JSON', false, 'No se usan JSON en mensajes.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 2. Git colaboración y flujos
    // =====================================================================
    [
        'slug' => 'git-colaboracion-y-flujos',
        'title' => 'Git colaboración y flujos',
        'description' => 'Trabaja en equipo con pull requests, resuelve conflictos, domina rebase y elige el flujo de ramas adecuado.',
        'category' => 'git',
        'difficulty' => 'intermediate',
        'duration_hours' => 12,
        'is_free' => true,
        'learning_path' => 'git-y-control-versiones',
        'learning_path_level' => 2,
        'order' => 2,
        'modules' => [
            [
                'title' => 'Trabajo en equipo',
                'description' => 'Pull requests, conflictos y reescritura segura de historia.',
                'lessons' => [
                    [
                        'slug' => 'ramas-y-pull-requests',
                        'title' => 'Ramas, merge y pull requests',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Ramas, merge y pull requests'],
                            ['p', 'En equipo, nadie empuja directo a main: cada cambio viaja en una rama y se integra mediante un pull request (PR). El PR es el punto de revisión: la plataforma muestra el diff, discutes, ajustas y, cuando todo está verde, lo fusionas.'],
                            ['p', 'El flujo típico: git pull para actualizar, creas la rama de tu tarea, haces commits pequeños y claros, la subes con git push -u origin rama, abres el PR y tras la revisión lo mergeas. La integración con CI corre tests automáticos en cada PR.'],
                            ['code', 'bash', <<<'BASH'
# Comenzar una tarea
git checkout -b feat/nueva-tarjeta
git push -u origin feat/nueva-tarjeta   # sube y vincula la rama

# Mantener la rama al día
git fetch origin
git merge origin/main

# Tras la revisión, main avanza
git checkout main
git pull
git branch -d feat/nueva-tarjeta        # borra la rama integrada
BASH],
                            ['h', 'Buenas prácticas de PR'],
                            ['list', [
                                'PR pequeños y con un único propósito',
                                'Título y descripción que cuenten el porqué',
                                'Tests y CI verdes antes de fusionar',
                                'Revisión de otro par de ojos',
                                'Resolver conflictos antes del merge',
                            ]],
                            ['p', 'El PR convierte el trabajo individual en discusión de equipo: las decisiones quedan documentadas en la conversación, y el historial refleja qué se revisó. Fusiona pronto y mantén los PR vivos menos de un día de trabajo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Nunca se empuja directo a main en equipo',
                                'El PR es el punto de revisión y discusión',
                                'push -u vincula la rama con su remota',
                                'PR pequeños y CI verde aceleran la integración',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el propósito principal de un pull request?', 'type' => 'single', 'answers' => [
                                    ['Revisar y discutir los cambios antes de integrarlos', true, 'El PR es la puerta de revisión hacia la rama base.'],
                                    ['Descargar cambios de otros', false, 'Eso es git pull.'],
                                    ['Borrar ramas remotas', false, 'Eso es git push --delete.'],
                                    ['Comprimir el repositorio', false, 'No comprime nada.'],
                                ]],
                                ['q' => '¿Qué hace git push -u origin mi-rama?', 'type' => 'multiple', 'answers' => [
                                    ['Sube la rama al remoto', true, 'Publica la rama en origin.'],
                                    ['Vincula (upstream) la rama local con la remota', true, 'Desde entonces git pull funciona sin argumentos.'],
                                    ['Borra la rama local', false, 'La conserva y publica.'],
                                    ['Cierra el PR automáticamente', false, 'La plataforma gestiona el PR aparte.'],
                                ]],
                                ['q' => '¿Qué hace la revisión (code review) en el flujo de PR?', 'type' => 'multiple', 'answers' => [
                                    ['Atrapa errores antes de integrar', true, 'Un segundo par de ojos ve lo que el autor no.'],
                                    ['Documenta decisiones', true, 'La conversación queda en el PR.'],
                                    ['Sustituye los tests', false, 'La revisión complementa, no reemplaza los tests.'],
                                    ['Garantiza cero bugs', false, 'Ningún proceso garantiza cero bugs.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'conventional-commits-y-conflictos',
                        'title' => 'Conventional Commits y resolución de conflictos',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Conventional Commits y resolución de conflictos'],
                            ['p', 'Conventional Commits da un formato fijo a los mensajes: tipo (feat, fix, refactor...), alcance opcional y descripción. Ese formato estandariza el historial, habilita changelogs automáticos y permite releases semánticas calculadas desde los mensajes.'],
                            ['p', 'Los conflictos aparecen cuando dos ramas cambian las mismas líneas. Git marca los archivos con <<<<<<< ======= >>>>>>> y tú decides qué combinación conservar. Resolver bien es entender ambas intenciones, no borrar una versión a la ligera.'],
                            ['code', 'bash', <<<'BASH'
# Formatos válidos
feat: añadir pago con tarjeta
fix(api): corregir error 500 en login
refactor: extraer servicio de notificaciones
docs: explicar variables de entorno
chore: actualizar dependencias

# Resolver conflicto
git merge feature/pagos
# archivo con marcadores:
# <<<<<<< HEAD  (tu rama)
#   vieja: $precio
# =======
#   nueva: $precio + $iva
# >>>>>>> feature/pagos
# editas, luego:
git add archivo.php
git commit
BASH],
                            ['h', 'Tips para conflictos'],
                            ['list', [
                                'Actualiza tu rama seguido (merge origin/main)',
                                'Los conflictos se resuelven leyendo ambas versiones',
                                'Después de resolver: add + commit',
                                'No uses force push sobre ramas compartidas',
                                'PR pequeños = conflictos pequeños',
                            ]],
                            ['p', 'La mayoría de conflictos son mecánicos, pero algunos requieren conversación: si el significado ha cambiado (renombres, reglas de negocio), pregunta al autor original. La herramienta favores (git merge, rebase) son solo intermediarios: la decisión final es humana.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Conventional Commits: tipo + descripción',
                                'Habilita changelogs y versionado semántico automático',
                                'El conflicto se resuelve combinando intenciones',
                                'Actualizar la rama a menudo reduce conflictos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué mensaje sigue correctamente Conventional Commits?', 'type' => 'single', 'answers' => [
                                    ['fix(auth): corregir sesión expirada', true, 'Tipo fix, alcance auth y descripción clara.'],
                                    ['he cambiado cosas', false, 'No usa tipo ni formato.'],
                                    ['FIX', false, 'Solo el tipo no es un mensaje.'],
                                    ['Update file 1', false, 'No describe el qué ni el porqué.'],
                                ]],
                                ['q' => '¿Qué aparece en un archivo con conflicto sin resolver?', 'type' => 'single', 'answers' => [
                                    ['Marcadores <<<<<<< ======= >>>>>>> con ambas versiones', true, 'Git deja claras las dos versiones en conflicto.'],
                                    ['Un error de compilación', false, 'El conflicto es textual, no de compilación.'],
                                    ['El archivo se borra', false, 'El archivo queda marcado, no borrado.'],
                                    ['Un ISBN de copia', false, 'No existe tal cosa.'],
                                ]],
                                ['q' => '¿Qué reduce la probabilidad de conflictos grandes?', 'type' => 'multiple', 'answers' => [
                                    ['Mantener PR pequeños', true, 'Menos líneas tocadas = menos choques.'],
                                    ['Actualizar la rama con origin/main con frecuencia', true, 'Integrar pronto evita divergencias largas.'],
                                    ['Evitar el trabajo en equipo', false, 'No es una opción real.'],
                                    ['Tocar siempre el mismo archivo entre todos', false, 'Eso multiplica los conflictos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'rebase-y-reescritura',
                        'title' => 'Rebase, squash y reescritura segura de historia',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Rebase, squash y reescritura segura de historia'],
                            ['p', 'El rebase reaplica tus commits sobre otra base, produciendo una historia lineal: tu rama parece haber empezado después de la última actualización de main. Es especialmente útil en PRs para integrar cambios y evitar merges enmarañados.'],
                            ['p', 'El squash (habitualmente con git rebase -i) agrupa varios commits en uno solo: convierte el proceso de trabajo (wip, fix, oops) en un resultado limpio. Regla de seguridad: nunca reescribas historia que ya compartiste con el equipo.'],
                            ['code', 'bash', <<<'BASH'
# Rebase simple: integra main bajo tus commits
git checkout feature/pagos
git fetch origin
git rebase origin/main

# Interactivo: squash y reescribe mensajes
git rebase -i HEAD~4
# pick aaa111 feat: pago
# squash bbb222 wip
# squash ccc333 fix tipografia

# Tras rebase en una rama ya publicada
git push --force-with-lease
BASH],
                            ['h', 'Cuándo usar cada técnica'],
                            ['list', [
                                'rebase: rama local al día con main, historial lineal',
                                'squash: agrupar el proceso de trabajo en un commit',
                                '--force-with-lease: publicar historia reescrita sin pisar a otros',
                                'Nunca reescribas historia compartida sin avisar',
                                'merge conserva el contexto; rebase, la linealidad',
                            ]],
                            ['p', 'git pull --rebase es la opción preferida en muchos equipos: en vez de crear commits de merge por cada actualización, reaplica tu trabajo sobre lo nuevo. La historia queda plana y los PRs se revisan mejor.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'rebase reaplica commits sobre otra base',
                                'squash agrupa trabajo suelto en un commit final',
                                'reescribir historia compartida es peligroso',
                                '--force-with-lease protege el trabajo de otros',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace git rebase origin/main sobre tu rama?', 'type' => 'single', 'answers' => [
                                    ['Reaplica tus commits encima de la última versión de main', true, 'Tu rama queda lineal sobre la base actualizada.'],
                                    ['Borra main', false, 'No borra nada.'],
                                    ['Crea un commit de merge', false, 'Eso es merge; el rebase evita el commit de merge.'],
                                    ['Elimina tus commits', false, 'Los conserva y los recoloca.'],
                                ]],
                                ['q' => '¿Para qué sirve squash en git rebase -i?', 'type' => 'multiple', 'answers' => [
                                    ['Fusionar varios commits en uno solo', true, 'Agrupa wip y arreglos en un commit final.'],
                                    ['Limpiar la historia antes de abrir el PR', true, 'El resultado es un único cambio coherente.'],
                                    ['Cambiar el autor de todos los commits', false, 'Eso es otra operación, no squash.'],
                                    ['Subir cambios al remoto', false, 'El squash no sube nada.'],
                                ]],
                                ['q' => '¿Por qué no reescribir historia ya compartida?', 'type' => 'single', 'answers' => [
                                    ['Los compañeros que la clonaron tendrían historias divergentes', true, 'Sus ramas apuntan a commits que ya no existen; el push fallará o pisará trabajo.'],
                                    ['Git borra el repositorio', false, 'No lo borra.'],
                                    ['GitHub no permite push con historia reescrita', false, 'Permite, pero es peligroso sin coordinación.'],
                                    ['Es más lento', false, 'La velocidad no es el problema.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Flujos de trabajo',
                'description' => 'Estrategias de ramas, code review y colaboración abierta.',
                'lessons' => [
                    [
                        'slug' => 'flujos-de-trabajo-git-flow',
                        'title' => 'Git Flow y flujos basados en trunk',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Git Flow y flujos basados en trunk'],
                            ['p', 'Git Flow organiza ramas por propósito: main para releases, develop para integración, feature/* para tareas, release/* para preparar versiones y hotfix/* para urgencias. Es robusto, pero pesado para equipos que despliegan continuamente.'],
                            ['p', 'Los flujos basados en trunk simplifican: todos integran en main en fragmentos pequeños (a diario o varias veces al día) protegidos por CI y feature flags. Menos ramas, menos merges y despliegues frecuentes.'],
                            ['code', 'bash', <<<'BASH'
# Git Flow (esquema)
git flow feature start login      # crea feature/login desde develop
git flow release start 1.4.0      # rama release desde develop
git flow hotfix start sev-1       # rama de urgencia desde main

# Trunk-based (esquema)
main (protegida, siempre desplegable)
  └── ramas de tarea (1-2 días)
      └── PR -> main -> CD
BASH],
                            ['h', 'Comparativa rápida'],
                            ['list', [
                                'Git Flow: muchas ramas, releases planificadas',
                                'Trunk-based: main integra todo, deploys frecuentes',
                                'Feature flags desacoplan despliegue de activación',
                                'CI fuerte es requisito del trunk-based',
                                'Elige el flujo según tu cadencia de releases',
                            ]],
                            ['p', 'No hay flujo perfecto: los equipos de producto con releases mensuales disfrutan Git Flow; los que despliegan varias veces al día prefieren trunk-based. Lo importante es que el flujo refleje tu cadencia y que todos lo sigan con disciplina.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Git Flow separa features, releases y hotfixes',
                                'Trunk-based integra en main continuamente',
                                'Feature flags permiten activar sin desplegar',
                                'El flujo debe ajustarse a tu cadencia de releases',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué rama en Git Flow se usa para urgencias de producción?', 'type' => 'single', 'answers' => [
                                    ['hotfix/*', true, 'Nace de main y vuelve a él y a develop.'],
                                    ['feature/*', false, 'Las features van para su tarea.'],
                                    ['develop', false, 'develop es la integración continua.'],
                                    ['main', false, 'main es la release estable, no la urgencia.'],
                                ]],
                                ['q' => '¿Qué caracteriza a un flujo basado en trunk?', 'type' => 'multiple', 'answers' => [
                                    ['Integraciones pequeñas y frecuentes a main', true, 'El trunk siempre está desplegable.'],
                                    ['CI fuerte y despliegue continuo', true, 'La automatización protege la integración constante.'],
                                    ['Ramas longevas por feature', false, 'Todo lo contrario: ramas cortas.'],
                                    ['Releases mensuales con ramas release', false, 'Eso es más propio de Git Flow.'],
                                ]],
                                ['q' => '¿Qué permiten los feature flags?', 'type' => 'single', 'answers' => [
                                    ['Desplegar código y activarlo después sin un nuevo deploy', true, 'Desacoplan el despliegue de la activación.'],
                                    ['Bloquear el acceso a GitHub', false, 'No tiene relación.'],
                                    ['Sustituir las ramas por completo', false, 'Complementan, no sustituyen.'],
                                    ['Evitar escribir tests', false, 'No sustituyen la calidad.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'code-review-con-git',
                        'title' => 'Code review efectivo con pull requests',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Code review efectivo con pull requests'],
                            ['p', 'El code review es la práctica de mayor retorno por hora en ingeniería: atrapa bugs, difunde conocimiento y eleva el estándar del equipo. Un PR bien preparado hace la revisión rápida; una revisión constructiva hace al autor mejor.'],
                            ['p', 'Revisa con intención: lee los tests tanto como el código, verifica que la lógica cubre los casos límite y pregunta antes de asumir que algo es un error. Los comentarios describen el problema y sugieren, no ordenan.'],
                            ['code', 'bash', <<<'BASH'
# Del autor
git checkout -b fix/validacion-email
git commit -m "fix: validar email antes de enviar"
git push -u origin fix/validacion-email
# Abre PR con: qué, por qué, cómo probarlo

# Del revisor
git fetch origin
git checkout fix/validacion-email   # probar localmente
git diff origin/main..HEAD          # revisar el diff completo
BASH],
                            ['h', 'Guía de revisión'],
                            ['list', [
                                'PR pequeño: menos de 400 líneas es buena señal',
                                'Revisa tests y casos límite, no solo el código feliz',
                                'Comenta el qué y el porqué, no la persona',
                                'Señala fortalezas también, no solo errores',
                                'Automatiza lo mecánico (lint, format) para enfocarte en lo lógico',
                            ]],
                            ['p', 'Un buen equipo de revisión divide el trabajo: los linters y CI atrapan lo mecánico, y los humanos se concentran en diseño, lógica de negocio y mantenibilidad. El resultado: código que cualquiera del equipo puede mantener.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El review atrapa bugs y difunde conocimiento',
                                'PR pequeños y descriptivos agilizan la revisión',
                                'Comentarios sobre código, no sobre personas',
                                'Automatiza lo mecánico; reserva el review para lo lógico',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace que un code review sea eficaz?', 'type' => 'single', 'answers' => [
                                    ['PR pequeños con descripción clara y foco en lógica y tests', true, 'El revisor entiende rápido y aporta donde importa.'],
                                    ['Revisar todo en el último momento del release', false, 'El tiempo mata la calidad del review.'],
                                    ['Aprobar sin leer', false, 'Eso es una firma vacía.'],
                                    ['Revisar solo el código feliz', false, 'Los casos límite son donde viven los bugs.'],
                                ]],
                                ['q' => '¿Cómo se redactan comentarios útiles en un PR?', 'type' => 'multiple', 'answers' => [
                                    ['Describiendo el problema y sugiriendo una solución', true, 'Enfoca la acción sin imponer.'],
                                    ['Señalando fortalezas del cambio', true, 'Refuerza buenas prácticas y clima del equipo.'],
                                    ['Criticando a la persona que lo escribió', false, 'Se critica el código, no a la persona.'],
                                    ['Escribiendo "no me gusta" sin detalle', false, 'No aporta información accionable.'],
                                ]],
                                ['q' => '¿Qué conviene automatizar para que la revisión se centre en lo importante?', 'type' => 'multiple', 'answers' => [
                                    ['Lint y formato', true, 'Lo mecánico lo resuelve la máquina.'],
                                    ['Chequeo de tipos y tests básicos', true, 'CI verifica sin intervención humana.'],
                                    ['Decisiones de arquitectura', false, 'Eso requiere criterio humano.'],
                                    ['Validar reglas de negocio complejas', false, 'Eso es precisamente lo que se revisa.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'open-source-y-forks',
                        'title' => 'Contribuir a proyectos open source',
                        'type' => 'code_challenge',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Contribuir a proyectos open source'],
                            ['p', 'Contribuir a open source es el mejor máster de Git real: lees código de otros, adaptas tu trabajo a sus convenciones y colaboras con personas de todo el mundo. El flujo estándar es fork + rama + PR, porque no tienes permiso de escritura en el repo original.'],
                            ['p', 'Un fork es una copia del repositorio en tu cuenta. Trabajas en él, y tu pull request propone cambios al original (upstream). Las buenas contribuciones empiezan pequeñas: documentación, un bug claro o un issue etiquetado como good first issue.'],
                            ['code', 'bash', <<<'BASH'
# 1. Fork en GitHub, luego clona el tuyo
git clone https://github.com/TU-CUENTA/proyecto.git
cd proyecto

# 2. Vincula el original como upstream
git remote add upstream https://github.com/original/proyecto.git
git remote -v

# 3. Trabaja en una rama
git checkout -b fix/enlace-roto
git commit -m "fix: corregir enlace roto en docs"
git push origin fix/enlace-roto

# 4. Mantente al día con upstream
git fetch upstream
git rebase upstream/main
BASH],
                            ['h', 'Etiqueta de la contribución'],
                            ['list', [
                                'Lee CONTRIBUTING.md antes de tocar nada',
                                'Busca issues marcados para empezar (good first issue)',
                                'Un cambio pequeño y bien probado por PR',
                                'Responde a los comentarios del mantenedor',
                                'Nunca hagas PRs gigantes sin avisar',
                            ]],
                            ['p', 'El flujo de fork+PR entrena exactamente lo que usarás en el trabajo: leer bases de código ajenas, respetar convenciones, escribir mensajes claros y perseverar en una revisión. La comunidad valora contribuciones de calidad, no cantidad.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Fork para trabajar sin permisos del original',
                                'upstream es el repo original; el tuyo, origin',
                                'Empieza por cambios pequeños y documentados',
                                'CONTRIBUTING.md define las reglas del proyecto',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Para qué sirve el fork en GitHub?', 'type' => 'single', 'answers' => [
                                    ['Crear una copia del repositorio en tu cuenta para trabajar sin permisos', true, 'El original (upstream) queda intacto y controlado.'],
                                    ['Borrar el repositorio original', false, 'El fork no borra nada.'],
                                    ['Fusionar dos repositorios', false, 'Eso es otra operación.'],
                                    ['Dar permisos de escritura', false, 'Justo lo contrario: trabajas sin ellos.'],
                                ]],
                                ['q' => '¿Qué representa el remoto upstream?', 'type' => 'multiple', 'answers' => [
                                    ['El repositorio original del proyecto', true, 'De él sacas las últimas versiones oficiales.'],
                                    ['La fuente de la que te actualizas', true, 'git fetch upstream te trae lo nuevo.'],
                                    ['Tu copia personal', false, 'Tu copia es origin.'],
                                    ['Un servicio de backup', false, 'No es un backup.'],
                                ]],
                                ['q' => '¿Qué buscamos con una primera contribución open source?', 'type' => 'single', 'answers' => [
                                    ['Un cambio pequeño, claro y bien documentado', true, 'Minimiza fricción y maximiza aprendizaje.'],
                                    ['Reescribir el proyecto entero', false, 'Un PR gigante será rechazado sin discusión.'],
                                    ['Añadir funciones sin avisar', false, 'Primero se discute en un issue.'],
                                    ['Copiar el código a tu repo privado', false, 'Eso es plagio, no contribución.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
