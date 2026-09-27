<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAnswer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class IdeModuleSeeder extends Seeder
{
    public function run(): void
    {
        $course = Course::where('slug', 'introduccion-programacion')->first();
        if (!$course) {
            $course = Course::first();
        }
        if (!$course) {
            return;
        }

        // Create or update Module 6
        $module = Module::updateOrCreate(
            [
                'course_id' => $course->id,
                'title' => 'Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)',
            ],
            [
                'description' => 'Domina las herramientas profesionales donde se escribe el software real: editores de código modernos, Visual Studio Code a fondo, linters, formateadores automáticos, la terminal integrada y el ecosistema de IDEs en la industria.',
                'order' => 6,
            ]
        );

        // Lesson 1: ¿Qué es un IDE vs un Editor de Código? Principios y Arquitectura
        $this->seedLesson1($module);

        // Lesson 2: Dominio de Visual Studio Code: Anatomía, Atajos Esenciales y Productividad Pro
        $this->seedLesson2($module);

        // Lesson 3: Linters, Formateadores Automáticos (Prettier/ESLint) y Buenas Prácticas
        $this->seedLesson3($module);

        // Lesson 4: La Terminal Integrada y Flujo de Trabajo en Línea de Comandos
        $this->seedLesson4($module);

        // Lesson 5: Ecosistema Profesional: JetBrains, Neovim, Jupyter y Cuándo Elegir Cada Uno
        $this->seedLesson5($module);

        // Lesson 6: Taller Práctico y Desafío: Depuración de Código y Resolución de Bugs
        $this->seedLesson6($module);
    }

    private function seedLesson1(Module $module): void
    {
        $lesson = Lesson::updateOrCreate(
            ['module_id' => $module->id, 'slug' => 'que-es-un-ide-vs-editor-de-codigo'],
            [
                'title' => '¿Qué es un IDE vs un Editor de Código? Principios y Arquitectura',
                'order' => 1,
                'type' => 'article',
                'duration_minutes' => 15,
                'is_preview' => true,
                'content' => [
                    'type' => 'doc',
                    'blocks' => [
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'El Taller del Programador: Más Allá del Bloc de Notas',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'Todo programa no es más que texto plano almacenado en archivos con extensiones específicas (.py, .js, .php, .cpp). En teoría, podrías programar en el Bloc de Notas de Windows o en TextEdit de Mac. Sin embargo, en la ingeniería de software moderna, la productividad y la calidad dependen críticamente de las herramientas que asisten al desarrollador en cada pulsación de tecla.',
                        ],
                        [
                            'type' => 'callout',
                            'tone' => 'info',
                            'title' => 'Principio Fundamental',
                            'text' => 'Un código fuente no es solo texto: es una estructura sintáctica rigurosa. Las herramientas modernas comprenden esa estructura y transforman la experiencia de programar mediante análisis estático en tiempo real.',
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'La Escala de Herramientas: De Editores Simples a IDEs Completos',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'En la industria distinguimos tres grandes categorías de entornos para escribir código:',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'Editor de Texto Plano (Notepad, TextEdit): No analiza sintaxis, no compila, no detecta errores. Inadecuado para desarrollo profesional.',
                                'Editor de Código Modular (VS Code, Sublime Text): Ultraligero, altamente extensible mediante plugins. Ofrece resaltado sintáctico, autocompletado inteligente y terminal.',
                                'Entorno de Desarrollo Integrado o IDE (JetBrains IntelliJ, PyCharm, Visual Studio Enterprise): Una suite completa "todo en uno" que integra compilador, depurador de memoria, analizador de dependencias, base de datos y herramientas de testing nativas.',
                            ],
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Los Componentes Esenciales de un Entorno Moderno',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => '¿Qué hace que un editor sea "inteligente"? Los entornos modernos integran estos pilares arquitectónicos:',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'LSP (Language Server Protocol): Estándar creado por Microsoft que separa el editor visual del motor que analiza el lenguaje. Permite que el mismo motor de Python o TypeScript funcione en VS Code, Neovim o Emacs.',
                                'IntelliSense y Autocompletado: Sugerencias contextuales de métodos, variables y tipos mientras escribes.',
                                'Analizador de Sintaxis y AST (Abstract Syntax Tree): Convierte tu texto en un árbol jerárquico para marcar errores en rojo antes de que ejecutes el programa.',
                                'Motor de Depuración (Debugger): Permite pausar la ejecución en una línea (breakpoint), examinar variables vivas en la memoria RAM y avanzar paso a paso.',
                                'Control de Versiones Integrado: Detección instantánea de cambios en Git con visualización de diffs línea por línea.',
                            ],
                        ],
                        [
                            'type' => 'code',
                            'language' => 'json',
                            'text' => "{\n  \"nombre_herramienta\": \"Visual Studio Code\",\n  \"tipo\": \"Editor de Código Extensible\",\n  \"arquitectura\": \"Electron + TypeScript + LSP\",\n  \"ventajas\": [\"Rápido\", \"Miles de extensiones\", \"Ecosistema masivo\", \"Gratuito\"]\n}",
                        ],
                    ],
                ],
            ]
        );

        $this->seedQuiz($lesson, 'Comprueba tus conocimientos sobre IDEs y Editores', [
            [
                'question' => '¿Cuál es la diferencia principal entre un editor de código modular y un IDE completo?',
                'answers' => [
                    ['text' => 'Un editor de código requiere instalar extensiones para armar su flujo de trabajo, mientras que un IDE incluye depurador, compilador y herramientas avanzadas listas para usar.', 'correct' => true, 'explanation' => '¡Exacto! VS Code es un editor ligero que se expande con plugins, mientras que PyCharm o IntelliJ son IDEs que traen todo configurado desde el primer segundo.'],
                    ['text' => 'Los editores de código solo sirven para HTML y los IDEs solo para C++.', 'correct' => false, 'explanation' => 'Tanto los editores como los IDEs soportan virtualmente cualquier lenguaje de programación.'],
                    ['text' => 'Los editores no pueden ejecutar código bajo ninguna circunstancia.', 'correct' => false, 'explanation' => 'A través de terminales integradas y tareas de ejecución, los editores ejecutan código sin problemas.'],
                ],
            ],
            [
                'question' => '¿Qué es el Language Server Protocol (LSP)?',
                'answers' => [
                    ['text' => 'Un protocolo que permite a cualquier editor comunicarse con un motor de lenguaje para ofrecer autocompletado, errores y refactorización.', 'correct' => true, 'explanation' => '¡Correcto! El LSP estandarizó la forma en que los editores hablan con los lenguajes, evitando reinventar la rueda para cada herramienta.'],
                    ['text' => 'Un servidor en la nube donde se sube el código para que lo ejecuten computadoras cuánticas.', 'correct' => false, 'explanation' => 'El LSP normalmente corre como un proceso local en tu máquina.'],
                    ['text' => 'Un tipo de cable de red para conectar programadores en red local.', 'correct' => false, 'explanation' => 'Es un protocolo de software JSON-RPC, no un componente de hardware.'],
                ],
            ],
        ]);
    }

    private function seedLesson2(Module $module): void
    {
        $lesson = Lesson::updateOrCreate(
            ['module_id' => $module->id, 'slug' => 'dominio-de-visual-studio-code-atajos-y-productividad'],
            [
                'title' => 'Dominio de Visual Studio Code: Anatomía, Atajos Esenciales y Productividad Pro',
                'order' => 2,
                'type' => 'article',
                'duration_minutes' => 20,
                'is_preview' => false,
                'content' => [
                    'type' => 'doc',
                    'blocks' => [
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'El Editor Más Popular del Mundo: Visual Studio Code',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'Creado por Microsoft y de código abierto (en su núcleo Code - OSS), VS Code se convirtió en el estándar indiscutible de la industria con más del 70% de cuota de mercado entre desarrolladores de todo el planeta. Su éxito radica en su equilibrio: se siente tan rápido como un editor de texto, pero cuenta con la potencia de un IDE.',
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Anatomía Visual de la Interfaz',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'Activity Bar (Barra de Actividad Izquierda): Accesos rápidos al Explorador de Archivos, Búsqueda Global, Git (Control de Código Fuente), Depurador y Tienda de Extensiones.',
                                'Side Bar (Barra Lateral): Muestra el árbol de carpetas de tu proyecto actual.',
                                'Editor Groups (Área de Edición): Permite dividir pantallas en 2, 3 o 4 columnas o filas para comparar código simultáneamente.',
                                'Panel Inferior (Terminal / Problemas / Output / Consola de Depuración): El centro neurálgico de ejecución.',
                                'Status Bar (Barra de Estado Inferior): Muestra la rama de Git actual, errores de sintaxis, codificación UTF-8 e indentación (espacios o tabs).',
                            ],
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Los Atajos de Teclado que Separan a Principiantes de Expertos',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'La velocidad de un desarrollador no se mide en palabras por minuto, sino en cuánto tiempo pasa con las manos en el teclado sin tocar el mouse. Grábate estos atajos en la memoria muscular:',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'Ctrl + Shift + P (Cmd+Shift+P en Mac): La Paleta de Comandos. Es el corazón de VS Code. Cualquier acción, configuración o comando se busca y ejecuta desde aquí.',
                                'Ctrl + P (Cmd+P): Quick Open. Permite saltar a cualquier archivo del proyecto escribiendo parte de su nombre en milisegundos.',
                                'Alt + Click: Multi-cursor manual. Escribe en varias líneas a la vez.',
                                'Ctrl + D (Cmd+D): Seleccionar la siguiente ocurrencia de la palabra seleccionada para renombrar en masa rápidamente.',
                                'Alt + Flecha Arriba / Abajo: Mueve la línea de código actual hacia arriba o abajo sin necesidad de cortar y pegar.',
                                'Shift + Alt + Flecha Abajo: Duplica la línea de código actual inmediatamente debajo.',
                                'Ctrl + / (Cmd+/): Comenta o descomenta instantáneamente la línea o bloque seleccionado.',
                                'Ctrl + ` (Cmd+`): Abre o cierra la terminal integrada al instante.',
                            ],
                        ],
                        [
                            'type' => 'callout',
                            'tone' => 'tip',
                            'title' => 'Configuración de Proyecto (.vscode)',
                            'text' => 'Puedes guardar las configuraciones de tu equipo en la carpeta oculta .vscode/settings.json en la raíz del proyecto para que todos compartan la misma indentación y formateo automáticamente.',
                        ],
                    ],
                ],
            ]
        );

        $this->seedQuiz($lesson, 'Quiz: Atajos y Dominio de VS Code', [
            [
                'question' => '¿Cuál es el atajo para abrir la Paleta de Comandos general en VS Code?',
                'answers' => [
                    ['text' => 'Ctrl + Shift + P (o Cmd + Shift + P en Mac)', 'correct' => true, 'explanation' => '¡Exacto! La Paleta de Comandos te permite acceder a todas las funciones del editor sin usar el ratón.'],
                    ['text' => 'Ctrl + Alt + Delete', 'correct' => false, 'explanation' => 'Ese es un atajo del sistema operativo para administrador de tareas.'],
                    ['text' => 'Ctrl + S', 'correct' => false, 'explanation' => 'Ctrl+S guarda el archivo actual.'],
                ],
            ],
            [
                'question' => '¿Qué hace la combinación de teclas Ctrl + D repetidamente sobre una variable?',
                'answers' => [
                    ['text' => 'Selecciona una a una las siguientes ocurrencias de esa misma variable para editarlas simultáneamente con multi-cursor.', 'correct' => true, 'explanation' => '¡Correcto! Es uno de los trucos más productivos para refactorizar nombres de variables en un archivo.'],
                    ['text' => 'Elimina la línea completa.', 'correct' => false, 'explanation' => 'Para eliminar la línea se usa Ctrl+Shift+K en VS Code.'],
                    ['text' => 'Descarga el proyecto desde GitHub.', 'correct' => false, 'explanation' => 'Ctrl+D no realiza operaciones de red.'],
                ],
            ],
        ]);
    }

    private function seedLesson3(Module $module): void
    {
        $lesson = Lesson::updateOrCreate(
            ['module_id' => $module->id, 'slug' => 'linters-formateadores-y-buenas-practicas'],
            [
                'title' => 'Linters, Formateadores Automáticos (Prettier/ESLint) y Buenas Prácticas',
                'order' => 3,
                'type' => 'article',
                'duration_minutes' => 15,
                'is_preview' => false,
                'content' => [
                    'type' => 'doc',
                    'blocks' => [
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Formateadores vs Linters: No Son lo Mismo',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'Uno de los errores más comunes de los programadores novatos es confundir un formateador de código con un linter. Ambos analizan tu código, pero resuelven problemas completamente distintos:',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'Formateador (ej. Prettier): Se ocupa EXCLUSIVAMENTE de la estética visual: espaciado, longitud máxima de línea, comillas dobles vs simples, punto y coma final, saltos de línea consistentes.',
                                'Linter (ej. ESLint, Ruff, PHP CS Fixer): Se ocupa de la CALIDAD del código y posibles bugs: variables declaradas pero nunca usadas, imports rotos, funciones con complejidad ciclomática excesiva o tipos incompatibles.',
                            ],
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Automatización con "Format on Save"',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'Nunca pierdas tiempo alineando llaves o indentando espacios manualmente. Con la configuración adecuada en tu editor, cada vez que presionas Ctrl+S (guardar), el código se auto-ordena con precisión milimétrica.',
                        ],
                        [
                            'type' => 'code',
                            'language' => 'json',
                            'text' => "// Configuración recomendada en settings.json\n{\n  \"editor.formatOnSave\": true,\n  \"editor.defaultFormatter\": \"esbenp.prettier-vscode\",\n  \"editor.codeActionsOnSave\": {\n    \"source.fixAll.eslint\": \"explicit\"\n  },\n  \"editor.tabSize\": 2\n}",
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Top Extensiones Esenciales que Todo Desarrollador Debe Instalar',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'Prettier - Code Formatter: El estándar de oro para formateo automático en JS, TS, HTML, CSS, JSON.',
                                'Error Lens: Resalta los errores de compilación y linter directamente en la línea donde ocurren, sin tener que posar el mouse encima.',
                                'GitLens: Muestra quién escribió cada línea de código, cuándo y en qué commit (git blame interactivo).',
                                'Path Intellisense: Autocompleta nombres de carpetas y archivos cuando haces imports.',
                                'Auto Rename Tag: Si cambias una etiqueta HTML de apertura (ej. <div -> <section), renombra la de cierre automáticamente.',
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->seedQuiz($lesson, 'Quiz: Formateo y Linters', [
            [
                'question' => '¿Cuál de las siguientes afirmaciones describe la función principal de Prettier?',
                'answers' => [
                    ['text' => 'Es un formateador opinado que garantiza un estilo estético y consistente en todo el archivo al guardar.', 'correct' => true, 'explanation' => '¡Exacto! Prettier no cambia la lógica ni busca errores de ejecución, sino que formatea la apariencia del código.'],
                    ['text' => 'Es un compilador que traduce código Python a binario de máquina.', 'correct' => false, 'explanation' => 'Prettier no es un compilador.'],
                    ['text' => 'Es una base de datos distribuida para guardar contraseñas.', 'correct' => false, 'explanation' => 'Prettier es una herramienta de desarrollo estético de código.'],
                ],
            ],
            [
                'question' => '¿Qué hace un Linter como ESLint o Ruff que un formateador no hace?',
                'answers' => [
                    ['text' => 'Analiza la semántica y estructura lógica del código para detectar variables no usadas, bugs potenciales y violaciones de estándares.', 'correct' => true, 'explanation' => '¡Correcto! Los linters son analizadores estáticos de calidad y corrección lógica.'],
                    ['text' => 'Pinta el fondo del editor de color rosa.', 'correct' => false, 'explanation' => 'Eso sería un tema de color (theme), no un linter.'],
                    ['text' => 'Reinicia la computadora automáticamente cuando hay un error.', 'correct' => false, 'explanation' => 'Los linters marcan advertencias en el editor sin reiniciar tu equipo.'],
                ],
            ],
        ]);
    }

    private function seedLesson4(Module $module): void
    {
        $lesson = Lesson::updateOrCreate(
            ['module_id' => $module->id, 'slug' => 'terminal-integrada-y-flujo-de-comandos'],
            [
                'title' => 'La Terminal Integrada y Flujo de Trabajo en Línea de Comandos',
                'order' => 4,
                'type' => 'article',
                'duration_minutes' => 15,
                'is_preview' => false,
                'content' => [
                    'type' => 'doc',
                    'blocks' => [
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Por Qué el Programador Profesional Vive en la Terminal',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'En el cine muestran a los hackers escribiendo en pantallas negras con letras verdes. Aunque en la realidad no hackeamos a la NASA en 10 segundos, la terminal (CLI o Command Line Interface) es la herramienta más veloz y poderosa del desarrollador de software. Permite automatizar tareas, levantar servidores, correr migraciones y desplegar a la nube.',
                        ],
                        [
                            'type' => 'callout',
                            'tone' => 'tip',
                            'title' => 'Terminal Integrada en el Editor',
                            'text' => 'En vez de alternar ventanas entre tu editor y la consola de tu sistema operativo, presiona Ctrl + ` (backtick) para abrir la terminal integrada en la carpeta exacta de tu proyecto.',
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Comandos Esenciales de Navegación y Archivos',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'pwd (Print Working Directory): Muestra en qué ruta del disco duro te encuentras parado.',
                                'ls (o dir en Windows): Lista todos los archivos y carpetas del directorio actual. Usa "ls -la" para ver archivos ocultos.',
                                'cd <carpeta> (Change Directory): Entra a una carpeta. Usa "cd .." para retroceder un nivel.',
                                'mkdir <nombre> (Make Directory): Crea una carpeta nueva.',
                                'touch <archivo> (o New-Item en PowerShell): Crea un archivo nuevo vacío.',
                                'rm <archivo> (Remove): Elimina un archivo. ¡Cuidado: en terminal no hay papelera de reciclaje!',
                            ],
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Ejecutando tus Programas desde la Terminal',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'Aprender cómo invocar los intérpretes y compiladores directamente es fundamental para no depender de botones mágicos:',
                        ],
                        [
                            'type' => 'code',
                            'language' => 'bash',
                            'text' => "# Ejecutar un script de Python:\npython3 main.py\n\n# Ejecutar un script de Node.js / JavaScript:\nnode app.js\n\n# Ejecutar un script con Bun (TypeScript directo):\nbun run index.ts\n\n# Compilar y ejecutar C++:\ng++ -O2 main.cpp -o programa\n./programa",
                        ],
                    ],
                ],
            ]
        );

        $this->seedQuiz($lesson, 'Quiz: Terminal y Comandos', [
            [
                'question' => '¿Qué comando de terminal te permite ver la lista de archivos dentro de tu carpeta actual en sistemas Unix / Linux / Mac?',
                'answers' => [
                    ['text' => 'ls (o ls -la para ver permisos y archivos ocultos)', 'correct' => true, 'explanation' => '¡Correcto! "ls" viene de "list" y es uno de los comandos más usados en la informática.'],
                    ['text' => 'cd list', 'correct' => false, 'explanation' => '"cd" es para cambiar de carpeta (change directory).'],
                    ['text' => 'show my files', 'correct' => false, 'explanation' => 'Ese comando no existe en la terminal estándar.'],
                ],
            ],
            [
                'question' => '¿Qué significa el comando "cd .." en la consola?',
                'answers' => [
                    ['text' => 'Retroceder al directorio padre (un nivel hacia arriba).', 'correct' => true, 'explanation' => '¡Exacto! Los dos puntos ".." representan el directorio contenedor padre en todos los sistemas operativos.'],
                    ['text' => 'Borrar el disco duro.', 'correct' => false, 'explanation' => '¡Para nada! No borra nada.'],
                    ['text' => 'Cerrar la ventana de la terminal.', 'correct' => false, 'explanation' => 'Para cerrar se usa "exit" o Ctrl+D.'],
                ],
            ],
        ]);
    }

    private function seedLesson5(Module $module): void
    {
        $lesson = Lesson::updateOrCreate(
            ['module_id' => $module->id, 'slug' => 'ecosistema-profesional-jetbrains-neovim-jupyter'],
            [
                'title' => 'Ecosistema Profesional: JetBrains, Neovim, Jupyter y Cuándo Elegir Cada Uno',
                'order' => 5,
                'type' => 'article',
                'duration_minutes' => 15,
                'is_preview' => false,
                'content' => [
                    'type' => 'doc',
                    'blocks' => [
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'El Panorama Profesional: No Existe la Herramienta Única',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'Aunque VS Code domina en la web y proyectos generales, la industria utiliza herramientas altamente especializadas para diferentes perfiles de ingeniería de software:',
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => '1. La Suite de JetBrains (PyCharm, IntelliJ IDEA, WebStorm, PhpStorm)',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'JetBrains crea los IDEs más potentes del planeta. A diferencia de editores modulares, sus IDEs indexan todo el proyecto en segundo plano y construyen un mapa semántico completo de clases, tipos y llamadas en memoria.',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'IntelliJ IDEA: El estándar supremo en el desarrollo Java y Kotlin empresarial.',
                                'PyCharm: El IDE más avanzado para Python profesional, con inspección profunda de datos y análisis de Django/FastAPI.',
                                'PhpStorm: El favorito indiscutible de los ingenieros backend que trabajan con Laravel y Symfony.',
                                'Cuándo usarlos: En proyectos grandes donde la refactorización segura y el análisis de tipos son críticos, y tu equipo tiene al menos 16 GB de RAM.',
                            ],
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => '2. Neovim y Vim: La Velocidad Modal de la Terminal',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'Neovim no se usa con ratón. Opera mediante "modos" (Normal, Insertar, Visual, Comando). Una vez dominado, permite editar código a la velocidad del pensamiento. Es ultraligero (pesa menos de 30 MB) y corre directamente dentro de servidores remotos por SSH.',
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => '3. Jupyter Notebooks y Google Colab: Ciencia de Datos e IA',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => 'En Inteligencia Artificial y Machine Learning, el código no siempre se ejecuta como un script continuo de inicio a fin. Los Notebooks permiten dividir el código en "celdas" ejecutables independientes, mezclando código Python, tablas interactivas y gráficos visuales.',
                        ],
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Matriz de Decisión para Tu Carrera',
                        ],
                        [
                            'type' => 'list',
                            'items' => [
                                'Principiante / Full-Stack / Web: VS Code (Fácil de configurar, liviano, gratuito, universal).',
                                'Backend Empresarial (Java, Laravel, C#): JetBrains IntelliJ / PhpStorm / Visual Studio.',
                                'Data Science / Machine Learning: Jupyter Notebook + VS Code.',
                                'DevOps / SysAdmin / Entornos Remotos: Neovim / Vim.',
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->seedQuiz($lesson, 'Quiz: Ecosistema de IDEs', [
            [
                'question' => '¿Para qué caso de uso son especialmente populares los Jupyter Notebooks?',
                'answers' => [
                    ['text' => 'Ciencia de datos, análisis exploratorio y machine learning, gracias a la ejecución interactiva celda por celda.', 'correct' => true, 'explanation' => '¡Exacto! Los notebooks permiten experimentar y graficar datos paso a paso sin reiniciar todo el script.'],
                    ['text' => 'Diseño de interfaces gráficas para videojuegos 3D.', 'correct' => false, 'explanation' => 'Los notebooks no están pensados para motores gráficos 3D.'],
                    ['text' => 'Crear sistemas operativos desde cero.', 'correct' => false, 'explanation' => 'El desarrollo de bajo nivel de kernels se hace principalmente en C/Rust en IDEs o editores como Neovim.'],
                ],
            ],
            [
                'question' => '¿Por qué un ingeniero DevOps utiliza habitualmente Neovim o Vim?',
                'answers' => [
                    ['text' => 'Porque funciona en modo texto nativo dentro de cualquier servidor Linux remoto conectado por SSH sin necesidad de interfaz gráfica.', 'correct' => true, 'explanation' => '¡Correcto! En servidores de producción no hay pantallas con ventanas: todo se gestiona vía SSH en la terminal.'],
                    ['text' => 'Porque es obligatorio por ley en todos los países.', 'correct' => false, 'explanation' => 'Es una elección técnica de conveniencia y velocidad.'],
                    ['text' => 'Porque solo funciona con pantallas táctiles.', 'correct' => false, 'explanation' => 'Neovim es 100% de teclado y terminal.'],
                ],
            ],
        ]);
    }

    private function seedLesson6(Module $module): void
    {
        Lesson::updateOrCreate(
            ['module_id' => $module->id, 'slug' => 'taller-practico-depuracion-y-resolucion-de-bugs'],
            [
                'title' => 'Taller Práctico y Desafío: Depuración de Código y Resolución de Bugs',
                'order' => 6,
                'type' => 'code_challenge',
                'duration_minutes' => 25,
                'is_preview' => false,
                'language' => 'python',
                'starter_code' => '# DESAFÍO: Depura la función de cálculo de estadísticas
# El siguiente código tiene 2 bugs lógicos que debes resolver:
# 1. Cuando la lista de números está vacía, debe retornar {"promedio": 0.0, "maximo": 0, "minimo": 0}
#    en lugar de fallar por división entre cero.
# 2. El promedio calculado no está redondeando a 2 decimales y a veces calcula mal la suma.
# 3. Corre el código en el Sandbox y valida todos los casos de prueba con el runner.

def calcular_estadisticas(numeros: list[int]) -> dict:
    # Corrige los bugs aquí:
    if not numeros:
        return {"promedio": 0.0, "maximo": 0, "minimo": 0}
    
    total = sum(numeros)
    promedio = round(total / len(numeros), 2)
    maximo = max(numeros)
    minimo = min(numeros)
    
    return {
        "promedio": promedio,
        "maximo": maximo,
        "minimo": minimo
    }

# Prueba local:
print(calcular_estadisticas([10, 20, 30, 40, 50]))
print(calcular_estadisticas([]))
',
                'solution' => 'def calcular_estadisticas(numeros: list[int]) -> dict:
    if not numeros:
        return {"promedio": 0.0, "maximo": 0, "minimo": 0}
    return {
        "promedio": round(sum(numeros) / len(numeros), 2),
        "maximo": max(numeros),
        "minimo": min(numeros)
    }
',
                'test_cases' => [
                    [
                        'input' => '',
                        'expected' => "{'promedio': 30.0, 'maximo': 50, 'minimo': 10}\n{'promedio': 0.0, 'maximo': 0, 'minimo': 0}",
                    ],
                ],
                'hint' => 'Revisa cómo se comporta la función cuando la lista está vacía con `if not numeros:` y utiliza `round(..., 2)` para redondear a 2 decimales.',
                'content' => [
                    'type' => 'doc',
                    'blocks' => [
                        [
                            'type' => 'heading',
                            'level' => 2,
                            'text' => 'Taller de Depuración Interactiva en el Entorno Simulado',
                        ],
                        [
                            'type' => 'paragraph',
                            'text' => '¡A programar se aprende programando! En este desafío pondrás a prueba tus habilidades de depuración. Utiliza el editor simulado a continuación para escribir, ejecutar y verificar tu solución en tiempo real con el Sandbox de SysEngAcademy.',
                        ],
                        [
                            'type' => 'callout',
                            'tone' => 'tip',
                            'title' => 'Herramientas a tu Disposición',
                            'text' => 'Puedes ejecutar el código cuantas veces quieras con el botón ▶ "Ejecutar Código", ver la salida exacta en la terminal integrada y consultar a Byte IA para recibir orientación socrática si te quedas atascado.',
                        ],
                    ],
                ],
            ]
        );
    }

    private function seedQuiz(Lesson $lesson, string $title, array $questions): void
    {
        $quiz = Quiz::updateOrCreate(
            ['lesson_id' => $lesson->id],
            ['title' => $title]
        );

        // Delete old questions if updating
        $quiz->questions()->delete();

        foreach ($questions as $qIndex => $qData) {
            $question = QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question' => $qData['question'],
                'type' => 'single',
                'order' => $qIndex + 1,
            ]);

            foreach ($qData['answers'] as $aData) {
                QuizAnswer::create([
                    'question_id' => $question->id,
                    'answer_text' => $aData['text'],
                    'is_correct' => $aData['correct'],
                    'explanation' => $aData['explanation'] ?? null,
                ]);
            }
        }
    }
}
