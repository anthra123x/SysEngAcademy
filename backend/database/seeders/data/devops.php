<?php

/*
 * Cursos devops: Linux, Docker y CI/CD.
 */

return [
    // =====================================================================
    // 1. Linux y línea de comandos
    // =====================================================================
    [
        'slug' => 'linux-y-linea-de-comandos',
        'title' => 'Linux y línea de comandos',
        'description' => 'Domina la terminal como tu herramienta principal: archivos, permisos, procesos, scripts y conectividad para operar cualquier servidor.',
        'category' => 'devops',
        'difficulty' => 'intermediate',
        'duration_hours' => 14,
        'is_free' => true,
        'learning_path' => 'devops',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'La terminal',
                'description' => 'Fundamentos sólidos para moverte con velocidad y seguridad en el shell.',
                'lessons' => [
                    [
                        'slug' => 'comandos-esenciales-linux',
                        'title' => 'Comandos esenciales de Linux',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Comandos esenciales de Linux'],
                            ['p', 'La terminal es el taller del desarrollador y del administrador de sistemas. A diferencia de una interfaz gráfica, cada comando es una pieza pequeña y combinable: mover archivos, explorar directorios o inspeccionar procesos se convierte en texto repetible y documentable.'],
                            ['p', 'Empieza con la navegación: pwd muestra dónde estás, ls lista el contenido, cd cambia de directorio y touch o mkdir crean archivos o carpetas. Para ver contenido, cat imprime archivos pequeños y less permite paginar archivos grandes sin cargarlos completos.'],
                            ['code', 'bash', <<<'BASH'
# Navegación y exploración
pwd                 # ruta del directorio actual
ls -la              # lista con permisos y archivos ocultos
cd ~/proyecto       # cambia al directorio proyecto
mkdir -p src/utils  # crea carpetas anidadas
touch README.md     # crea un archivo vacío

# Contenido de archivos
cat config.php      # imprime el archivo completo
less error.log      # paginador: q para salir, / para buscar
head -20 access.log # primeras 20 líneas
tail -f app.log     # sigue el final del log en vivo
BASH],
                            ['h', 'Comandos que se combinan'],
                            ['list', [
                                'pwd, ls, cd para navegar',
                                'mkdir, touch, cp, mv, rm para gestionar archivos',
                                'cat, less, head, tail para leer contenido',
                                'grep filtra, wc cuenta y sort ordena',
                            ]],
                            ['p', 'La filosofía Unix dice que cada comando hace una cosa bien y se comunica con los demás por texto. Por eso grep, wc, sort y awk se encadenan con pipes (|) para resolver consultas complejas sobre logs o listados sin salir de la terminal.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La terminal es repetible y documentable',
                                'ls -la revela permisos y ocultos',
                                'less y tail -f son ideales para logs',
                                'Los pipes combinan comandos pequeños en soluciones potentes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué comando muestra la ruta completa del directorio actual?', 'type' => 'single', 'answers' => [
                                    ['pwd', true, 'Print Working Directory imprime la ruta absoluta actual.'],
                                    ['ls', false, 'ls lista el contenido, no la ruta.'],
                                    ['cd', false, 'cd cambia de directorio.'],
                                    ['cat', false, 'cat imprime el contenido de archivos.'],
                                ]],
                                ['q' => '¿Por qué es útil ls -la en lugar de ls?', 'type' => 'single', 'answers' => [
                                    ['Muestra permisos, tamaño, fecha y archivos ocultos', true, 'El formato largo (-l) y todos (-a) dan el detalle completo.'],
                                    ['Elimina archivos innecesarios', false, 'ls nunca borra nada.'],
                                    ['Es más rápido que ls', false, 'La velocidad no es la razón.'],
                                    ['Ordena por tamaño', false, 'ls -la no ordena por tamaño por defecto.'],
                                ]],
                                ['q' => '¿Qué logras encadenando comandos con el pipe (|)?', 'type' => 'multiple', 'answers' => [
                                    ['Pasar la salida de un comando como entrada del siguiente', true, 'El pipe conecta stdout con stdin.'],
                                    ['Construir consultas complejas sin salir de la terminal', true, 'grep, sort y awk se combinan para filtrar y transformar.'],
                                    ['Borrar más archivos de una vez', false, 'El pipe no borra archivos.'],
                                    ['Abrir un editor gráfico', false, 'Sigue siendo terminal pura.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'permisos-y-procesos',
                        'title' => 'Permisos, usuarios y procesos',
                        'type' => 'article',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Permisos, usuarios y procesos'],
                            ['p', 'Linux distingue usuarios y grupos, y la seguridad se apoya en permisos por archivo. Cada archivo tiene tres tríos: dueño (u), grupo (g) y otros (o), con lectura (r=4), escritura (w=2) y ejecución (x=1). El número es la suma: 755 significa dueño con todo y el resto solo lectura y ejecución.'],
                            ['p', 'Cambiar permisos se hace con chmod y el dueño o grupo con chown. Un ejecutable necesita el bit x; un servicio web, normalmente, debe leer sin escribir. Menos privilegios es siempre mejor: el principio de mínimo privilegio evita que un error de un proceso se convierta en un problema de todo el sistema.'],
                            ['code', 'bash', <<<'BASH'
# Permisos
chmod 755 deploy.sh     # rwxr-xr-x: dueño todo, resto lectura+ejec
chmod 600 clave.pem     # rw-------: solo el dueño lee/escribe
chown www-data:www app/ # cambia dueño y grupo

# Procesos
ps aux                  # lista procesos con usuario y CPU
top                     # monitor en vivo (htop lo mejora)
kill -9 1234            # mata el proceso 1234 a la fuerza
systemctl status nginx  # estado de un servicio
BASH],
                            ['h', 'Dónde se aplican'],
                            ['list', [
                                'pwd, ls, cd para navegar',
                                'mkdir, touch, cp, mv, rm para gestionar archivos',
                                'cat, less, head, tail para leer contenido',
                                'grep filtra, wc cuenta y sort ordena',
                            ]],
                            ['p', 'Los procesos también tienen dueño y prioridad. ps aux muestra quién ejecuta cada proceso; si un servicio consume demasiada CPU, puedes encontrar el culpable y reiniciarlo o matarlo. systemctl integra el arranque con systemd, el gestor estándar de servicios de las distros modernas.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Permisos rwx en tríos: dueño, grupo y otros',
                                'chmod con números (755, 600) es lo más preciso',
                                'Menos privilegios reduce el impacto de errores',
                                'ps, top y systemctl son tu panel de procesos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué significa el permiso 644 sobre un archivo?', 'type' => 'single', 'answers' => [
                                    ['El dueño lee y escribe; el grupo y otros solo leen', true, '6=rw para el dueño y 4=r para el resto.'],
                                    ['Todos pueden ejecutar el archivo', false, 'No hay bit de ejecución en 644.'],
                                    ['Solo el dueño puede leer', false, 'El grupo y otros también leen.'],
                                    ['Nadie puede escribir ni leer', false, 'Eso sería 000.'],
                                ]],
                                ['q' => '¿Por qué se recomienda ejecutar servicios con pocos permisos?', 'type' => 'single', 'answers' => [
                                    ['Por el principio de mínimo privilegio: un fallo afecta menos', true, 'Si el proceso solo lee lo que necesita, un ataque o error tiene impacto acotado.'],
                                    ['Porque Linux no permite muchos permisos', false, 'Linux permite todo; la recomendación es práctica.'],
                                    ['Para que el disco se llene menos', false, 'No tiene relación con el espacio.'],
                                    ['Porque acelera el arranque', false, 'La velocidad no depende de los permisos.'],
                                ]],
                                ['q' => '¿Qué herramienta usas para ver qué proceso consume más CPU en vivo?', 'type' => 'multiple', 'answers' => [
                                    ['top', true, 'Actualiza en vivo el uso de CPU y memoria.'],
                                    ['htop', true, 'Versión mejorada e interactiva de top.'],
                                    ['cat', false, 'cat imprime archivos, no procesos.'],
                                    ['touch', false, 'touch crea archivos vacíos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'gestion-de-archivos-y-pipes',
                        'title' => 'Gestión de archivos, pipes y redirección',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Gestión de archivos, pipes y redirección'],
                            ['p', 'La terminal brilla al tratar archivos y flujos de texto. Mover, copiar, renombrar y buscar son operaciones de un solo comando, y la redirección con > y >> guarda la salida en archivos, mientras los pipes (|) conectan la salida de un comando con la entrada del siguiente.'],
                            ['p', 'Esta composición permite responder preguntas sobre los datos sin abrirlos: contar líneas de un log, filtrar errores, quedarse con las diez IPs más repetidas o montar un reporte con una sola línea. El secreto es pensar en flujos: texto entra, texto sale, texto se transforma.'],
                            ['code', 'bash', <<<'BASH'
# Redirección
ls -la > salida.txt      # guarda la salida (sobrescribe)
echo "nueva" >> log.txt  # añade al final sin borrar
comando 2> errores.txt   # redirige solo stderr

# Pipes en acción
grep "ERROR" app.log | wc -l          # cuántos errores hay
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
# las 10 IPs más frecuentes en un log de acceso
BASH],
                            ['h', 'Combinaciones clásicas'],
                            ['list', [
                                'grep filtra líneas por patrón',
                                'wc -l cuenta líneas',
                                'sort ordena y uniq -c agrupa contando',
                                'awk extrae columnas con $1, $2...',
                                'head y tail recortan el flujo',
                            ]],
                            ['p', 'En una operación de despliegue típica, verás estas piezas encadenadas: verificar que el build existe, filtrar el log del servicio, contar los errores y guardar un resumen. Dominar el flujo de texto es lo que separa a quien usa la terminal de quien la sufre.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                '> sobrescribe, >> añade y 2> captura errores',
                                'Los pipes encadenan comandos sin archivos intermedios',
                                'grep + sort + uniq + head resuelven análisis de logs',
                                'awk extrae columnas y wc cuenta líneas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué diferencia hay entre > y >> en redirección?', 'type' => 'single', 'answers' => [
                                    ['> sobrescribe y >> añade al final', true, 'Doble mayor que significa append, no reemplazo.'],
                                    ['>> sobrescribe y > añade', false, 'Es al revés.'],
                                    ['Ambos sobrescriben', false, '>> conserva lo existente.'],
                                    ['>> redirige errores', false, 'Los errores van con 2>.'],
                                ]],
                                ['q' => '¿Qué hace el comando cat access.log | awk "{print \$1}" | sort | uniq -c | sort -rn | head -10?', 'type' => 'multiple', 'answers' => [
                                    ['Extrae la primera columna de cada línea', true, 'awk imprime la columna $1.'],
                                    ['Agrupa y cuenta valores repetidos', true, 'uniq -c cuenta ocurrencias consecutivas ya ordenadas.'],
                                    ['Ordena de mayor a menor frecuencia', true, 'sort -rn es numérico inverso.'],
                                    ['Reemplaza el contenido del log', false, 'El comando solo lee; no modifica el archivo.'],
                                ]],
                                ['q' => '¿Cómo contarías cuántas líneas de error hay en un log?', 'type' => 'single', 'answers' => [
                                    ['grep "ERROR" app.log | wc -l', true, 'Filtra las líneas y las cuenta.'],
                                    ['cat app.log > errores.txt', false, 'Solo guarda el log completo.'],
                                    ['touch errores.txt', false, 'Crea un archivo vacío.'],
                                    ['ls -la app.log', false, 'Muestra metadatos, no contenido.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Automatización y red',
                'description' => 'Bash, scripts y conectividad para operar servidores con confianza.',
                'lessons' => [
                    [
                        'slug' => 'scripts-bash-y-automatizacion',
                        'title' => 'Scripts en Bash y automatización',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Scripts en Bash y automatización'],
                            ['p', 'Un script Bash es una secuencia de comandos guardada en un archivo con shebang (#!/bin/bash) que se puede ejecutar una y otra vez. Automatizar tareas repetitivas —subir una release, limpiar temporales, hacer backup— reduce errores humanos y documenta el proceso.'],
                            ['p', 'Las variables guardan valores, los condicionales deciden y los bucles repiten. La clave es que el script falle rápido: set -e detiene la ejecución ante el primer error y set -u avisa si usas una variable sin definir.'],
                            ['code', 'bash', <<<'BASH'
#!/bin/bash
set -euo pipefail   # falla ante errores y variables vacías

APP="mi-api"
FECHA=$(date +%Y%m%d)

if [ ! -d "dist" ]; then
    echo "El build no existe. Compilando..."
    npm run build
fi

tar -czf "backup-$FECHA.tar.gz" dist/
echo "Backup completado: backup-$FECHA.tar.gz"

for archivo in *.log; do
    [ "$archivo" = "*.log" ] && continue
    gzip "$archivo"
done
BASH],
                            ['h', 'Buenas prácticas de scripts'],
                            ['list', [
                                'Empieza con #!/bin/bash y set -euo pipefail',
                                'Usa variables descriptivas y ${VAR} explícito',
                                'Comprueba condiciones antes de acciones destructivas',
                                'Muestra mensajes claros de progreso y error',
                                'Haz pruebas en un entorno seguro antes de producción',
                            ]],
                            ['p', 'La automatización no termina en el script: el cron del sistema (o systemd timers) lo ejecuta en horarios fijos, y los pipelines de CI/CD lo disparan en cada cambio. Un script bien hecho es la unidad mínima de infraestructura como código.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El shebang y los permisos de ejecución hacen correr un script',
                                'set -euo pipefail endurece el script',
                                'Condicionales y bucles permiten lógica real',
                                'cron o CI/CD ejecutan los scripts sin intervención',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué efecto tiene set -e en un script Bash?', 'type' => 'single', 'answers' => [
                                    ['Detiene el script ante el primer comando que falla', true, 'Evita continuar con un estado inconsistente.'],
                                    ['Acelera todos los comandos', false, 'No modifica el rendimiento.'],
                                    ['Repite el último comando', false, 'Nada que ver con repetición.'],
                                    ['Silencia los errores', false, 'Al contrario: los hace visibles al abortar.'],
                                ]],
                                ['q' => '¿Para qué sirve el shebang #!/bin/bash en la primera línea?', 'type' => 'single', 'answers' => [
                                    ['Indica qué intérprete ejecutará el script', true, 'El sistema usa esa ruta para lanzarlo.'],
                                    ['Añade permisos de ejecución', false, 'Los permisos se dan con chmod.'],
                                    ['Comenta el archivo', false, 'Es una cabecera de intérprete, no un comentario.'],
                                    ['Cifra el script', false, 'No cifra nada.'],
                                ]],
                                ['q' => '¿Qué puede disparar un script de automatización?', 'type' => 'multiple', 'answers' => [
                                    ['Un cron o systemd timer', true, 'Ejecución programada en el servidor.'],
                                    ['Un pipeline de CI/CD', true, 'Ejecución en cada push o release.'],
                                    ['Una variable no definida', false, 'set -u hace que eso aborte, no que dispare nada.'],
                                    ['Un comando que falla', false, 'Con set -e un fallo detiene, no lanza.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'redes-y-conectividad-linux',
                        'title' => 'Redes y conectividad en Linux',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Redes y conectividad en Linux'],
                            ['p', 'Todo desarrollo termina en una red: tu máquina, un contenedor o un servidor se comunican por IP y puertos. Saber diagnosticar conectividad en Linux es imprescindible: si el frontend no llega al backend, la respuesta suele estar en ping, ss, curl o los logs del firewall.'],
                            ['p', 'La familia de herramientas incluye ip para configurar interfaces, ss para ver puertos en escucha, curl para probar HTTP y ping o traceroute para medir el camino de red. Los puertos 80 (HTTP) y 443 (HTTPS) son los estándar para servicios web.'],
                            ['code', 'bash', <<<'BASH'
# Diagnóstico
ping -c 4 api.ejemplo.com   # ¿responde el host?
curl -I https://api.ejemplo.com  # cabeceras HTTP
ss -tlnp                   # puertos en escucha y procesos
ip addr                   # interfaces y direcciones IP

# Firewall
sudo ufw status
sudo ufw allow 443/tcp    # permite HTTPS
BASH],
                            ['h', 'Conceptos que necesitas'],
                            ['list', [
                                'IP: dirección de la máquina en la red',
                                'Puerto: puerta lógica de un servicio',
                                'DNS: traduce nombres a direcciones IP',
                                'Firewall: filtro de tráfico entrante y saliente',
                                'Proxy inverso: distribuye y protege servicios',
                            ]],
                            ['p', 'Un flujo típico de diagnóstico: curl -I contra el dominio para ver si responde, ss -tlnp en el servidor para confirmar que el servicio escucha, y ufw status para descartar que el firewall bloquee. Con esas tres piezas resuelves la mayoría de problemas de conectividad.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'IP + puerto localizan un servicio en la red',
                                'curl -I prueba el servicio HTTP sin abrir navegador',
                                'ss -tlnp muestra qué proceso escucha en qué puerto',
                                'El firewall filtra y suele ser el culpable silencioso',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué comando muestra qué puertos están en escucha y qué proceso los usa?', 'type' => 'single', 'answers' => [
                                    ['ss -tlnp', true, 'Socket statistics con opción de procesos.'],
                                    ['ping', false, 'ping solo mide latencia a un host.'],
                                    ['cat', false, 'cat no toca la red.'],
                                    ['chmod', false, 'chmod gestiona permisos.'],
                                ]],
                                ['q' => 'Acabas de abrir el puerto 443 en el firewall. ¿Qué servicio suele ir ahí?', 'type' => 'single', 'answers' => [
                                    ['HTTPS', true, 'El puerto 443 es el estándar de HTTPS.'],
                                    ['Base de datos MySQL', false, 'MySQL usa el 3306.'],
                                    ['SSH', false, 'SSH usa el 22.'],
                                    ['SMTP', false, 'SMTP usa el 25.'],
                                ]],
                                ['q' => '¿Qué utilidades ayudan a diagnosticar que una API no responde desde tu máquina?', 'type' => 'multiple', 'answers' => [
                                    ['curl -I', true, 'Prueba directamente la respuesta HTTP.'],
                                    ['ping', true, 'Verifica si el host es alcanzable en la red.'],
                                    ['ss -tlnp', true, 'En el servidor confirma que el servicio escucha.'],
                                    ['touch index.html', false, 'Crear archivos no diagnostica red.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'entorno-de-desarrollo-linux',
                        'title' => 'El terminal como entorno de desarrollo',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'El terminal como entorno de desarrollo'],
                            ['p', 'Tu productividad como desarrollador crece cuando el terminal es una extensión natural: un prompt informativo, aliases para lo repetitivo y un gestor de versiones para Node, PHP o Python convierten cada proyecto en algo reproducible en cualquier máquina.'],
                            ['p', 'Los dotfiles (archivos que empiezan por punto en tu home) guardan tu configuración: .bashrc o .zshrc cargan aliases, funciones y variables. Versionarlos en Git te permite reproducir tu entorno en minutos.'],
                            ['code', 'bash', <<<'BASH'
# .bashrc — aliases útiles
alias ll='ls -lah'
alias gs='git status'
alias gc='git commit -m'
alias art='php artisan'

# Gestión de versiones
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22

# Prompt informativo
export PS1='\u@\h:\w\n\$ '
BASH],
                            ['h', 'Qué configura un buen entorno'],
                            ['list', [
                                'Aliases para comandos repetitivos',
                                'Gestor de versiones por lenguaje (nvm, pyenv, phpenv)',
                                'Prompt con usuario, host y ruta',
                                'Dotfiles versionados en Git',
                                'Editores que se lanzan desde la terminal (code, vim, nano)',
                            ]],
                            ['p', 'El objetivo no es abandonar tu editor, sino que el terminal sea el punto de entrada: abrir el proyecto, instalar dependencias, correr tests y desplegar sin cambiar de contexto. Cada minuto que ahorras en configuración es tiempo real de desarrollo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Aliases y funciones reducen fricción diaria',
                                'Los gestores de versiones evitan conflictos entre proyectos',
                                'Versionar dotfiles hace tu entorno reproducible',
                                'El terminal es la puerta de entrada a todo el flujo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué archivo suele cargar tus aliases si usas Bash?', 'type' => 'single', 'answers' => [
                                    ['.bashrc', true, 'Se ejecuta en cada shell interactiva.'],
                                    ['index.html', false, 'Eso es una página web.'],
                                    ['Dockerfile', false, 'Define la imagen Docker, no tu shell.'],
                                    ['package.json', false, 'Describe dependencias de Node, no tu shell.'],
                                ]],
                                ['q' => '¿Para qué sirve un gestor de versiones como nvm?', 'type' => 'single', 'answers' => [
                                    ['Instalar y alternar entre versiones de Node por proyecto', true, 'Cada proyecto puede usar su versión sin conflictos.'],
                                    ['Compilar el kernel de Linux', false, 'Está pensado para Node.'],
                                    ['Crear contenedores Docker', false, 'Para eso está Docker.'],
                                    ['Gestionar el firewall', false, 'El firewall se gestiona con ufw o nftables.'],
                                ]],
                                ['q' => '¿Qué ventaja tiene versionar tus dotfiles en Git?', 'type' => 'multiple', 'answers' => [
                                    ['Reconstruir el entorno en otra máquina en minutos', true, 'Clonas el repo y copias la configuración.'],
                                    ['Volver atrás si rompes una configuración', true, 'El historial de Git te da el punto anterior.'],
                                    ['Acelerar el procesador del servidor', false, 'No afecta al hardware.'],
                                    ['Sustituir el sistema operativo', false, 'Es solo configuración de usuario.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 2. Docker y contenedores
    // =====================================================================
    [
        'slug' => 'docker-y-contenedores',
        'title' => 'Docker y contenedores',
        'description' => 'Empaqueta aplicaciones con imágenes ligeras, orquesta servicios con Compose y despliega contenedores robustos en producción.',
        'category' => 'devops',
        'difficulty' => 'intermediate',
        'duration_hours' => 15,
        'is_free' => true,
        'learning_path' => 'devops',
        'learning_path_level' => 2,
        'order' => 2,
        'modules' => [
            [
                'title' => 'Contenedores',
                'description' => 'Qué son, cómo se construyen y cómo se distribuyen las imágenes.',
                'lessons' => [
                    [
                        'slug' => 'que-es-un-contenedor',
                        'title' => '¿Qué es un contenedor?',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', '¿Qué es un contenedor?'],
                            ['p', 'Un contenedor empaqueta tu aplicación con sus dependencias y las aísla del resto del sistema con cgroups y namespaces. El resultado: la misma imagen corre igual en tu portátil, en el servidor de staging y en producción.'],
                            ['p', 'A diferencia de una máquina virtual, el contenedor comparte el kernel del host y arranca en segundos. Eso lo hace ligero y perfecto para microservicios, pero significa que el host y el contenedor están más acoplados: un kernel vulnerable afecta a todos.'],
                            ['code', 'dockerfile', <<<'DOCKER'
# Dockerfile mínimo
FROM php:8.3-cli
WORKDIR /app
COPY . .
CMD ["php", "artisan", "serve"]
DOCKER],
                            ['h', 'Diferencias clave'],
                            ['list', [
                                'Contenedor: comparte kernel, arranca en segundos, ligero',
                                'Máquina virtual: kernel propio, arranque lento, aislada',
                                'Imagen: plantilla de solo lectura para crear contenedores',
                                'Registro: almacén de imágenes (Docker Hub, GHCR)',
                            ]],
                            ['p', 'En la práctica, un contenedor es un proceso con su propio sistema de archivos y red. Docker añade capas de comodidad: construye la imagen con un Dockerfile, la ejecuta con docker run y la versiona en un registro para compartirla con tu equipo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El contenedor aísla proceso, archivos y red',
                                'Comparte el kernel: ligero pero acoplado al host',
                                'La imagen es la plantilla; el contenedor, la instancia',
                                'Contenedor no es máquina virtual',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué comparte un contenedor con el host?', 'type' => 'single', 'answers' => [
                                    ['El kernel del sistema operativo', true, 'Por eso es ligero y arranca rápido.'],
                                    ['La BIOS', false, 'Las BIOS son de máquinas físicas o virtuales.'],
                                    ['El sistema operativo completo', false, 'Comparte kernel, no todo el SO.'],
                                    ['Los discos duros físicos', false, 'Usa capas de archivos propias.'],
                                ]],
                                ['q' => '¿Qué es una imagen Docker?', 'type' => 'single', 'answers' => [
                                    ['Una plantilla de solo lectura para crear contenedores', true, 'Los contenedores son instancias en ejecución de la imagen.'],
                                    ['Un proceso en ejecución', false, 'Eso es el contenedor, no la imagen.'],
                                    ['Un backup de la base de datos', false, 'No tiene relación.'],
                                    ['Un archivo de configuración del firewall', false, 'Nada que ver.'],
                                ]],
                                ['q' => '¿Qué ventajas tiene un contenedor frente a una máquina virtual?', 'type' => 'multiple', 'answers' => [
                                    ['Arranque casi instantáneo', true, 'No hay kernel que inicializar.'],
                                    ['Menor consumo de recursos', true, 'Comparte kernel y no duplica el SO.'],
                                    ['Aislamiento total del kernel', false, 'El kernel se comparte, por eso no es total.'],
                                    ['Funciona sin Linux', false, 'Necesita un kernel compatible con las tecnologías de contenedores.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'dockerfile-y-compose',
                        'title' => 'Dockerfile y Docker Compose',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Dockerfile y Docker Compose'],
                            ['p', 'El Dockerfile describe cómo se construye la imagen paso a paso, y Docker Compose describe cómo se relacionan varios contenedores: la app, la base de datos, el caché. Un buen Dockerfile usa construcción por etapas (multi-stage) para que la imagen final solo contenga lo necesario.'],
                            ['p', 'Con Compose defines servicios, volúmenes y redes en un archivo YAML, y con un solo comando levantas todo el entorno. Ese archivo versionado es tu entorno de desarrollo reproducible para cualquier persona del equipo.'],
                            ['code', 'dockerfile', <<<'DOCKER'
# Multi-stage: compila con todo y ejecuta con lo mínimo
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
DOCKER],
                            ['code', 'yaml', <<<'YAML'
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
YAML],
                            ['h', 'Reglas de oro'],
                            ['list', [
                                'Una imagen por servicio, sin procesos extra',
                                'Multi-stage para recortar el tamaño final',
                                'Pin versiones: node:22, no node:latest',
                                'No ejecutes como root dentro del contenedor',
                                'Compose define dependencias y volúmenes con claridad',
                            ]],
                            ['p', 'docker compose up -d levanta todo; docker compose down apaga y limpia. Si cambias el Dockerfile, rebuild con docker compose build. El flujo completo se parece a trabajar con scripts, pero con garantías de reproducibilidad mucho mayores.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El Dockerfile construye la imagen; Compose orquesta servicios',
                                'Multi-stage deja fuera herramientas de compilación',
                                'Los volúmenes dan persistencia a la base de datos',
                                'Versiona el Compose: es tu entorno reproducible',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ventaja da la construcción multi-stage?', 'type' => 'single', 'answers' => [
                                    ['La imagen final solo lleva lo necesario para ejecutar', true, 'Las herramientas de build quedan fuera de la imagen final.'],
                                    ['Acelera la base de datos', false, 'No afecta a servicios externos.'],
                                    ['Evita escribir Dockerfile', false, 'Sigue siendo un Dockerfile.'],
                                    ['Permite usar Windows', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Para qué sirve el bloque volumes en docker-compose.yml?', 'type' => 'single', 'answers' => [
                                    ['Persistir datos fuera del ciclo de vida del contenedor', true, 'Los datos sobreviven aunque el contenedor se destruya.'],
                                    ['Guardar un backup de la imagen', false, 'Guarda datos, no imágenes.'],
                                    ['Aumentar la RAM del host', false, 'No gestiona hardware.'],
                                    ['Definir el puerto público', false, 'Los puertos van en ports.'],
                                ]],
                                ['q' => '¿Qué buenas prácticas se aplican a las imágenes Docker?', 'type' => 'multiple', 'answers' => [
                                    ['Pinear versiones en lugar de latest', true, 'latest cambia y rompe builds sin aviso.'],
                                    ['Ejecutar como usuario no root', true, 'Reduce el impacto si el proceso es comprometido.'],
                                    ['Copiar todo el proyecto en cada build', false, 'Se copia lo necesario; menos capas y caché mejor.'],
                                    ['Instalar el compilador en la imagen final', false, 'Multi-stage lo deja fuera.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'imagenes-y-registries',
                        'title' => 'Imágenes, capas y registries',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Imágenes, capas y registries'],
                            ['p', 'Una imagen Docker se compone de capas: cada instrucción del Dockerfile (COPY, RUN, ...) añade una capa de solo lectura. Docker reutiliza capas sin cambios, por eso ordenar las instrucciones de menos a más cambiantes acelera los builds: copia primero package.json, haz npm ci y solo después copia el código fuente.'],
                            ['p', 'Las imágenes se distribuyen desde registries. Docker Hub es el público más usado y GHCR (GitHub Container Registry) integra imágenes con tus repositorios. No uses imágenes sin pinear: una versión concreta es reproducible; latest no lo es.'],
                            ['code', 'bash', <<<'BASH'
# Inspeccionar imágenes
docker history php:8.3-cli      # capas de la imagen
docker image inspect node:22     # metadatos detallados

# Publicar en un registry
docker tag mi-app ghcr.io/usuario/mi-app:1.0.0
docker push ghcr.io/usuario/mi-app:1.0.0
docker pull ghcr.io/usuario/mi-app:1.0.0
BASH],
                            ['h', 'Decisiones de imagen'],
                            ['list', [
                                'Base ligera: alpine u otras variantes slim',
                                'Versión pinchada en vez de latest',
                                'Etiquetas semánticas: 1.0.0, no solo latest',
                                'Registro privado para código interno',
                                'Escaneo de vulnerabilidades (docker scout)',
                            ]],
                            ['p', 'Cada capa se cachea y se comparte entre imágenes, lo que ahorra espacio y ancho de banda. Entender capas explica por qué un cambio de una línea en el código de tu app solo reconstruye las últimas capas, mientras cambia la base... y todo se reconstruye.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Cada instrucción crea una capa reutilizable',
                                'Ordena el Dockerfile: dependencias antes que código',
                                'Pin versiones y usa registries confiables',
                                'Escanea vulnerabilidades antes de publicar',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué conviene copiar package.json antes que el resto del código?', 'type' => 'single', 'answers' => [
                                    ['Las capas de dependencias se cachean y el build es más rápido', true, 'Solo cambian cuando cambia package.json, no en cada commit.'],
                                    ['Porque npm lo exige así', false, 'npm no impone ese orden.'],
                                    ['Para que la imagen sea más pequeña siempre', false, 'El tamaño depende del contenido, no del orden.'],
                                    ['Para evitar el registro público', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Qué problema trae usar image:latest en producción?', 'type' => 'single', 'answers' => [
                                    ['Deja de ser reproducible: la imagen cambia sin que cambie tu código', true, 'latest apunta a lo último, que puede romper tu despliegue.'],
                                    ['Es más cara', false, 'El precio no depende de la etiqueta.'],
                                    ['No se puede usar en registries privados', false, 'Sí se puede.'],
                                    ['La imagen siempre es gigantesca', false, 'El tamaño depende de la base.'],
                                ]],
                                ['q' => '¿Qué herramientas ayudan a distribuir y auditar imágenes?', 'type' => 'multiple', 'answers' => [
                                    ['Docker Hub', true, 'Registry público principal.'],
                                    ['GHCR (GitHub Container Registry)', true, 'Registry integrado con GitHub.'],
                                    ['docker scout', true, 'Escanea vulnerabilidades de la imagen.'],
                                    ['docker compose', false, 'Orquesta servicios, no distribuye imágenes.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Flujo de trabajo con Docker',
                'description' => 'Ciclo de vida, redes, volúmenes y producción.',
                'lessons' => [
                    [
                        'slug' => 'contenedores-en-practica',
                        'title' => 'Ciclo de vida de contenedores en la práctica',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Ciclo de vida de contenedores en la práctica'],
                            ['p', 'Docker gestiona el ciclo de vida completo: crear, iniciar, pausar, detener y eliminar contenedores. Aprender los comandos y sus diferencias evita sorpresas: detener un contenedor conserva su estado; eliminarlo borra sus capas de escritura y, sin volumen, sus datos.'],
                            ['p', 'Para depurar, docker logs muestra la salida del proceso y docker exec permite entrar en un contenedor en marcha. Los nombres y etiquetas ordenan el caos cuando tienes decenas de contenedores.'],
                            ['code', 'bash', <<<'BASH'
docker build -t mi-app:1.0.0 .       # construir
docker run -d -p 8080:80 --name web mi-app:1.0.0
docker ps                           # contenedores activos
docker ps -a                        # incluye detenidos
docker logs -f web                  # seguir los logs
docker exec -it web sh              # entrar al contenedor
docker stop web && docker rm web    # detener y eliminar
docker system prune -f              # limpiar recursos huérfanos
BASH],
                            ['h', 'Mapear conceptos'],
                            ['list', [
                                'docker build crea la imagen',
                                'docker run crea y arranca el contenedor',
                                'docker ps -a lista todos, incluso parados',
                                'docker exec entra a un contenedor corriendo',
                                'docker logs sigue la salida del proceso',
                            ]],
                            ['p', 'En el día a día usarás poco docker run directo: Compose lo envuelve. Pero entenderlo a fondo te permite leer logs, diagnosticar puertos en conflicto y responder con calma cuando algo no arranca. La depuración empieza por los logs y el estado.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'stop conserva el contenedor; rm lo elimina',
                                'Sin volúmenes, los datos mueren con el contenedor',
                                'docker logs -f es tu primera herramienta de depuración',
                                'docker system prune limpia recursos huérfanos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ocurre con los datos de un contenedor al eliminarlo con docker rm?', 'type' => 'single', 'answers' => [
                                    ['Se pierden a menos que haya un volumen montado', true, 'La capa de escritura es efímera; el volumen persiste.'],
                                    ['Se guardan automáticamente en el host', false, 'Solo persisten si los montaste como volumen.'],
                                    ['Se suben a Docker Hub', false, 'Nada se sube por defecto.'],
                                    ['Se comprimen en un backup', false, 'Docker no hace backups automáticos.'],
                                ]],
                                ['q' => '¿Qué comando te permite ejecutar un comando dentro de un contenedor en marcha?', 'type' => 'single', 'answers' => [
                                    ['docker exec -it web sh', true, 'Abre una shell interactiva en el contenedor web.'],
                                    ['docker stop web', false, 'Eso lo detiene.'],
                                    ['docker build .', false, 'Construye la imagen.'],
                                    ['docker system prune', false, 'Limpia recursos, no entra a contenedores.'],
                                ]],
                                ['q' => '¿Para qué sirve docker logs -f web?', 'type' => 'multiple', 'answers' => [
                                    ['Ver la salida del proceso en tiempo real', true, 'La -f sigue el flujo como tail -f.'],
                                    ['Detectar errores al arrancar', true, 'Los errores de arranque aparecen en los logs.'],
                                    ['Modificar la configuración del contenedor', false, 'Los logs son de solo lectura.'],
                                    ['Abrir un puerto nuevo', false, 'Los puertos se definen en run o en Compose.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'redes-y-volumenes',
                        'title' => 'Redes y volúmenes entre contenedores',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Redes y volúmenes entre contenedores'],
                            ['p', 'En Docker, cada contenedor vive en una red virtual. Los contenedores de una misma red se encuentran por nombre de servicio, sin necesidad de IPs fijas; los puertos solo se publican al host cuando hace falta, con la sintaxis host:contenedor.'],
                            ['p', 'Los volúmenes desacoplan los datos del ciclo de vida del contenedor: la base de datos escribe en un volumen y sobrevive a reinicios y recreaciones. Un bind mount, en cambio, conecta un directorio del host para desarrollo con recarga en caliente.'],
                            ['code', 'yaml', <<<'YAML'
services:
  api:
    build: .
    networks: [appnet]
    volumes:
      - ./src:/app          # bind mount para desarrollo
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    networks: [appnet]
    volumes:
      - dbdata:/var/lib/postgresql/data
networks:
  appnet:
volumes:
  dbdata:
YAML],
                            ['code', 'bash', <<<'BASH'
# Diagnóstico de red entre contenedores
docker compose exec api ping db
docker network inspect appnet
BASH],
                            ['h', 'Conceptos de red y datos'],
                            ['list', [
                                'Red bridge por defecto para contenedores locales',
                                'DNS interno: los servicios se llaman por su nombre',
                                'Publicar puertos con "host:contenedor"',
                                'Volumen nombrado: datos persistentes',
                                'Bind mount: directorio compartido con el host',
                            ]],
                            ['p', 'El patrón típico: la API se conecta a db por el nombre de servicio; el navegador del usuario llega por el puerto publicado. Si un contenedor no encuentra a otro, revisa que compartan red y que el nombre de servicio sea exacto.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El DNS interno resuelve nombres de servicio',
                                'Publica solo los puertos que deben ser accesibles',
                                'Volúmenes nombrados para datos que deben persistir',
                                'Bind mounts para desarrollo con recarga en caliente',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cómo se llama un contenedor a otro dentro de la misma red Docker Compose?', 'type' => 'single', 'answers' => [
                                    ['Por el nombre de servicio definido en Compose', true, 'El DNS interno resuelve api, db, etc.'],
                                    ['Por la IP pública del host', false, 'Dentro de la red se usa el DNS interno.'],
                                    ['Por el nombre del usuario', false, 'No existe esa resolución.'],
                                    ['No pueden comunicarse', false, 'Sí pueden, por red compartida.'],
                                ]],
                                ['q' => '¿Qué diferencia hay entre un volumen nombrado y un bind mount?', 'type' => 'single', 'answers' => [
                                    ['El volumen lo gestiona Docker; el bind mount apunta a un directorio del host', true, 'Por eso el bind mount es útil con código en desarrollo.'],
                                    ['El bind mount es más seguro siempre', false, 'La seguridad depende del uso, no del tipo.'],
                                    ['El volumen solo sirve para Windows', false, 'Funciona en cualquier plataforma.'],
                                    ['No hay ninguna diferencia', false, 'Sí la hay en gestión y uso.'],
                                ]],
                                ['q' => '¿Cuándo usarías un bind mount en desarrollo?', 'type' => 'multiple', 'answers' => [
                                    ['Para que el código del host se refleje dentro del contenedor', true, 'Editas en el host y el contenedor lo ve al instante.'],
                                    ['Para recargar la app al cambiar el código', true, 'Con herramientas de hot reload funciona en caliente.'],
                                    ['Para guardar backups de la imagen', false, 'Los backups no son el propósito principal.'],
                                    ['Para aumentar la seguridad de red', false, 'No toca la red.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'docker-en-produccion',
                        'title' => 'Docker en entornos de producción',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Docker en entornos de producción'],
                            ['p', 'Producir con Docker va más allá de docker run: imágenes ligeras con usuario no root, secretos fuera de la imagen, healthchecks que el orquestador usa para decidir, y actualizaciones por nueva etiqueta sin perder datos.'],
                            ['p', 'Un contenedor productivo debe fallar ruidosamente, no esconderse: healthcheck indica si el proceso está sano; restart policies (unless-stopped, on-failure) recuperan caídas; y los límites de recursos (mem_limit, cpus) evitan que un contenedor devore el host.'],
                            ['code', 'yaml', <<<'YAML'
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - APP_ENV=production        # secretos reales vía secret manager
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    mem_limit: 512m
    cpus: 1.0
YAML],
                            ['h', 'Checklist de producción'],
                            ['list', [
                                'Usuario no root dentro del contenedor',
                                'Secretos por variables de entorno, nunca en la imagen',
                                'Healthcheck definido por servicio',
                                'Política de reinicio y límites de recursos',
                                'Logs a stdout para el agregador del host',
                                'Etiquetas de versión inmutables para rollback',
                            ]],
                            ['p', 'El healthcheck es la base: el orquestador (Docker, Kubernetes o tu plataforma cloud) reinicia contenedores no sanos. Si tu app expone /health, el despliegue sabe cuándo es seguro cortar el tráfico. Ese endpoint debe validar dependencias críticas sin fingir.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'No root, secretos externos y healthchecks',
                                'restart y límites de recursos protegen el host',
                                'El healthcheck decide la salud real del servicio',
                                'Etiquetas inmutables permiten rollback limpio',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué es mala práctica guardar secretos dentro de la imagen Docker?', 'type' => 'single', 'answers' => [
                                    ['La imagen es inmutable y se comparte: el secreto viajaría con todos los que la descarguen', true, 'Cualquiera con la imagen obtendría las credenciales.'],
                                    ['Porque las imágenes no admiten texto', false, 'Sí admiten texto.'],
                                    ['Porque Docker lo prohíbe', false, 'Lo permite, pero es inseguro.'],
                                    ['Porque ralentiza el build', false, 'El rendimiento no es el problema.'],
                                ]],
                                ['q' => '¿Qué papel juega el healthcheck en producción?', 'type' => 'single', 'answers' => [
                                    ['Determina si el contenedor está sano y debe recibir tráfico o reiniciarse', true, 'El orquestador actúa según su resultado.'],
                                    ['Acorta la imagen', false, 'No afecta al tamaño.'],
                                    ['Abre los puertos del firewall', false, 'El firewall se gestiona aparte.'],
                                    ['Genera logs legibles', false, 'Los logs se gestionan por separado.'],
                                ]],
                                ['q' => '¿Qué medidas hacen un contenedor más seguro y estable en producción?', 'type' => 'multiple', 'answers' => [
                                    ['Ejecutar como usuario no root', true, 'Limita el daño ante una vulnerabilidad.'],
                                    ['Definir límites de memoria y CPU', true, 'Evita que un fallo consuma todo el host.'],
                                    ['Usar restart: unless-stopped', true, 'Recupera caídas automáticamente.'],
                                    ['Compilar dentro del contenedor en producción', false, 'Se compila en build con multi-stage; producción solo ejecuta.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 3. CI/CD con GitHub Actions
    // =====================================================================
    [
        'slug' => 'ci-cd-github-actions',
        'title' => 'CI/CD con GitHub Actions',
        'description' => 'Automatiza pruebas, calidad y despliegues con pipelines que se ejecutan en cada cambio de tu repositorio.',
        'category' => 'devops',
        'difficulty' => 'intermediate',
        'duration_hours' => 13,
        'is_free' => false,
        'learning_path' => 'devops',
        'learning_path_level' => 3,
        'order' => 3,
        'modules' => [
            [
                'title' => 'Pipelines',
                'description' => 'Fundamentos de integración y despliegue continuos con Actions.',
                'lessons' => [
                    [
                        'slug' => 'que-es-ci-cd',
                        'title' => 'Integración y despliegue continuos',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Integración y despliegue continuos'],
                            ['p', 'La integración continua (CI) ejecuta verificaciones de forma automática en cada cambio: tests, lint, análisis de tipos y build. El despliegue continuo (CD) lleva esos cambios validados a un entorno, idealmente producción, con el mismo pipeline.'],
                            ['p', 'El beneficio central es la detección temprana: un error que rompe la rama main se descubre minutos después del push, cuando el contexto está fresco, no en la víspera de una release. CI/CD convierte la calidad en un proceso, no en una ceremonia manual.'],
                            ['code', 'yaml', <<<'YAML'
# Flujo CI básico (esquema)
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - instalar dependencias
      - ejecutar tests
      - subir reportes
YAML],
                            ['h', 'Piezas del pipeline'],
                            ['list', [
                                'Evento: push, pull_request, schedule',
                                'Workflow: archivo YAML que define el pipeline',
                                'Job: conjunto de pasos en una misma máquina',
                                'Step: unidad mínima (instalar, test, deploy)',
                                'Artefacto: resultado que se conserva (cobertura, build)',
                            ]],
                            ['p', 'CI/CD no es solo velocidad: es confianza. Si cada cambio pasa por las mismas verificaciones, los despliegues dejan de ser momentos de miedo y se vuelven actos rutinarios. La automatización también documenta qué se verificó antes de cada release.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'CI verifica cada cambio automáticamente',
                                'CD despliega los cambios validados',
                                'Detección temprana = contexto fresco para corregir',
                                'Calidad como proceso automatizado, no manual',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace la integración continua (CI) en cada cambio?', 'type' => 'single', 'answers' => [
                                    ['Ejecuta verificaciones automáticas: tests, lint, build', true, 'Es la validación automática del código nuevo.'],
                                    ['Despliega directamente a producción', false, 'Eso es parte del CD, no de la CI.'],
                                    ['Elimina los tests', false, 'La CI los ejecuta, no los borra.'],
                                    ['Genera documentación del producto final', false, 'Puede incluirla, pero su núcleo es la verificación.'],
                                ]],
                                ['q' => '¿Cuál es el beneficio principal de detectar errores justo tras el push?', 'type' => 'single', 'answers' => [
                                    ['El contexto del cambio está fresco y se corrige rápido', true, 'Sabes exactamente qué cambió y por qué.'],
                                    ['El servidor está más rápido a esa hora', false, 'No depende del horario.'],
                                    ['Los tests pasan sin configuración', false, 'Siguen necesitando configuración.'],
                                    ['Git evita los conflictos', false, 'Los conflictos se gestionan aparte.'],
                                ]],
                                ['q' => '¿Qué elementos forman parte de un pipeline de CI/CD?', 'type' => 'multiple', 'answers' => [
                                    ['Eventos que disparan la ejecución', true, 'push o pull_request son disparadores típicos.'],
                                    ['Jobs y steps en una máquina de ejecución', true, 'Definen qué se hace y dónde.'],
                                    ['Artefactos como reportes de cobertura', true, 'Se guardan como evidencia de la ejecución.'],
                                    ['El diseño visual de la aplicación', false, 'El pipeline no toca la UI del producto.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'github-actions-en-practica',
                        'title' => 'GitHub Actions en la práctica',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'GitHub Actions en la práctica'],
                            ['p', 'GitHub Actions ejecuta workflows en respuesta a eventos del repositorio. Un workflow vive en .github/workflows, se dispara con on: push o pull_request y define jobs que corren en runners (máquinas efímeras Ubuntu, Windows o macOS).'],
                            ['p', 'Cada job tiene steps; cada step usa una acción (un paso reutilizable publicado en marketplace) o un comando shell. Las acciones oficiales checkout, setup-node o upload-artifact forman la base de casi cualquier pipeline.'],
                            ['code', 'yaml', <<<'YAML'
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
YAML],
                            ['h', 'Sintaxis mínima'],
                            ['list', [
                                'name: nombre visible del workflow',
                                'on: eventos que lo disparan',
                                'jobs: lista de trabajos',
                                'runs-on: sistema del runner',
                                'steps -> uses: acción reutilizable',
                                'steps -> run: comando directo',
                            ]],
                            ['p', 'Los cambios en el YAML se prueban con un push: el runner ejecuta el workflow y GitHub muestra cada step con su salida. Empieza simple (checkout + tests) y añade pasos solo cuando fallen: cada paso extra es tiempo de ejecución y superficie de fallo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Workflows en .github/workflows/*.yml',
                                'on define los disparadores',
                                'los jobs corren en runners efímeros',
                                'acciones del marketplace reutilizan pasos probados',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde se definen los workflows de GitHub Actions?', 'type' => 'single', 'answers' => [
                                    ['En .github/workflows/ como archivos YAML', true, 'Action busca ahí los pipelines por defecto.'],
                                    ['En docker-compose.yml', false, 'Eso es Docker Compose.'],
                                    ['En package.json', false, 'Eso describe dependencias Node.'],
                                    ['En cualquier carpeta del repo', false, 'Deben estar en .github/workflows.'],
                                ]],
                                ['q' => '¿Qué hace la acción actions/checkout@v4?', 'type' => 'single', 'answers' => [
                                    ['Clona el repositorio en el runner', true, 'Sin ella no tendrías el código que verificar.'],
                                    ['Instala Node', false, 'Eso es setup-node.'],
                                    ['Ejecuta los tests', false, 'Eso es un step con run.'],
                                    ['Abre un pull request', false, 'Para eso hay acciones específicas.'],
                                ]],
                                ['q' => '¿Qué eventos pueden disparar un workflow?', 'type' => 'multiple', 'answers' => [
                                    ['push a una rama', true, 'Se ejecuta cuando hay push a las ramas configuradas.'],
                                    ['pull_request', true, 'Se ejecuta al abrir o actualizar un PR.'],
                                    ['schedule (cron)', true, 'Ejecuciones programadas.'],
                                    ['Un cambio de color del tema', false, 'Eso es frontend, no un evento de repositorio.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'workflows-y-jobs',
                        'title' => 'Workflows, jobs y steps en profundidad',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Workflows, jobs y steps en profundidad'],
                            ['p', 'Un workflow con varios jobs puede correrlos en paralelo o encadenarlos con needs: el job de despliegue espera a que termine el de tests. Las matrices (strategy.matrix) repiten un job con varias versiones, p. ej. Node 20 y 22, multiplicando cobertura sin duplicar YAML.'],
                            ['p', 'Los secretos van en Settings del repositorio y se referencian como ${{ secrets.NOMBRE }}; nunca se ven en los logs. Las variables (vars) sirven para configuración no sensible. Los caches (actions/cache) aceleran dependencias reutilizables.'],
                            ['code', 'yaml', <<<'YAML'
name: Pipeline completo
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
        env:
          API_KEY: ${{ secrets.API_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: echo "Desplegando versión validada"
YAML],
                            ['h', 'Controles útiles'],
                            ['list', [
                                'needs: ordena jobs dependientes',
                                'strategy.matrix: repite con variaciones',
                                'secrets: credenciales cifradas por repo',
                                'env: variables por job o step',
                                'if: condiciones (solo main, solo etiqueta)',
                            ]],
                            ['p', 'El pipeline completo se vuelve un contrato: nadie despliega sin que el job de tests haya pasado. Los logs de cada step son la evidencia. Si un job falla intermitentemente, revisa si es flakiness (lo verás en revisión) antes de aplazar el mecanismo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'needs crea dependencias entre jobs',
                                'Las matrices prueban varias versiones con un solo YAML',
                                'Secretos fuera del código, referenciados por nombre',
                                'if y env condicionan el comportamiento por job',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace la clave needs en un job?', 'type' => 'single', 'answers' => [
                                    ['Espera a que los jobs indicados terminen antes de empezar', true, 'deploy con needs: test no corre hasta que test acabe.'],
                                    ['Fuerza la ejecución en paralelo', false, 'Es lo contrario: crea orden.'],
                                    ['Define las versiones de Node', false, 'Eso es strategy.matrix.'],
                                    ['Abre un issue automático', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Para qué sirve strategy.matrix con node: [20, 22]?', 'type' => 'single', 'answers' => [
                                    ['Ejecutar el job con Node 20 y con Node 22', true, 'Se prueban ambas versiones sin duplicar el YAML.'],
                                    ['Instalar Node en dos carpetas', false, 'Es una matriz de versiones, no de carpetas.'],
                                    ['Alternar entre Linux y Windows', false, 'Eso sería la matriz del sistema, no de Node.'],
                                    ['Elegir automáticamente la versión más nueva', false, 'Se prueban las dos, no se elige.'],
                                ]],
                                ['q' => '¿Cómo se gestionan las credenciales en GitHub Actions?', 'type' => 'multiple', 'answers' => [
                                    ['Como secretos configurados en Settings del repositorio', true, 'Se referencian con ${{ secrets.NOMBRE }}.'],
                                    ['Referenciándolas con ${{ secrets.MI_SECRETO }}', true, 'GitHub las inyecta sin mostrarlas en logs.'],
                                    ['Escribiéndolas en el YAML versionado', false, 'Nunca se versionan credenciales.'],
                                    ['Subiéndolas como artefacto', false, 'Los artefactos se comparten y no es un lugar seguro.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Calidad y despliegue',
                'description' => 'Tests, calidad, despliegue continuo y seguridad del pipeline.',
                'lessons' => [
                    [
                        'slug' => 'tests-y-calidad-en-ci',
                        'title' => 'Tests, lint y calidad en CI',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Tests, lint y calidad en CI'],
                            ['p', 'El pipeline de CI es el portero de la calidad: si los tests fallan, el lint detecta inconsistencias o la cobertura baja del umbral, el cambio no se integra. Automatizar estas barreras convierte las reglas del equipo en hechos verificables.'],
                            ['p', 'Un pipeline equilibrado ejecuta tests unitarios, tests de integración, lint/format, chequeo de tipos y build. La cobertura se sube como artefacto y Quality Gate la compara con un umbral, p. ej. 80 %, para bloquear regresiones silenciosas.'],
                            ['code', 'yaml', <<<'YAML'
name: Calidad
on: pull_request

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - name: Subir cobertura
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
YAML],
                            ['h', 'Barreras de calidad típicas'],
                            ['list', [
                                'Lint y formato: estilo y errores comunes',
                                'Chequeo de tipos: contratos en tiempo estático',
                                'Tests unitarios: lógica aislada',
                                'Tests de integración: flujos con dependencias reales',
                                'Cobertura mínima y reportes como artefacto',
                            ]],
                            ['p', 'El objetivo no es acumular checks, sino que cada barrera aporte señal: un check que nunca falla no protege nada. Si el equipo tarda mucho en los checks, se paralelizan jobs o se recorta la matriz. La CI debe ser rápida y confiable para que el equipo la respete.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El pipeline automatiza las reglas de calidad',
                                'Lint + tipos + tests + build cubren el frente habitual',
                                'La cobertura se mide y se exige sobre un umbral',
                                'Checks rápidos y confiables se respetan; lentos, se esquivan',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué papel juega la cobertura de código en CI?', 'type' => 'single', 'answers' => [
                                    ['Medir cuánto código ejercitan los tests y vigilar regresiones', true, 'El umbral bloquea caídas de calidad sin aviso.'],
                                    ['Sustituir los tests', false, 'La cobertura es una métrica, no una prueba.'],
                                    ['Acelerar el runner', false, 'Medir no acelera nada.'],
                                    ['Eliminar el lint', false, 'Siguen siendo barreras independientes.'],
                                ]],
                                ['q' => '¿Por qué conviene que el pipeline de calidad tenga checks útiles y no decorativos?', 'type' => 'single', 'answers' => [
                                    ['Un check que nunca falla no protege y consume tiempo sin señal', true, 'Cada barrera debe poder atrapar un error real.'],
                                    ['Porque GitHub limita el número de checks', false, 'GitHub no limita de forma relevante.'],
                                    ['Porque los checks decorativos son más caros', false, 'El coste no es el argumento principal.'],
                                    ['Porque solo se permite un check por pipeline', false, 'Pueden ser varios.'],
                                ]],
                                ['q' => '¿Qué verificaciones suelen incluirse en un pipeline de calidad?', 'type' => 'multiple', 'answers' => [
                                    ['Lint y formato', true, 'Aplican estilo y detectan errores comunes.'],
                                    ['Chequeo de tipos', true, 'Valida contratos en tiempo estático.'],
                                    ['Tests con cobertura', true, 'Ejecución de la suite y métrica de cobertura.'],
                                    ['Diseño de la base de datos', false, 'La validación de diseño no es típica de CI básico.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'despliegue-continuo',
                        'title' => 'Deploy continuo con Actions',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Deploy continuo con Actions'],
                            ['p', 'El despliegue continuo lleva la versión validada a un entorno. Con GitHub Actions puedes publicar una imagen Docker, sincronizar archivos a un servidor por SSH o desplegar a plataformas que exponen su propia acción (Vercel, Fly.io, AWS).'],
                            ['p', 'El patrón seguro: construir y versionar en CI, validar contra staging, y solo en main o una release etiquetada disparar el deploy a producción. Los secretos del entorno (token del registro, claves SSH) viven en Settings, nunca en el YAML.'],
                            ['code', 'yaml', <<<'YAML'
name: Deploy
on:
  push:
    tags: ["v*"]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - run: docker build -t ghcr.io/me/app:${{ github.ref_name }} .
      - run: docker push ghcr.io/me/app:${{ github.ref_name }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.HOST }}
          username: deploy
          key: ${{ secrets.SSH_KEY }}
          script: |
            docker pull ghcr.io/me/app:${{ github.ref_name }}
            docker compose up -d
YAML],
                            ['h', 'Patrones de deploy'],
                            ['list', [
                                'Etiquetas v1.2.3 como versión de release',
                                'Imagen inmutable por etiqueta para rollback',
                                'Staging valida antes de producción',
                                'Secretos de entorno cifrados en Settings',
                                'Rollback = redeploy de la etiqueta anterior',
                            ]],
                            ['p', 'Un buen deploy es aburrido: la etiqueta sube, el servidor descarga y reinicia, el healthcheck confirma. Si algo falla, vuelves a la etiqueta anterior. La automatización reduce la ventana de error humano y da a cada release una ruta de vuelta clara.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Deploy solo desde un evento de confianza (main o tag)',
                                'Imágenes etiquetadas e inmutables',
                                'Secretos fuera del YAML, en Settings',
                                'Rollback a la etiqueta anterior',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué desplegar solo ante etiquetas v* y no ante cada push?', 'type' => 'single', 'answers' => [
                                    ['Cada versión etiquetada es una release deliberada y reproducible', true, 'Las etiquetas marcan puntos de release controlados.'],
                                    ['Porque GitHub no permite desplegar con push', false, 'Sí se puede; es una decisión de diseño.'],
                                    ['Para que el runner no trabaje tanto', false, 'El ahorro no es el motivo principal.'],
                                    ['Porque los tags viajan más rápido', false, 'No hay diferencia de velocidad.'],
                                ]],
                                ['q' => '¿Cómo se hace rollback con imágenes etiquetadas?', 'type' => 'single', 'answers' => [
                                    ['Redesplegando la etiqueta de la versión anterior', true, 'La imagen anterior sigue disponible y exacta.'],
                                    ['Borrando el repositorio Git', false, 'Destructivo y sin relación.'],
                                    ['Reconstruyendo desde el código actual', false, 'Eso desplegaría el estado actual, no el anterior.'],
                                    ['Esperando a la siguiente release', false, 'El rollback es inmediato, no se espera.'],
                                ]],
                                ['q' => '¿Dónde deben vivir las credenciales de despliegue (SSH, tokens)?', 'type' => 'multiple', 'answers' => [
                                    ['En los secretos configurados en GitHub Settings', true, 'Se inyectan en runtime, cifrados y ocultos.'],
                                    ['En el archivo YAML versionado', false, 'Nunca se versionan credenciales.'],
                                    ['En variables de entorno del runner', false, 'Mejor secrets, que no aparecen en logs.'],
                                    ['En un artefacto del workflow', false, 'Los artefactos son compartidos y no seguros.'],
                                    ['En un gestor de secretos integrado al pipeline (como Vault)', true, 'Se inyecta en runtime y se audita el acceso.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'seguridad-y-buenas-practicas-cicd',
                        'title' => 'Seguridad y buenas prácticas en CI/CD',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Seguridad y buenas prácticas en CI/CD'],
                            ['p', 'Un pipeline con acceso a producción es un objetivo de ataque: si un atacante modifica el YAML o un paso inseguro filtra secretos, tiene las llaves de tu sistema. La seguridad del pipeline merece el mismo cuidado que el código de la aplicación.'],
                            ['p', 'Regla de oro: los secretos solo van a los jobs que los necesitan, con permisos mínimos. OTA (principio de menor privilegio) aplica también al GITHUB_TOKEN: ajusta permissions por job y evita acciones de terceros sin las versiones etiquetadas.'],
                            ['code', 'yaml', <<<'YAML'
name: Seguro
on: pull_request

permissions:
  contents: read   # mínimo necesario

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
        env:
          # solo el secret que este job necesita
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
YAML],
                            ['h', 'Buenas prácticas de seguridad'],
                            ['list', [
                                'GITHUB_TOKEN con permisos mínimos',
                                'Acciones de terceros con versión fija y revisada',
                                'Secretos por job, solo los imprescindibles',
                                'No imprimir secretos en logs ni artefactos',
                                'Dependabot para dependencias y acciones',
                                'Revisión humana en pull requests (no auto-merge)',
                            ]],
                            ['p', 'Además, valida las entradas: en eventos pull_request desde forks, no ejecutes pasos con secretos de producción sin aprobación explícita (workflow_run o review). Automatizar es bueno; automatizar sin control, un riesgo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Permisos mínimos en GITHUB_TOKEN y acciones',
                                'Secretos solo donde se necesitan',
                                'Versiones de acciones fijas y auditadas',
                                'Dependabot y review humano cierran el circuito',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué limitar los permisos del GITHUB_TOKEN en cada job?', 'type' => 'single', 'answers' => [
                                    ['Si el job se compromete, el daño queda acotado al permiso concedido', true, 'Menos privilegio = menos superficie de daño.'],
                                    ['Porque GitHub lo obliga siempre', false, 'Es recomendable, no obligatorio por defecto.'],
                                    ['Porque acelera el runner', false, 'No afecta el rendimiento.'],
                                    ['Para que los tests pasen solos', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Qué riesgo hay con acciones de terceros sin fijar versión?', 'type' => 'single', 'answers' => [
                                    ['El mantenedor puede cambiar el comportamiento y comprometer tus builds', true, 'Una versión fija te protege de cambios no auditados.'],
                                    ['No tienen riesgo porque GitHub las revisa', false, 'GitHub no audita cada cambio posterior.'],
                                    ['Solo ralentizan el pipeline', false, 'El riesgo es de seguridad, no de velocidad.'],
                                    ['Impiden usar secretos', false, 'Al contrario: mal usadas pueden exponerlos.'],
                                ]],
                                ['q' => '¿Qué medidas reducen el riesgo del pipeline?', 'type' => 'multiple', 'answers' => [
                                    ['Dependabot para dependencias y acciones', true, 'Parches automáticos de vulnerabilidades conocidas.'],
                                    ['Revisión humana de pull requests', true, 'Un cambio malicioso se ve antes de integrarse.'],
                                    ['Imprimir secretos en logs para depurar', false, 'Nunca se imprimen secretos.'],
                                    ['Auto-merge sin revisión', false, 'Elimina la barrera humana de control.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
