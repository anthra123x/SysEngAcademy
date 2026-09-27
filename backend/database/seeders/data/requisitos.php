<?php

/*
 * Cursos de ingeniería de requerimientos.
 */

return [
    // =====================================================================
    // 1. Fundamentos de requerimientos
    // =====================================================================
    [
        'slug' => 'fundamentos-requerimientos',
        'title' => 'Fundamentos de requerimientos',
        'description' => 'Aprende qué es un requerimiento, por qué sus errores son los más caros y cómo descubrirlos, escribirlos y validarlos sin ambigüedad.',
        'category' => 'requerimientos',
        'difficulty' => 'beginner',
        'duration_hours' => 12,
        'is_free' => true,
        'learning_path' => 'ingenieria-de-requerimientos',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'Conceptos clave',
                'description' => 'Tipos de requerimientos y el coste de los errores.',
                'lessons' => [
                    [
                        'slug' => 'requerimientos-funcionales-y-no',
                        'title' => 'Requerimientos funcionales y no funcionales',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Requerimientos funcionales y no funcionales'],
                            ['p', 'Un requerimiento es una capacidad o condición que el sistema debe cumplir. Los funcionales describen qué hace el sistema: acciones, reglas de negocio, respuestas. Los no funcionales describen cómo lo hace: rendimiento, seguridad, usabilidad, disponibilidad.'],
                            ['p', 'Separarlos importa porque se prueban distinto y se diseñan distinto: el funcional define la lógica; el no funcional, la arquitectura. Olvidar un requerimiento no funcional (p. ej. soportar 1000 usuarios concurrentes) puede tirar abajo un diseño completo.'],
                            ['code', 'php', <<<'PHP'
// Requerimiento FUNCIONAL (qué hace)
// RF-01: El sistema debe permitir a un estudiante
//        inscribirse en un curso con un clic.

// Requerimiento NO FUNCIONAL (cómo lo hace)
// RNF-01: La inscripción debe confirmarse en menos
//         de 2 segundos con 1 000 usuarios concurrentes.
$inscripcion = (new InscripcionService())->inscribir($cursoId, $usuarioId);
PHP],
                            ['h', 'Clasificación práctica'],
                            ['list', [
                                'Funcional: acciones, reglas, lógica de negocio',
                                'No funcional: rendimiento, seguridad, usabilidad',
                                'Ambos deben ser medibles y verificables',
                                'Solo los medibles se pueden testear y aceptar',
                                'Los no funcionales son los que rompen la arquitectura',
                            ]],
                            ['p', 'Al escribir, usa lenguaje verificable: "más de 2 segundos" o "el 99,9 % de disponibilidad" se pueden medir; "rápido" o "seguro" no. Un requerimiento que no se puede verificar no es un requerimiento, es una opinión.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Funcionales: qué hace el sistema',
                                'No funcionales: cómo y con qué calidad',
                                'Todo requerimiento debe ser verificable',
                                'Los no funcionales condicionan la arquitectura',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es un ejemplo de requerimiento no funcional?', 'type' => 'single', 'answers' => [
                                    ['El sistema debe responder en menos de 2 segundos con 1000 usuarios', true, 'Define una propiedad de rendimiento, no una acción.'],
                                    ['El usuario debe poder cancelar su suscripción', false, 'Eso es una acción: requerimiento funcional.'],
                                    ['El sistema debe enviar un correo de bienvenida', false, 'Acción concreta: funcional.'],
                                    ['El usuario debe poder subir su foto de perfil', false, 'Acción: funcional.'],
                                ]],
                                ['q' => '¿Por qué deben ser medibles los requerimientos?', 'type' => 'multiple', 'answers' => [
                                    ['Para poder verificar si se cumplen', true, 'Sin medida no hay prueba.'],
                                    ['Para testearlos automáticamente', true, 'La medición habilita la validación.'],
                                    ['Para que se vean más importantes', false, 'La apariencia no es el motivo.'],
                                    ['Para ahorrar espacio en el documento', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Qué riesgo tiene olvidar los requerimientos no funcionales?', 'type' => 'single', 'answers' => [
                                    ['La arquitectura puede no soportar la carga esperada', true, 'El rendimiento o la seguridad se diseñan tarde y caro.'],
                                    ['El código no compila', false, 'El compilador no depende de los no funcionales.'],
                                    ['Los botones no se ven', false, 'Eso es un tema visual, no de requerimientos.'],
                                    ['No hay ningún riesgo', false, 'Hay riesgo real y alto.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'coste-de-los-errores',
                        'title' => 'El coste de los errores de requerimientos',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'El coste de los errores de requerimientos'],
                            ['p', 'El error más caro en software no es un bug de código: es construir la funcionalidad equivocada. Corregir un requerimiento mal entendido durante el análisis cuesta poco; corregirlo en producción puede costar decenas de veces más, porque ya hay código, tests y despliegues construidos sobre la idea errónea.'],
                            ['p', 'Cuanto más tarde se detecta un error, más caro se corrige. Por eso la ingeniería de requerimientos invierte donde el coste es mínimo: entender y validar antes de construir, con prototipos, conversaciones y criterios de aceptación.'],
                            ['code', 'php', <<<'PHP'
// Coste relativo de corregir un error de requerimientos
$fases = [
    'Análisis'           => 1,   // 1x : se corrige el documento
    'Diseño'             => 5,   // 5x : se corrige el diseño
    'Implementación'     => 10,  // 10x: se reescribe código y tests
    'Pruebas'            => 20,  // 20x: se rehacen pruebas y casos
    'Producción'         => 100, // 100x: parche, release y soporte
];
PHP],
                            ['h', 'Lecciones prácticas'],
                            ['list', [
                                'El error más caro es construir lo equivocado',
                                'Detectar tarde multiplica el coste por decenas',
                                'Invertir en análisis es el mejor retorno',
                                'Preguntar antes de construir no es perder tiempo',
                                'Criterios de aceptación validan el entendimiento',
                            ]],
                            ['p', 'La herramienta más barata del proyecto es una pregunta bien hecha en la fase correcta. Convertir suposiciones en conversaciones, y conversaciones en criterios verificables, es la esencia de un buen análisis de requerimientos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Errores de requerimientos = los más caros',
                                'El coste crece con cada fase que avanza',
                                'Validar temprano sale barato',
                                'Preguntas y criterios de aceptación evitan construir mal',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el error más caro en desarrollo de software?', 'type' => 'single', 'answers' => [
                                    ['Construir la funcionalidad equivocada', true, 'Todo lo construido sobre la idea errónea se descarta.'],
                                    ['Un bug de interfaz menor', false, 'Se corrige rápido y localizado.'],
                                    ['Un error de tipografía', false, 'Coste mínimo comparado.'],
                                    ['Una lentitud de la base de datos', false, 'Se optimiza sin rehacer producto.'],
                                ]],
                                ['q' => '¿Qué multiplicador aproximado tiene corregir un error de requerimientos cuando ya está en producción?', 'type' => 'single', 'answers' => [
                                    ['Decenas o cientos de veces más caro que en análisis', true, 'La literatura del área maneja factores de 50x a 100x+.'],
                                    ['El mismo coste en cualquier fase', false, 'El coste crece con la fase.'],
                                    ['Es más barato en producción', false, 'Al contrario: es el peor momento.'],
                                    ['Solo cuesta el doble', false, 'El factor es muy superior.'],
                                ]],
                                ['q' => '¿Qué práctica reduce el coste de los errores de requerimientos?', 'type' => 'multiple', 'answers' => [
                                    ['Validar con criterios de aceptación temprano', true, 'Detectas el malentendido antes de construir.'],
                                    ['Prototipar para probar el entendimiento', true, 'Un prototipo barato descubre suposiciones falsas.'],
                                    ['Preguntar a los interesados antes de implementar', true, 'La conversación previa es la inversión más barata.'],
                                    ['Escribir código rápido para ver qué pasa', false, 'Justo lo contrario: construyes lo equivocado caro y tarde.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'tipos-de-requerimientos',
                        'title' => 'Tipos de requerimientos y su ciclo de vida',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Tipos de requerimientos y su ciclo de vida'],
                            ['p', 'Además de funcionales y no funcionales, los requerimientos se clasifican por origen y nivel: de negocio (objetivos de la organización), de usuario (qué necesita el usuario) y de sistema (qué implementa el software). Un mismo objetivo de negocio baja hasta varios requerimientos de sistema.'],
                            ['p', 'Ese despliegue en niveles forma la cadena de trazabilidad: desde el objetivo hasta la línea de código que lo cumple. El ciclo de vida de un requerimiento —identificado, analizado, aprobado, implementado, verificado, retirado— te dice en qué punto está cada uno.'],
                            ['code', 'php', <<<'PHP'
// Niveles de requerimientos
$niveles = [
    'Negocio' => 'Aumentar un 20 % las inscripciones online',
    'Usuario' => 'El alumno puede darse de alta en 2 minutos',
    'Sistema' => 'POST /api/inscripciones crea la matrícula y envía el email',
];
PHP],
                            ['h', 'Clasificación útil'],
                            ['list', [
                                'De negocio: objetivos de la organización',
                                'De usuario: necesidades y tareas de las personas',
                                'De sistema: comportamiento concreto del software',
                                'Estado del ciclo: identificado → aprobado → implementado → verificado',
                                'Trazabilidad: cada nivel conecta con el siguiente',
                            ]],
                            ['p', 'Entender los niveles evita el error clásico: saltar del objetivo de negocio a la solución técnica sin validar con el usuario. Cada nivel es una oportunidad de preguntar y corregir antes de que el malentendido se vuelva código.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Negocio, usuario y sistema: tres lentes del requerimiento',
                                'El ciclo de vida dice en qué fase está cada uno',
                                'La trazabilidad conecta objetivo con código',
                                'Validar en cada nivel evita soluciones equivocadas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '"El alumno puede darse de alta en 2 minutos", ¿de qué nivel es?', 'type' => 'single', 'answers' => [
                                    ['Requerimiento de usuario', true, 'Describe la necesidad de la persona, no el objetivo de negocio ni la implementación.'],
                                    ['Requerimiento de negocio', false, 'El negocio es el objetivo estratégico, p. ej. aumentar inscripciones.'],
                                    ['Requerimiento de sistema', false, 'El sistema sería el endpoint o el flujo de datos concreto.'],
                                    ['Requerimiento técnico', false, 'No es una categoría estándar aquí.'],
                                ]],
                                ['q' => '¿Qué es la trazabilidad de requerimientos?', 'type' => 'single', 'answers' => [
                                    ['Conectar cada nivel: negocio, usuario y sistema', true, 'Permite saber qué código cumple qué objetivo.'],
                                    ['Contar cuántos requerimientos hay', false, 'Contar no es trazabilidad.'],
                                    ['Guardarlos en una base de datos', false, 'El almacenamiento no define la trazabilidad.'],
                                    ['Pedir firmas a los interesados', false, 'La firma es aprobación, no trazabilidad.'],
                                ]],
                                ['q' => '¿Qué estados suelen formar el ciclo de vida de un requerimiento?', 'type' => 'multiple', 'answers' => [
                                    ['Identificado y analizado', true, 'Primeras fases del ciclo.'],
                                    ['Aprobado e implementado', true, 'Pasa a construir solo tras aprobarse.'],
                                    ['Verificado y retirado', true, 'Se comprueba y, si deja de servir, se retira.'],
                                    ['Compilado y desplegado', false, 'Eso es del código, no del requerimiento.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Descubrimiento',
                'description' => 'Técnicas para descubrir, escribir y validar requerimientos.',
                'lessons' => [
                    [
                        'slug' => 'tecnicas-de-recoleccion',
                        'title' => 'Técnicas de recolección de requerimientos',
                        'type' => 'article',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Técnicas de recolección de requerimientos'],
                            ['p', 'Los requerimientos no se inventan: se descubren. Entrevistas, talleres, observación, cuestionarios y análisis de datos existentes son las técnicas clásicas. Cada una encaja con un contexto: entrevista para profundizar, taller para alinear grupos, observación para captar lo que nadie verbaliza.'],
                            ['p', 'La escucha activa es la habilidad clave: preguntar por qué, distinguir deseos de necesidades reales y detectar suposiciones. "El informe debe ser bonito" es un deseo; "necesito ver la tendencia de ventas por trimestre" es una necesidad que se traduce a gráfico concreto.'],
                            ['code', 'php', <<<'PHP'
// Plan rápido de descubrimiento
$plan = [
    '1. Identificar interesados'   => 'quién usa, paga y decide',
    '2. Elegir técnica'            => 'entrevista, taller, observación...',
    '3. Preparar preguntas'        => 'abiertas, centradas en el porqué',
    '4. Registrar y resumir'       => 'acta con decisiones y pendientes',
    '5. Validar con el interesado' => 'confirmar el entendimiento',
];
PHP],
                            ['h', 'Técnicas que funcionan'],
                            ['list', [
                                'Entrevistas: profundidad y contexto',
                                'Talleres: alinear varios interesados a la vez',
                                'Observación: ver lo que no se verbaliza',
                                'Cuestionarios: alcance amplio con poco presupuesto',
                                'Análisis de datos y sistemas existentes',
                            ]],
                            ['p', 'Ninguna técnica es suficiente sola: el buen analista combina entrevista (qué dice), observación (qué hace) y revisión de datos (qué hay). Cada fuente valida a las otras y reduce el riesgo de construir sobre una única opinión.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los requerimientos se descubren, no se inventan',
                                'Cada técnica sirve a un contexto',
                                'La escucha activa separa deseos de necesidades',
                                'Combinar fuentes reduce el sesgo de una sola visión',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuándo conviene un taller en lugar de entrevistas individuales?', 'type' => 'single', 'answers' => [
                                    ['Cuando varios interesados deben acordar un alcance', true, 'El taller alinea opiniones y resuelve conflictos en vivo.'],
                                    ['Cuando hay un solo usuario', false, 'Con uno, la entrevista es más eficiente.'],
                                    ['Cuando el presupuesto es mínimo', false, 'El taller suele costar más por el número de asistentes.'],
                                    ['Cuando el proyecto está en producción', false, 'La técnica depende del problema, no del entorno.'],
                                ]],
                                ['q' => '¿Qué ventaja tiene la observación frente a la entrevista?', 'type' => 'multiple', 'answers' => [
                                    ['Capta lo que las personas hacen sin verbalizar', true, 'Ver el trabajo real revela atajos y omisiones.'],
                                    ['Evita que el usuario cuente lo que cree que debes oír', true, 'La práctica suele diferir del discurso.'],
                                    ['Sustituye a los cuestionarios siempre', false, 'No sustituye; cada técnica tiene su uso.'],
                                    ['Garantiza requerimientos completos', false, 'Ninguna técnica garantiza completitud.'],
                                ]],
                                ['q' => '¿Qué separa un deseo de una necesidad de requerimiento?', 'type' => 'single', 'answers' => [
                                    ['La necesidad es observable, medible y traducible a una capacidad', true, 'Porque el deseo es vago ("bonito") y la necesidad es concreta.'],
                                    ['Nada: son lo mismo', false, 'Sí difieren en concreción.'],
                                    ['El deseo siempre se descarta', false, 'Algunos deseos legitiman necesidades.'],
                                    ['La necesidad solo la define el jefe', false, 'La necesidad se descubre, no se ordena.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'requerimientos-ambiguos',
                        'title' => 'Escribir requerimientos sin ambigüedad',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Escribir requerimientos sin ambigüedad'],
                            ['p', 'Un requerimiento ambiguo se interpreta de formas distintas en cada fase del proyecto: el analista lo entiende de una manera, el desarrollador de otra y el cliente de una tercera. El remedio es escribir con verbos concretos, números y condiciones explícitas.'],
                            ['p', 'Evita palabras como "rápido", "fácil", "adecuado" o "etcétera". Usa criterios verificables: 2 segundos, 99,9 %, roles definidos y reglas de negocio cerradas. Cada requerimiento debe poder responderse con sí o no cuando se pruebe.'],
                            ['code', 'php', <<<'PHP'
// Ambiguo
$mal = 'El sistema debe ser rápido y mostrar la información adecuada.';

// Verificable
$bien = [
    'REQ-15: El panel debe cargar el resumen en menos de 2 segundos',
    'con 1 000 suscriptores y un ancho de banda de 50 Mbps.',
    'REQ-16: El panel debe mostrar ventas, clientes nuevos y tasa',
    'de conversión del trimestre seleccionado.',
];
PHP],
                            ['h', 'Plantilla de un buen requerimiento'],
                            ['list', [
                                'Identificador único (REQ-15)',
                                'Sujeto y verbo concreto ("el panel debe mostrar")',
                                'Cantidad y condiciones medibles',
                                'Excepciones y reglas de negocio explícitas',
                                'Criterio de aceptación: cómo se comprueba',
                            ]],
                            ['p', 'Revisa cada requerimiento con dos preguntas: ¿lo entendería igual alguien sin mi contexto? ¿Puedo demostrar con una prueba que se cumple? Si alguna respuesta es no, vuelve a redactarlo. La inversión en redacción se paga en menos malentendidos y menos retrabajo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Ambiguo = versiones distintas en cada fase',
                                'Verbos concretos y cifras verificables',
                                'Identificador único y criterio de aceptación',
                                'Dos preguntas: ¿se entiende solo? ¿se puede probar?',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace verificable a un requerimiento?', 'type' => 'single', 'answers' => [
                                    ['Cifras y condiciones medibles, con criterio de prueba', true, '2 segundos o 99,9 % se comprueban con una prueba.'],
                                    ['Que suene profesional', false, 'El tono no aporta verificabilidad.'],
                                    ['Que use adjetivos como "excelente"', false, 'Los adjetivos vagos son justo el problema.'],
                                    ['Que sea corto', false, 'La brevedad no garantiza precisión.'],
                                ]],
                                ['q' => '¿Cuál de estas palabras conviene evitar al redactar requerimientos?', 'type' => 'multiple', 'answers' => [
                                    ['"Rápido"', true, '¿Rápido respecto a qué y cuánto?'],
                                    ['"Adecuado"', true, '¿Adecuado para quién y según qué?'],
                                    ['"En menos de 2 segundos"', false, 'Eso es medible y verificable.'],
                                    ['"Cada semestre"', false, 'Es una periodicidad concreta.'],
                                ]],
                                ['q' => '¿Por qué un identificador único ayuda al proyecto?', 'type' => 'multiple', 'answers' => [
                                    ['Permite referenciar el requerimiento en tareas y tests', true, 'REQ-15 aparece en la tarea y en la prueba que verifica.'],
                                    ['Facilita la trazabilidad', true, 'Conecta objetivo, implementación y verificación.'],
                                    ['Evita discusiones en las reuniones', false, 'El identificador no evita el debate.'],
                                    ['Sustituye las reuniones', false, 'No sustituye la conversación.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'validacion-de-requerimientos',
                        'title' => 'Validación y aprobación de requerimientos',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Validación y aprobación de requerimientos'],
                            ['p', 'Validar es comprobar que los requerimientos son correctos, completos y factibles antes de construir. Se revisa con los interesados, se prototipa lo dudoso y se confirma que cada requerimiento es trazable, consistente y verificable.'],
                            ['p', 'La aprobación formal cierra el ciclo de análisis: el interesado confirma que el documento refleja lo que necesita. Es un acta de compromiso, no un trámite: a partir de ahí los cambios entran por gestión de cambios, con su coste explícito.'],
                            ['code', 'php', <<<'PHP'
// Checklist de validación
$checklist = [
    'Completitud'   => '¿cubrimos todos los casos y usuarios?',
    'Consistencia'  => '¿ningún requerimiento contradice a otro?',
    'Factibilidad'  => '¿es técnicamente posible y con qué coste?',
    'Verificabilidad' => '¿cada uno tiene prueba de cumplimiento?',
    'Trazabilidad'  => '¿cada nivel conecta con el siguiente?',
];
PHP],
                            ['h', 'Pasos para aprobar'],
                            ['list', [
                                'Revisión conjunta con los interesados',
                                'Prototipo o maqueta para lo dudoso',
                                'Checklist de calidad (completitud, consistencia...)',
                                'Firma o aceptación formal del documento',
                                'Dejar claro el proceso de cambios posterior',
                            ]],
                            ['p', 'Validar no es pedir permiso: es eliminar sorpresas. El prototipo convierte el "me refiero a...". En conversación, y la firma convierte el entendimiento en compromiso. Así, cuando más tarde alguien pida "otra cosa", el cambio se gestiona con su coste, no con sorpresa.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Validar = correctos, completos y factibles',
                                'El prototipo detecta malentendidos barato',
                                'La aprobación formal es un acta de compromiso',
                                'Después de aprobar, los cambios se gestionan formalmente',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué se comprueba al validar requerimientos?', 'type' => 'single', 'answers' => [
                                    ['Que sean completos, consistentes, factibles y verificables', true, 'La checklist de calidad cubre esos cuatro frentes.'],
                                    ['Que el código compile', false, 'La validación ocurre antes de escribir código.'],
                                    ['Que el diseño sea bonito', false, 'No se valida estética.'],
                                    ['Que quepan en una página', false, 'La extensión no es criterio.'],
                                ]],
                                ['q' => '¿Qué papel juega el prototipo en la validación?', 'type' => 'multiple', 'answers' => [
                                    ['Convierte suposiciones en algo visible y rebatible', true, 'El interesado reacciona a lo concreto, no a lo abstracto.'],
                                    ['Detecta malentendidos antes de implementar', true, 'Ver el flujo muestra lo que el texto no decía.'],
                                    ['Sustituye el documento de requerimientos', false, 'Complementa; el documento sigue siendo la fuente.'],
                                    ['Garantiza que el cliente apruebe todo', false, 'No garantiza aprobación, la facilita.'],
                                ]],
                                ['q' => '¿Qué implica la aprobación formal del documento?', 'type' => 'single', 'answers' => [
                                    ['El interesado se compromete a que eso es lo que necesita', true, 'Es un acta de compromiso bidireccional.'],
                                    ['El proyecto no podrá cambiar nunca', false, 'Cambios entran por gestión de cambios, con coste.'],
                                    ['Ya no hacen falta reuniones', false, 'El diálogo continúa.'],
                                    ['El código se escribe solo', false, 'La aprobación no implementa.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 2. Historias de usuario y casos de uso
    // =====================================================================
    [
        'slug' => 'historias-de-usuario-y-casos-de-uso',
        'title' => 'Historias de usuario y casos de uso',
        'description' => 'Modela funcionalidades desde la perspectiva del usuario: historias con criterios de aceptación, épicas y casos de uso con actores y flujos.',
        'category' => 'requerimientos',
        'difficulty' => 'intermediate',
        'duration_hours' => 13,
        'is_free' => true,
        'learning_path' => 'ingenieria-de-requerimientos',
        'learning_path_level' => 2,
        'order' => 2,
        'modules' => [
            [
                'title' => 'Técnicas de modelado',
                'description' => 'Historias de usuario, épicas y casos de uso.',
                'lessons' => [
                    [
                        'slug' => 'historias-de-usuario',
                        'title' => 'Historias de usuario con criterios de aceptación',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Historias de usuario con criterios de aceptación'],
                            ['p', 'Una historia de usuario describe una funcionalidad desde la perspectiva de quien la usa, en una frase: Como [rol], quiero [acción] para [beneficio]. La plantilla fuerza tres decisiones: quién, qué y por qué.'],
                            ['p', 'Los criterios de aceptación son la parte que se prueba: condiciones concretas que determinan si la historia está terminada. Se escriben en formato Given/When/Then (Gherkin) o como lista de condiciones verificables.'],
                            ['code', 'gherkin', <<<'GHERKIN'
Historia:
  Como estudiante,
  quiero inscribirme en un curso con un clic,
  para empezar a aprender de inmediato.

Criterios de aceptación:
  Dado que soy un usuario autenticado
  y el curso tiene plazas disponibles,
  cuando hago clic en "Inscribirme",
  entonces se crea mi matrícula
  y recibo un correo de confirmación.
GHERKIN],
                            ['h', 'Buenas prácticas de historias'],
                            ['list', [
                                'Háblalas desde el rol, no desde el sistema',
                                'Mantén el beneficio explícito',
                                'Criterios de aceptación verificables y específicos',
                                'Historias pequeñas: una semana o menos de trabajo',
                                'Divide antes de implementar, no durante',
                            ]],
                            ['p', 'Una historia sin criterios es una conversación pendiente: el equipo no sabe cuándo estará lista. Los criterios convierten la historia en un contrato de prueba y son la base de los tests de aceptación automatizados.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Plantilla: como / quiero / para',
                                'Los criterios de aceptación definen "terminado"',
                                'Given/When/Then hace los criterios automatizables',
                                'Historias pequeñas y verificables',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué tres elementos exige la plantilla de historia de usuario?', 'type' => 'single', 'answers' => [
                                    ['Rol, acción deseada y beneficio', true, 'Como... quiero... para...'],
                                    ['Título, fecha y autor', false, 'Eso son metadatos, no la historia.'],
                                    ['Código, tests y pull request', false, 'Eso es implementación, no la historia.'],
                                    ['Coste, tiempo y riesgo', false, 'La plantilla no los incluye.'],
                                ]],
                                ['q' => '¿Para qué sirven los criterios de aceptación?', 'type' => 'multiple', 'answers' => [
                                    ['Definen cuándo la historia está terminada', true, 'Son el contrato de "done".'],
                                    ['Permiten probar la historia de forma automatizable', true, 'En Gherkin se convierten en tests de aceptación.'],
                                    ['Evitan conversaciones con el cliente', false, 'Los criterios documentan lo conversado, no lo evitan.'],
                                    ['Aumentan el número de historias', false, 'No es su propósito.'],
                                ]],
                                ['q' => '¿Qué formato usa los pasos Dado/Cuando/Entonces?', 'type' => 'single', 'answers' => [
                                    ['Gherkin', true, 'Es el formato de BDD para criterios de aceptación.'],
                                    ['JSON', false, 'JSON es estructura de datos.'],
                                    ['YAML', false, 'YAML no define ese formato de pasos.'],
                                    ['Markdown', false, 'Markdown es texto plano con marcado.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'casos-de-uso',
                        'title' => 'Casos de uso: actores y flujos',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Casos de uso: actores y flujos'],
                            ['p', 'Un caso de uso describe una interacción completa entre un actor y el sistema para lograr un objetivo: "Inscribirse en un curso" o "Recuperar contraseña". El actor no es un usuario concreto, sino un rol: Estudiante, Administrador, Pasarela de pago.'],
                            ['p', 'Cada caso de uso tiene un flujo principal (el camino feliz) y flujos alternativos (errores, excepciones, variantes). Documentar las alternativas es donde se esconden las reglas de negocio y los casos límite que rompen las demos.'],
                            ['code', 'text', <<<'TEXT'
Caso de uso: Inscribirse en un curso
Actor: Estudiante autenticado

Flujo principal:
  1. El estudiante abre el curso.
  2. El sistema muestra el botón Inscribirse.
  3. El estudiante hace clic.
  4. El sistema crea la matrícula.
  5. El sistema envía el correo de confirmación.

Flujo alternativo 3a: Sin plazas
  3a1. El sistema muestra "Curso completo".
  3a2. El sistema ofrece lista de espera.
TEXT],
                            ['h', 'Partes de un caso de uso'],
                            ['list', [
                                'Actor: rol que interactúa con el sistema',
                                'Objetivo: resultado que el actor busca',
                                'Flujo principal: camino feliz paso a paso',
                                'Flujos alternativos: excepciones y variantes',
                                'Precondiciones y poscondiciones',
                            ]],
                            ['p', 'Los casos de uso brillan con flujos complejos y actores variados; las historias de usuario brillan con conversación y priorización en iteraciones cortas. Muchos equipos los combinan: casos de uso para el alcance general y historias para el detalle iterativo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El actor es un rol, no una persona',
                                'Flujo principal + alternativos = visión completa',
                                'Las alternativas contienen las reglas de negocio',
                                'Casos de uso para alcance; historias para iterar',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un actor en un caso de uso?', 'type' => 'single', 'answers' => [
                                    ['Un rol que interactúa con el sistema', true, 'Estudiante, admin o un sistema externo.'],
                                    ['Un empleado concreto de la empresa', false, 'Es el rol, no la persona.'],
                                    ['El servidor de producción', false, 'El servidor no es un actor, es infraestructura.'],
                                    ['El patrocinador del proyecto', false, 'No interactúa operativamente con el sistema.'],
                                ]],
                                ['q' => '¿Por qué documentar los flujos alternativos?', 'type' => 'multiple', 'answers' => [
                                    ['Ahí viven las excepciones y reglas de negocio', true, 'Sin plazas, sin saldo, permisos denegados...'],
                                    ['Previenen casos límite que rompen la demo', true, 'El camino feliz nunca es el único camino.'],
                                    ['Aumentan la cobertura de pruebas', true, 'Cada alternativa es un test de aceptación.'],
                                    ['Son obligatorios por ley en todo proyecto', false, 'No hay ley que lo exija.'],
                                ]],
                                ['q' => '¿Cuándo combinar casos de uso e historias de usuario?', 'type' => 'single', 'answers' => [
                                    ['Casos de uso para el alcance general e historias para iterar el detalle', true, 'Cada técnica cubre una necesidad distinta.'],
                                    ['Nunca deben combinarse', false, 'Son complementarias en la práctica.'],
                                    ['Solo en proyectos pequeños', false, 'En grandes es donde más se combinan.'],
                                    ['Solo en proyectos de IA', false, 'No tiene relación con la tecnología.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'epicas-historias-y-tareas',
                        'title' => 'Épicas, historias y tareas: del nivel estratégico al táctico',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Épicas, historias y tareas: del nivel estratégico al táctico'],
                            ['p', 'No todo lo que pide el negocio es una historia. Las épicas agrupan funcionalidades amplias ("facturación"), las historias convierten fragmentos en trabajo concreto ("el cliente puede descargar su factura en PDF") y las tareas son las unidades técnicas de implementación.'],
                            ['p', 'La jerarquía no es un trámite: cada nivel responde una pregunta distinta. La épica dice qué problema grande resolvemos; la historia, qué valor entregamos y a quién; la tarea, qué hay que hacer y en cuántas horas. Mantener los tres niveles actualizados conserva la visibilidad del proyecto.'],
                            ['code', 'text', <<<'TEXT'
ÉPICA: Sistema de facturación
├── Historia: El cliente descarga su factura en PDF
│   ├── Tarea: Crear endpoint GET /api/facturas/{id}/pdf
│   ├── Tarea: Generar PDF con la plantilla de la empresa
│   └── Tarea: Test de descarga con factura de prueba
└── Historia: El admin ve el estado de pagos
TEXT],
                            ['h', 'Cómo partir bien'],
                            ['list', [
                                'Épica = problema grande, dividido después',
                                'Historia = valor verificable para un rol',
                                'Tarea = unidad técnica accionable',
                                'Divide hasta que la historia sea de ≤1 semana',
                                'La inversión (INVEST) guía la división',
                            ]],
                            ['p', 'Un buen criterio para dejar de dividir: la historia cabe en un sprint y se puede verificar con sus criterios de aceptación. Seguir partiendo crea micro-tareas sin valor; no partir genera historias eternas que nunca se pueden decir "terminadas".'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Épica → historia → tarea: de estrategia a ejecución',
                                'Cada nivel responde una pregunta distinta',
                                'Historias de ≤1 semana con criterios verificables',
                                'INVEST guía cuándo parar de dividir',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué representa una épica?', 'type' => 'single', 'answers' => [
                                    ['Una funcionalidad amplia que se divide en historias', true, 'Agrupa el problema grande con nombre identificable.'],
                                    ['Una tarea técnica de una línea', false, 'Eso es la tarea.'],
                                    ['Un criterio de aceptación', false, 'Eso pertenece a la historia.'],
                                    ['Un bug de producción', false, 'Un bug se gestiona aparte.'],
                                ]],
                                ['q' => '¿Qué caracteriza a una historia bien dividida?', 'type' => 'multiple', 'answers' => [
                                    ['Entrega valor verificable a un rol', true, 'Tiene sentido por sí misma para el usuario.'],
                                    ['Cabe en una iteración corta', true, 'Se termina y se dice "done".'],
                                    ['Tiene criterios de aceptación', true, 'Se puede probar su cumplimiento.'],
                                    ['Es imposible de estimar', false, 'Si no se puede estimar, no está lista.'],
                                ]],
                                ['q' => '¿Cuál es la unidad técnica accionable de implementación?', 'type' => 'single', 'answers' => [
                                    ['La tarea', true, 'P. ej. "crear endpoint" o "generar PDF".'],
                                    ['La épica', false, 'La épica es estratégica.'],
                                    ['El plan de negocio', false, 'Es otro documento.'],
                                    ['La factura', false, 'Es un artefacto del dominio, no una unidad de trabajo.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Aplicación',
                'description' => 'Criterios con Gherkin, diagramas y backlog.',
                'lessons' => [
                    [
                        'slug' => 'criterios-de-aceptacion-gherkin',
                        'title' => 'Criterios de aceptación con Gherkin',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Criterios de aceptación con Gherkin'],
                            ['p', 'Gherkin expresa criterios de aceptación como ejemplos ejecutables: Dado un contexto, Cuando ocurre la acción, Entonces se produce el resultado, y además Y/Pero encadenan condiciones. Es el formato de BDD y la base de herramientas como Behat en PHP o Cucumber.'],
                            ['p', 'Escribir criterios en Gherkin obliga a pensar en ejemplos, no en generalidades. Un ejemplo concreto ("con 0 plazas") revela reglas que una frase abstracta esconde. Por eso los criterios Gherkin son la mejor especificación ejecutable.'],
                            ['code', 'gherkin', <<<'GHERKIN'
Característica: Inscripción en cursos

  Escenario: Inscribirse con plazas disponibles
    Dado que el curso "Laravel 12" tiene 5 plazas libres
    Y soy un estudiante autenticado
    Cuando hago clic en "Inscribirme"
    Entonces veo la confirmación "¡Inscrito!"
    Y recibo un correo de bienvenida

  Escenario: Curso completo
    Dado que el curso "Laravel 12" tiene 0 plazas libres
    Cuando hago clic en "Inscribirme"
    Entonces veo el aviso "Curso completo"
    Y veo la opción de lista de espera
GHERKIN],
                            ['h', 'Reglas para buenos escenarios'],
                            ['list', [
                                'Un escenario por comportamiento',
                                'Contexto en Dado, acción en Cuando, resultado en Entonces',
                                'Ejemplos concretos, nunca valores vagos',
                                'Cubre el camino feliz y al menos un alternativo',
                                'El lenguaje es legible para negocio y técnico',
                            ]],
                            ['p', 'Los escenarios Gherkin no reemplazan los tests técnicos, pero sí conectan negocio y código: cada escenario se convierte en una prueba de aceptación que el equipo automatiza o ejecuta al menos en cada release. Todos hablan el mismo lenguaje.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Gherkin = ejemplos ejecutables Dado/Cuando/Entonces',
                                'Los ejemplos concretos revelan reglas ocultas',
                                'Un escenario por comportamiento',
                                'Especificación legible para negocio y técnicos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué paso de Gherkin describe la acción del usuario?', 'type' => 'single', 'answers' => [
                                    ['Cuando', true, 'Cuando introduce el estímulo que dispara el comportamiento.'],
                                    ['Dado', false, 'Dado establece el contexto previo.'],
                                    ['Entonces', false, 'Entonces describe el resultado esperado.'],
                                    ['Y', false, 'Y encadena pasos, no define el tipo.'],
                                ]],
                                ['q' => '¿Por qué los ejemplos concretos son mejores que las generalidades?', 'type' => 'multiple', 'answers' => [
                                    ['Revelan reglas de negocio que las frases vagas esconden', true, '"0 plazas" expone el caso límite.'],
                                    ['Son directamente automatizables', true, 'Con datos concretos la prueba se escribe sola.'],
                                    ['Evitan malentendidos entre negocio y equipo', true, 'El ejemplo concreto es inequívoco.'],
                                    ['Acortan el documento siempre', false, 'No siempre acortan; aclaran.'],
                                ]],
                                ['q' => '¿Qué herramienta del ecosistema PHP automatiza escenarios Gherkin?', 'type' => 'single', 'answers' => [
                                    ['Behat', true, 'BDD en PHP con sintaxis Gherkin.'],
                                    ['Pest', false, 'Pest es testing unitario moderno, no Gherkin.'],
                                    ['PHPDoc', false, 'Es documentación de tipos.'],
                                    ['Composer', false, 'Composer gestiona dependencias.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'diagramas-de-casos-de-uso',
                        'title' => 'Diagramas y especificaciones de casos de uso',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Diagramas y especificaciones de casos de uso'],
                            ['p', 'El diagrama de casos de uso (UML) muestra el sistema como una caja, sus actores fuera y las elipses de funcionalidad dentro. Es la foto de quién puede hacer qué; la especificación escrita describe el flujo con detalle.'],
                            ['p', 'El diagrama es excelente para comunicar alcance en una reunión: se ve rápido qué actores existen y qué funcionalidades tocan. Pero se queda corto para el detalle; por eso se acompaña de especificaciones con flujo principal, alternativos, precondiciones y reglas.'],
                            ['code', 'mermaid', <<<'MERMAID'
graph LR
    A[Estudiante] --> CU1(Inscribirse en curso)
    A --> CU2(Descargar certificado)
    AD[Administrador] --> CU3(Gestionar cursos)
    AD --> CU1
    P[Pasarela de pago] --> CU1
MERMAID],
                            ['h', 'Qué debe tener la especificación'],
                            ['list', [
                                'Nombre y objetivo del caso de uso',
                                'Actor principal y actores secundarios',
                                'Precondiciones y poscondiciones',
                                'Flujo principal numerado paso a paso',
                                'Flujos alternativos con referencias cruzadas',
                            ]],
                            ['p', 'Regla importante: el diagrama y la especificación deben estar sincronizados. Un diagrama sin especificación es una promesa; una especificación sin diagrama es invisible para la reunión. Mantener ambos al día es parte del trabajo de análisis.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El diagrama comunica alcance de un vistazo',
                                'La especificación aporta el detalle ejecutable',
                                'Actores, flujos y precondiciones forman el mínimo',
                                'Diagrama y texto deben estar sincronizados',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué muestra el diagrama UML de casos de uso?', 'type' => 'single', 'answers' => [
                                    ['Actores fuera del sistema y funcionalidades como elipses', true, 'Es la foto de "quién puede hacer qué".'],
                                    ['Las tablas de la base de datos', false, 'Eso es un diagrama entidad-relación.'],
                                    ['La arquitectura de microservicios', false, 'Eso es un diagrama de despliegue o componentes.'],
                                    ['El flujo de pantallas de la interfaz', false, 'Eso es un diagrama de navegación.'],
                                ]],
                                ['q' => '¿Por qué el diagrama solo no basta?', 'type' => 'multiple', 'answers' => [
                                    ['No muestra el detalle de los flujos', true, 'La elipse no explica los pasos.'],
                                    ['No documenta alternativas ni excepciones', true, 'Los caminos alternativos viven en el texto.'],
                                    ['No define precondiciones', true, 'Eso va en la especificación escrita.'],
                                    ['No se puede dibujar', false, 'Sí se puede dibujar; es justo el problema: se queda en lo visual.'],
                                ]],
                                ['q' => '¿Qué es una precondición de un caso de uso?', 'type' => 'single', 'answers' => [
                                    ['El estado que debe cumplirse antes de iniciar el flujo', true, 'P. ej. "el estudiante debe estar autenticado".'],
                                    ['El resultado esperado al final', false, 'Eso es la poscondición.'],
                                    ['El nombre del actor', false, 'El actor no es una condición.'],
                                    ['El tiempo estimado de ejecución', false, 'No es una precondición.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'product-backlog-y-estimar',
                        'title' => 'Product Backlog y estimación de historias',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Product Backlog y estimación de historias'],
                            ['p', 'El Product Backlog es la lista ordenada de todo lo que el producto podría ser: historias, épicas, mejoras y correcciones. La priorización y la estimación deciden qué se construye primero; una historia que no está en el backlog no existe para el equipo.'],
                            ['p', 'Estimar no es comprometer una fecha exacta: es comparar complejidad entre historias. Por eso se usan puntos de historia o tallas (S, M, L) con técnicas como Planning Poker, midiendo la incertidumbre, no el reloj.'],
                            ['code', 'text', <<<'TEXT'
Backlog (ordenado por valor/riesgo):
  1. [HIST] Estudiante se inscribe (8 pt)
  2. [HIST] Admin publica un curso (5 pt)
  3. [HIST] Estudiante descarga certificado (13 pt) ← incierta
  4. [BUG]  Correo de bienvenida cae en spam (3 pt)
  5. [ÉPICA] Facturación online (dividir)
TEXT],
                            ['h', 'Buenas prácticas'],
                            ['list', [
                                'Una sola lista priorizada, visible para todos',
                                'Prioriza por valor, riesgo y dependencias',
                                'Estima por comparación relativa, no por horas',
                                'Las historias inciertas se dividen, no se inflan',
                                'La estimación mejora con datos históricos (velocidad)',
                            ]],
                            ['p', 'La estimación más valiosa no es el número, sino la conversación que lo produce: el equipo descubre suposiciones, riesgos y diseño. Por eso se estima en equipo y se revisa con el paso de los sprints para calibrar la velocidad real.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El backlog es la lista priorizada del producto',
                                'Se prioriza por valor, riesgo y dependencias',
                                'Estimación relativa: puntos o tallas, no horas',
                                'La conversación al estimar vale más que el número',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es el Product Backlog?', 'type' => 'single', 'answers' => [
                                    ['La lista priorizada de todo lo que el producto podría ser', true, 'Historias, épicas, bugs y mejoras ordenados por valor.'],
                                    ['El plan financiero del proyecto', false, 'No es un documento financiero.'],
                                    ['La base de datos de la aplicación', false, 'Es un artefacto de producto, no técnico.'],
                                    ['El acta de una reunión', false, 'El backlog es continuo, no un acta puntual.'],
                                ]],
                                ['q' => '¿Por qué se estima con puntos de historia en lugar de horas?', 'type' => 'multiple', 'answers' => [
                                    ['Miden complejidad relativa, no tiempo de reloj', true, 'Comparan una historia con otra.'],
                                    ['Evitan la falsa precisión de las horas', true, 'Las horas sugieren certeza que no existe.'],
                                    ['Suelen ser más estables ante quién implementa', true, 'La complejidad es más objetiva que el cronómetro individual.'],
                                    ['Porque son obligatorios en toda empresa', false, 'No hay obligación; es una elección de método.'],
                                ]],
                                ['q' => '¿Qué se hace con una historia demasiado incierta o grande?', 'type' => 'single', 'answers' => [
                                    ['Se divide en historias más pequeñas y concretas', true, 'Dividir reduce incertidumbre y permite estimar.'],
                                    ['Se elimina del backlog', false, 'Se divide, no se descarta sin más.'],
                                    ['Se estima con un número enorme', false, 'Inflar el número no resuelve la incertidumbre.'],
                                    ['Se implementa inmediatamente', false, 'Implementar lo incierto sin análisis es arriesgado.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 3. Gestión de requerimientos
    // =====================================================================
    [
        'slug' => 'gestion-de-requerimientos',
        'title' => 'Gestión de requerimientos',
        'description' => 'Prioriza con MoSCoW, gestiona el cambio con trazabilidad y comunica con stakeholders como un profesional.',
        'category' => 'requerimientos',
        'difficulty' => 'intermediate',
        'duration_hours' => 11,
        'is_free' => false,
        'learning_path' => 'ingenieria-de-requerimientos',
        'learning_path_level' => 3,
        'order' => 3,
        'modules' => [
            [
                'title' => 'Gestión del cambio',
                'description' => 'Priorización, trazabilidad y control de cambios.',
                'lessons' => [
                    [
                        'slug' => 'priorizacion-moscow',
                        'title' => 'Priorización con MoSCoW',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Priorización con MoSCoW'],
                            ['p', 'MoSCoW clasifica los requerimientos en cuatro categorías: Must have (imprescindibles), Should have (importantes), Could have (deseables) y Won\'t have (fuera de alcance por ahora). Es rápido, compartible y obliga a decir no con claridad.'],
                            ['p', 'La clave no es clasificar sola, sino la conversación que la acompaña: ¿qué pasa si no llevamos este requerimiento? Si el producto pierde sentido, es Must; si duele pero no destruye, Should; si es adorno, Could. Y los Won\'t son decisiones de alcance que deben ser explícitas.'],
                            ['code', 'php', <<<'PHP'
$moscow = [
    'Must'   => 'Estudiante se inscribe y paga con tarjeta',
    'Should' => 'Recibir correo de confirmación en < 5 min',
    'Could'  => 'Comparador de cursos lado a lado',
    'Won\'t' => 'App móvil nativa en el primer release',
];
PHP],
                            ['h', 'Reglas de oro'],
                            ['list', [
                                'Los Must no se negocian: si falta uno, no hay release',
                                'Should y Could se intercambian según el tiempo',
                                'Los Won\'t se dicen en voz alta y se anotan',
                                'Revisar la clasificación en cada hito',
                                'La conversación de "qué pasa si no" guía la decisión',
                            ]],
                            ['p', 'El mayor beneficio de MoSCoW es que saca del territorio de los deseos: en cada revisión se pregunta si la clasificación sigue siendo verdadera. Un Should puede convertirse en Must cuando cambia el contexto, y el proyecto gana porque la decisión fue consciente.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Must, Should, Could y Won\'t: cuatro cestas claras',
                                'La conversación de impacto guía la clasificación',
                                'Los Won\'t son decisiones explícitas de alcance',
                                'Reclasificar en cada hito mantiene el backlog honesto',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué categoría hace que el producto pierda su sentido si no se entrega?', 'type' => 'single', 'answers' => [
                                    ['Must have', true, 'Sin él, la release no se puede publicar.'],
                                    ['Should have', false, 'Duele su ausencia, pero el producto sigue en pie.'],
                                    ['Could have', false, 'Es deseable, no crítico.'],
                                    ['Won\'t have', false, 'Won\'t ni se construye.'],
                                ]],
                                ['q' => '¿Qué diferencia a Should de Could?', 'type' => 'multiple', 'answers' => [
                                    ['Should tiene impacto importante si falta', true, 'El producto funciona, pero queda cojo.'],
                                    ['Could es lo deseable si sobra tiempo', true, 'Adorno o mejora con valor marginal.'],
                                    ['Should siempre se entrega sí o sí', false, 'Se negocia según el tiempo disponible.'],
                                    ['Could es más importante que Must', false, 'Must está por encima siempre.'],
                                ]],
                                ['q' => '¿Por qué es útil decir en voz alta los Won\'t have?', 'type' => 'single', 'answers' => [
                                    ['Evita suposiciones: todos saben qué no se hará y por qué', true, 'El alcance negativo también se comunica.'],
                                    ['Para pedir permiso a cada usuario', false, 'No se pide permiso individual.'],
                                    ['Para ocultar decisiones difíciles', false, 'Es lo contrario: las expone.'],
                                    ['Para cumplir las normas de la empresa', false, 'No es un requisito normativo.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'trazabilidad-y-gestion-del-cambio',
                        'title' => 'Trazabilidad y gestión del cambio',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Trazabilidad y gestión del cambio'],
                            ['p', 'La trazabilidad conecta cada requerimiento con su origen, su implementación y su prueba. Es el hilo que permite responder "¿qué código cumple REQ-15?" o "si cambia esta regla, ¿qué requerimientos toco?" sin adivinar.'],
                            ['p', 'La gestión del cambio es el proceso formal para modificar requerimientos aprobados: cualquiera puede proponer un cambio, pero se evalúa impacto, coste y riesgo antes de aprobarlo. El objetivo no es frenar el cambio, es decidirlo con información.'],
                            ['code', 'php', <<<'PHP'
// Matriz de trazabilidad simplificada
$traza = [
    'REQ-15' => [
        'origen'    => 'Entrevista con Ana (pagos)',
        'diseno'    => 'Pasarela de pago',
        'codigo'    => 'app/Services/PagoService.php',
        'tests'     => 'tests/Feature/PagoTest.php',
        'estado'    => 'Implementado',
    ],
];
PHP],
                            ['h', 'Flujo de un cambio'],
                            ['list', [
                                'Solicitud escrita (qué, por qué, impacto esperado)',
                                'Análisis de impacto: cuáles requerimientos se tocan',
                                'Estimación de coste, tiempo y riesgo',
                                'Decisión informada (aprobar, ajustar o rechazar)',
                                'Actualizar trazabilidad y comunicar a todos',
                            ]],
                            ['p', 'La trazabilidad también protege al equipo: un cambio que llega sin análisis de impacto termina rompiendo funcionalidades que nadie previó. El proceso de cambio es la memoria de por qué se decidió cada modificación.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Trazabilidad: origen → diseño → código → prueba',
                                'El cambio aprobado se gestiona, no se improvisa',
                                'Todo cambio pasa por análisis de impacto',
                                'El proceso documenta la memoria de decisiones',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Para qué sirve la trazabilidad de requerimientos?', 'type' => 'single', 'answers' => [
                                    ['Saber qué código y tests cumplen cada requerimiento', true, 'Conecta origen, diseño, implementación y verificación.'],
                                    ['Contar requerimientos para el reporte', false, 'Contar es un uso menor, no el objetivo.'],
                                    ['Guardar el código en un repositorio', false, 'Git ya hace eso.'],
                                    ['Eliminar requerimientos obsoletos', false, 'La retirada es parte del ciclo, pero no la función principal.'],
                                ]],
                                ['q' => '¿Qué pasos forman parte de la gestión de un cambio?', 'type' => 'multiple', 'answers' => [
                                    ['Solicitud escrita y análisis de impacto', true, 'El cambio entra documentado y con evaluación.'],
                                    ['Estimación de coste y riesgo', true, 'Se decide con números, no con intuición.'],
                                    ['Actualizar trazabilidad y comunicar', true, 'El cambio se refleja y se difunde.'],
                                    ['Implementar sin avisar', false, 'Justo lo contrario del proceso formal.'],
                                ]],
                                ['q' => '¿Cuál es el objetivo de la gestión del cambio?', 'type' => 'single', 'answers' => [
                                    ['Decidir los cambios con información de impacto y coste', true, 'No frenar, sino decidir mejor.'],
                                    ['Bloquear todo cambio nuevo', false, 'Frenar no es el objetivo.'],
                                    ['Subir el presupuesto del proyecto', false, 'No es su propósito.'],
                                    ['Sustituir a la dirección', false, 'Es un proceso de soporte, no de poder.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'matrices-de-trazabilidad',
                        'title' => 'Matrices de trazabilidad y su mantenimiento',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Matrices de trazabilidad y su mantenimiento'],
                            ['p', 'La matriz de trazabilidad es la tabla que cruza requerimientos con orígenes, diseño, código, pruebas y estados. Bien mantenida, contesta al instante: cobertura de pruebas, impacto de un cambio, requerimientos huérfanos o pendientes de verificar.'],
                            ['p', 'La dificultad no es crearla, es mantenerla: una matriz obsoleta miente peor que no tener matriz. La regla es integrarla en el flujo: cada PR actualiza los enlaces de sus requerimientos, y cada revisión de release comprueba la cobertura.'],
                            ['code', 'php', <<<'PHP'
// Estado de la matriz: cobertura por requerimiento
$matriz = [
    'REQ-15' => ['origen' => 'ok', 'codigo' => 'ok', 'tests' => 'ok'],
    'REQ-16' => ['origen' => 'ok', 'codigo' => 'ok', 'tests' => 'pendiente'],
    'REQ-17' => ['origen' => 'ok', 'codigo' => 'pendiente', 'tests' => 'pendiente'],
];
PHP],
                            ['h', 'Mantener la matriz viva'],
                            ['list', [
                                'Una matriz obsoleta es peor que ninguna',
                                'Actualizar en el momento del PR, no al final',
                                'Cada requerimiento conduce a su prueba',
                                'Revisar huérfanos: requerimientos sin código o sin test',
                                'Automáticar en lo posible (IDs en tests, análisis estático)',
                            ]],
                            ['p', 'Las herramientas modernas ayudan: IDs de requerimientos en los nombres de tests, enlaces en los commits y dashboards que calculan cobertura. Pero la cultura del equipo decide si la matriz se actualiza de verdad.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Cruza requerimiento con origen, código, test y estado',
                                'Mantenerla al día vale más que crearla',
                                'Los huérfanos denuncian trabajo sin cobertura',
                                'Automatización + disciplina del equipo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el mayor riesgo de una matriz de trazabilidad mal mantenida?', 'type' => 'single', 'answers' => [
                                    ['Mentir: indica cobertura que no existe', true, 'La confianza en la matriz se derrumba y deja de usarse.'],
                                    ['Ocupar demasiado disco', false, 'El peso no es el problema.'],
                                    ['Ralentizar el compilador', false, 'No participa en la compilación.'],
                                    ['Publicar secretos', false, 'No contiene secretos necesariamente y no es su riesgo principal.'],
                                ]],
                                ['q' => '¿Cuándo conviene actualizar la matriz?', 'type' => 'multiple', 'answers' => [
                                    ['En cada PR que toca un requerimiento', true, 'Es el momento con contexto fresco.'],
                                    ['Al revisar la release', true, 'Verificación final de cobertura.'],
                                    ['Solo cuando el cliente lo pide', false, 'Eso garantiza obsolescencia.'],
                                    ['Al final del proyecto', false, 'Demasiado tarde para que sirva.'],
                                ]],
                                ['q' => '¿Qué es un requerimiento huérfano en la matriz?', 'type' => 'single', 'answers' => [
                                    ['Un requerimiento sin código o sin prueba asociada', true, 'Algo prometido que nadie implementó ni verificó.'],
                                    ['Un requerimiento muy largo', false, 'La extensión no lo hace huérfano.'],
                                    ['Un requerimiento duplicado', false, 'Eso es un duplicado, otro problema.'],
                                    ['Un requerimiento aprobado dos veces', false, 'Mismo caso: duplicado, no huérfano.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Comunicación y herramientas',
                'description' => 'Solicitudes de cambio, stakeholders y herramientas de gestión.',
                'lessons' => [
                    [
                        'slug' => 'solicitudes-de-cambio',
                        'title' => 'Solicitudes de cambio y control de versiones de requerimientos',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Solicitudes de cambio y control de versiones de requerimientos'],
                            ['p', 'Una solicitud de cambio (SCR) formaliza la petición de modificar algo aprobado: quién la pide, qué cambia, por qué y qué impacto estima. El control de versiones del documento de requerimientos permite ver qué versión se aprobó, qué cambió y cuándo.'],
                            ['p', 'Versionar requerimientos no es burocracia: es historia. Cuando un problema aparece meses después, saber qué versión del alcance estaba vigente en cada release permite atribuir decisiones y entender el sistema actual.'],
                            ['code', 'php', <<<'PHP'
$solicitud = [
    'id'      => 'SCR-007',
    'fecha'   => '2026-09-24',
    'solicita'=> 'Producto (María)',
    'cambio'  => 'Permitir pago con PayPal en el checkout',
    'impacto' => 'Toca REQ-15 (pagos); +3 días; riesgo bajo',
    'estado'  => 'En evaluación',
];
PHP],
                            ['h', 'Componentes de una SCR'],
                            ['list', [
                                'Identificador y fecha',
                                'Descripción clara del cambio',
                                'Motivo o caso de negocio',
                                'Impacto en requerimientos, código y pruebas',
                                'Estimación de coste y riesgo',
                                'Decisión y trazabilidad posterior',
                            ]],
                            ['p', 'Convención sana: los cambios se versionan como el código. El documento de requerimientos con etiquetas (v1.2) y changelog indica qué cambió en cada versión. La combinación SCR + versionado da la respuesta completa a "¿por qué es así?".'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La SCR formaliza qué, por qué e impacto',
                                'Versionar requerimientos guarda la historia de decisiones',
                                'El changelog del documento acompaña cada versión',
                                'SCR + versionado = respuesta al "¿por qué es así?"',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué debe incluir una solicitud de cambio?', 'type' => 'single', 'answers' => [
                                    ['Descripción, motivo, impacto y estimación', true, 'Los datos que permiten decidir con información.'],
                                    ['Solo el nombre de la persona que la pide', false, 'Sin impacto no hay decisión posible.'],
                                    ['El código fuente del cambio', false, 'Se evalúa antes de implementar.'],
                                    ['La opinión del equipo de ventas', false, 'El negocio importa, pero la SCR es más amplia.'],
                                ]],
                                ['q' => '¿Qué beneficio da versionar el documento de requerimientos?', 'type' => 'multiple', 'answers' => [
                                    ['Saber qué versión del alcance rigió cada release', true, 'Cada versión se corresponde con entregas.'],
                                    ['Atribuir decisiones y entender el sistema actual', true, 'El historial explica el presente.'],
                                    ['Cumplir un estándar ISO automáticamente', false, 'Ayuda a auditorías, pero no es automático.'],
                                    ['Eliminar la necesidad de reuniones', false, 'No sustituye la conversación.'],
                                ]],
                                ['q' => '¿Qué problema evita el control de cambios formal?', 'type' => 'single', 'answers' => [
                                    ['Cambios silenciosos que rompen alcance sin aviso', true, 'Todo cambio queda registrado y evaluado.'],
                                    ['Que haya demasiadas reuniones', false, 'Las reuniones son otro tema.'],
                                    ['Que el código sea feo', false, 'Estilo de código no depende de la gestión de cambios.'],
                                    ['Que se instale mal el servidor', false, 'No tiene relación.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'comunicacion-con-stakeholders',
                        'title' => 'Comunicación efectiva con stakeholders',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Comunicación efectiva con stakeholders'],
                            ['p', 'Los stakeholders son las personas con interés o influencia en el proyecto: clientes, usuarios, dirección, operaciones. Cada grupo habla un idioma distinto —negocio, producto, tecnología— y el analista traduce entre ellos sin perder la esencia.'],
                            ['p', 'La comunicación efectiva no es informar más, sino alinear expectativas: qué se entrega, qué no, cuándo y cómo se decidirá. Un stakeholder bien informado aprueba con criterio; uno sorprendido bloquea en el peor momento.'],
                            ['code', 'php', <<<'PHP'
// Matriz de comunicación simple
$comunicacion = [
    'Dirección'    => ['frecuencia' => 'Mensual', 'formato' => 'Resumen ejecutivo'],
    'Producto'     => ['frecuencia' => 'Semanal', 'formato' => 'Backlog y demos'],
    'Operaciones'  => ['frecuencia' => 'Por hito', 'formato' => 'Plan de despliegue'],
    'Usuarios'     => ['frecuencia' => 'Iteración', 'formato' => 'Demos y encuestas'],
];
PHP],
                            ['h', 'Buenas prácticas'],
                            ['list', [
                                'Mapear stakeholders y su interés/influencia',
                                'Adaptar el formato a la audiencia',
                                'Reportar avances, riesgos y decisiones',
                                'Decir lo que NO se hará, también cuenta',
                                'Confirmar acuerdos por escrito tras las reuniones',
                            ]],
                            ['p', 'La regla que más conflictos evita: los acuerdos importantes se confirman por escrito (acta, correo, herramienta). No por desconfianza, sino porque la memoria humana reinterpreta; el documento fija la versión oficial del acuerdo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Cada stakeholder habla su idioma: traduce, no repitas',
                                'Alinear expectativas vale más que informar',
                                'Los no-acuerdos también se comunican',
                                'Confirmar acuerdos por escrito evita reinterpretaciones',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué significa adaptar la comunicación al stakeholder?', 'type' => 'single', 'answers' => [
                                    ['Usar el lenguaje y el detalle que cada audiencia necesita', true, 'Resumen para dirección, detalle para producto.'],
                                    ['Enviar el mismo informe a todos', false, 'Eso es genérico, no adaptado.'],
                                    ['Hablar solo de tecnología', false, 'La dirección no necesita el detalle técnico.'],
                                    ['Evitar hablar con nadie', false, 'La comunicación es parte del trabajo.'],
                                ]],
                                ['q' => '¿Por qué confirmar acuerdos por escrito?', 'type' => 'multiple', 'answers' => [
                                    ['La memoria reinterpreta; el documento fija la versión', true, 'El texto es la referencia estable.'],
                                    ['Queda evidencia para decisiones futuras', true, 'Ayuda a resolver malentendidos meses después.'],
                                    ['Para tener algo que citar en una discusión', true, 'La trazabilidad de acuerdos facilita la gestión.'],
                                    ['Porque las reuniones no sirven para nada', false, 'Las reuniones sirven; el acta las consolida.'],
                                ]],
                                ['q' => '¿Qué debe incluir la comunicación de avance?', 'type' => 'multiple', 'answers' => [
                                    ['Avances reales del periodo', true, 'Qué se completó y qué sigue.'],
                                    ['Riesgos y decisiones pendientes', true, 'La transparencia anticipa problemas.'],
                                    ['Qué no se hará y por qué', true, 'El alcance negativo es información clave.'],
                                    ['Detalles internos de cada línea de código', false, 'Eso es ruido para la mayoría de stakeholders.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'herramientas-de-gestion',
                        'title' => 'Herramientas y métricas en gestión de requerimientos',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Herramientas y métricas en gestión de requerimientos'],
                            ['p', 'Las herramientas —Jira, Linear, Azure DevOps, Notion— guardan el backlog, los estados y la trazabilidad de cada requerimiento. La buena herramienta no sustituye el proceso: lo hace visible. Si nadie actualiza estados, cualquier herramienta es un cementerio de tickets.'],
                            ['p', 'Las métricas de gestión convierten el proceso en aprendizaje: velocidad del equipo, ratio de cambios aprobados, tiempo medio de revisión o porcentaje de requerimientos verificados en cada release. Mete pocas métricas, pero que se usen para decidir.'],
                            ['code', 'php', <<<'PHP'
$metricas = [
    'Velocidad por sprint'      => 'puntos completados / sprint',
    'Ratio de cambios'          => 'SCR aprobadas / requerimientos',
    'Tiempo medio de aprobación'=> 'días entre solicitud y decisión',
    'Cobertura de trazabilidad' => '% requerimientos con test asociado',
    'Requerimientos por release'=> 'entregados y verificados',
];
PHP],
                            ['h', 'Qué mirar (y qué no)'],
                            ['list', [
                                'Velocidad real para planificar con datos',
                                'Ratio de cambios para detectar alcance inestable',
                                'Tiempo de aprobación para agilizar decisiones',
                                'Cobertura de trazabilidad para calidad del proceso',
                                'Evita métricas de actividad (tickets cerrados) sin contexto',
                            ]],
                            ['p', 'La métrica más peligrosa es la que se convierte en objetivo sin matices: "cerrar X tickets" incentiva tickets pequeños e inútiles. Mejor métricas de resultado: ¿cuánto del valor planificado llegó a los usuarios y se verificó?'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La herramienta hace visible el proceso, no lo sustituye',
                                'Pocas métricas, pero que se usen para decidir',
                                'Mide resultado, no actividad vacía',
                                'Velocidad real > estimaciones optimistas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué papel juega la herramienta de gestión en el proceso?', 'type' => 'single', 'answers' => [
                                    ['Hacer visible el proceso, no sustituirlo', true, 'El estado y la trazabilidad se ven; la disciplina la ponen las personas.'],
                                    ['Decidir automáticamente los cambios', false, 'Las decisiones son humanas.'],
                                    ['Escribir los requerimientos solos', false, 'La herramienta no descubre requerimientos.'],
                                    ['Garantizar que no haya conflictos', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Qué problema trae convertir "tickets cerrados" en el objetivo?', 'type' => 'multiple', 'answers' => [
                                    ['Se incentiva dividir el trabajo en tickets diminutos', true, 'La métrica se juega, el valor se pierde.'],
                                    ['Mejora aparente sin entrega real de valor', true, 'La actividad no es resultado.'],
                                    ['El equipo deja de priorizar por valor', true, 'Prioriza el número, no el impacto.'],
                                    ['La herramienta se vuelve más rápida', false, 'La velocidad de la herramienta no depende de eso.'],
                                ]],
                                ['q' => '¿Qué métrica ayuda a detectar un alcance inestable?', 'type' => 'single', 'answers' => [
                                    ['Ratio de solicitudes de cambio aprobadas', true, 'Muchos cambios seguidos señalan alcance poco claro.'],
                                    ['Número de reuniones', false, 'El número en sí no indica inestabilidad.'],
                                    ['Cafés consumidos en la oficina', false, 'Sin relación.'],
                                    ['Líneas de código escritas', false, 'No mide estabilidad de alcance.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
