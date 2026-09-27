<?php

/*
 * Cursos de desarrollo con IA.
 */

return [
    // =====================================================================
    // 1. Introducción a la IA para desarrolladores
    // =====================================================================
    [
        'slug' => 'introduccion-ia-para-desarrolladores',
        'title' => 'Introducción a la IA para desarrolladores',
        'description' => 'Entiende qué son los modelos de lenguaje, cómo funcionan las APIs de IA y los tokens, y cómo integrarlos con límites y responsabilidad.',
        'category' => 'ia',
        'difficulty' => 'beginner',
        'duration_hours' => 12,
        'is_free' => true,
        'learning_path' => 'desarrollo-con-ia',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'Conceptos',
                'description' => 'Qué son los LLMs, los tokens y las capacidades de cada modelo.',
                'lessons' => [
                    [
                        'slug' => 'que-es-un-llm',
                        'title' => '¿Qué es un modelo de lenguaje grande (LLM)?',
                        'type' => 'article',
                        'duration' => 16,
                        'preview' => true,
                        'blocks' => [
                            ['h', '¿Qué es un modelo de lenguaje grande (LLM)?'],
                            ['p', 'Un LLM es un modelo estadístico entrenado con enormes cantidades de texto para predecir la siguiente palabra (token) probable. Esa habilidad, repetida a gran escala, produce textos coherentes, resúmenes, código y respuestas a preguntas.'],
                            ['p', 'No es un buscador ni una base de datos: no "recuerda" tu conversación ni sabe los hechos actuales salvo lo que su entrenamiento y el contexto que le des contengan. Por eso hay que tratarlo como un motor estadístico, potente pero falible.'],
                            ['code', 'php', <<<'PHP'
// Lo mínimo que debes saber
$llm = [
    'entrada' => 'tokens (fragmentos de texto)',
    'salida'  => 'tokens predichos de forma estadística',
    'memoria' => 'limitada al contexto que le envías',
    'riesgo'  => 'puede inventar hechos (alucinaciones)',
    'fuerza'  => 'resúmenes, código, borradores, traducciones',
];
PHP],
                            ['h', 'Propiedades de los LLMs'],
                            ['list', [
                                'Predicen el siguiente token con probabilidades',
                                'Generalizan patrones aprendidos del texto',
                                'Su conocimiento se congela al terminar el entrenamiento',
                                'Responden según el contexto que reciben (prompt)',
                                'Pueden equivocarse con total seguridad aparente',
                            ]],
                            ['p', 'En la práctica, un LLM es el primer componente que "habla" tu idioma sin programación explícita. Tu trabajo como desarrollador es darle contexto claro, validar sus salidas y acotar sus errores con diseño: ni fe ciega, ni desprecio.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Predicción estadística de tokens, no inteligencia mágica',
                                'El conocimiento se congela tras el entrenamiento',
                                'Todo lo que sabe entra por el contexto que le das',
                                'Alucina: valida siempre sus salidas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace internamente un LLM al generar texto?', 'type' => 'single', 'answers' => [
                                    ['Predice el siguiente token más probable', true, 'Genera texto token a token con probabilidades.'],
                                    ['Busca en una base de datos', false, 'No consulta una BD.'],
                                    ['Consulta internet en tiempo real', false, 'No navega salvo que se le conecte una herramienta.'],
                                    ['Traduce de un idioma a otro', false, 'La traducción es una aplicación, no su mecanismo.'],
                                ]],
                                ['q' => '¿Qué es una alucinación?', 'type' => 'multiple', 'answers' => [
                                    ['Una respuesta falsa dicha con seguridad', true, 'El modelo inventa hechos sin saberlo.'],
                                    ['Un error de contenido plausible', true, 'Suena consistente, pero es incorrecto.'],
                                    ['Una consulta a internet', false, 'No es una consulta.'],
                                    ['Un fallo del servidor', false, 'No es un problema de infraestructura.'],
                                ]],
                                ['q' => '¿Hasta dónde llega el conocimiento de un LLM?', 'type' => 'single', 'answers' => [
                                    ['Hasta su fecha de entrenamiento y el contexto que recibe', true, 'Se congela y solo entra nuevo conocimiento por el prompt.'],
                                    ['Hasta el día de hoy siempre', false, 'No actualiza solo su conocimiento.'],
                                    ['Todo el conocimiento humano infinito', false, 'Es estadístico y limitado.'],
                                    ['Solo lo que hay en tu servidor', false, 'Depende del modelo, no de tu servidor.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'apis-de-ia-y-tokens',
                        'title' => 'APIs de IA y tokens',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'APIs de IA y tokens'],
                            ['p', 'Integrar IA en tu aplicación es, en su forma más simple, una llamada HTTP: envías un prompt a la API de un proveedor (OpenAI, Anthropic, Google, Mistral...) y recibes una respuesta. La unidad de coste y de medición es el token.'],
                            ['p', 'Los tokens son fragmentos de palabras; un texto de 1 000 palabras puede ser ~1 300 tokens según idioma. Pagas por tokens de entrada (tu prompt + contexto) y de salida (la respuesta). Por eso prompts largos cuestan más y hay que diseñarlos con intención.'],
                            ['code', 'php', <<<'PHP'
use Illuminate\Support\Facades\Http;

$respuesta = Http::withToken(config('services.openai.key'))
    ->post('https://api.openai.com/v1/chat/completions', [
        'model'    => 'gpt-4o-mini',
        'messages' => [
            ['role' => 'system', 'content' => 'Eres un tutor de Laravel conciso.'],
            ['role' => 'user', 'content' => 'Explica qué es un middleware en 2 líneas.'],
        ],
        'temperature' => 0.3,
    ]);

$texto = $respuesta->json('choices.0.message.content');
$usage = $respuesta->json('usage'); // tokens de entrada y salida
PHP],
                            ['h', 'Conceptos de API'],
                            ['list', [
                                'Token: unidad de texto y de coste',
                                'Entrada (prompt) y salida (respuesta) se cobran por separado',
                                'temperature: controla creatividad (0-1)',
                                'max_tokens: limita la longitud de la respuesta',
                                'Cada proveedor tiene su API y su SDK',
                            ]],
                            ['p', 'En Laravel, encapsula la llamada en un servicio (AiService) con timeout, reintentos y validación de respuesta. Así el resto de la aplicación no sabe ni le importa qué proveedor hay detrás: hoy OpenAI, mañana otro.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Integrar IA = llamada HTTP con prompt y respuesta',
                                'Pagar por tokens de entrada y salida',
                                'temperature y max_tokens controlan el resultado',
                                'Encapsula el proveedor en un servicio propio',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un token en las APIs de IA?', 'type' => 'single', 'answers' => [
                                    ['Una unidad de texto que también define el coste', true, 'Prompts y respuestas se miden y cobran en tokens.'],
                                    ['Una sesión de usuario', false, 'No es una sesión.'],
                                    ['Una cabecera HTTP', false, 'Es una unidad de texto, no una cabecera.'],
                                    ['Un modelo concreto', false, 'Los modelos se nombran, no se tokenizan.'],
                                ]],
                                ['q' => '¿Qué controla la temperatura del modelo?', 'type' => 'multiple', 'answers' => [
                                    ['La creatividad o aleatoriedad de la respuesta', true, 'Baja = determinista; alta = variada.'],
                                    ['El determinismo para tareas técnicas', true, 'Con 0.1-0.3 el código sale más estable.'],
                                    ['La velocidad del servidor', false, 'No afecta a la latencia.'],
                                    ['El número de tokens máximo', false, 'Eso es max_tokens.'],
                                ]],
                                ['q' => '¿Por qué encapsular el proveedor de IA en un servicio?', 'type' => 'single', 'answers' => [
                                    ['Cambiar de proveedor sin tocar el resto de la app', true, 'La app habla con tu servicio, no con cada API.'],
                                    ['Porque Laravel lo obliga', false, 'Es una buena práctica, no una obligación.'],
                                    ['Para pagar menos tokens', false, 'No reduce el coste.'],
                                    ['Para evitar el HTTP', false, 'La llamada sigue siendo HTTP.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'tipos-de-modelos-y-capacidades',
                        'title' => 'Tipos de modelos y sus capacidades',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Tipos de modelos y sus capacidades'],
                            ['p', 'Los modelos se clasifican por tamaño (small, medium, large), modalidad (texto, imagen, audio, multimodal) y propósito (chat, instrucción, embedding, visión). Elegir el modelo correcto es una decisión de producto: no necesitas el más grande para tareas simples.'],
                            ['p', 'Los modelos pequeños (mini, flash, haiku) responden más rápido y más barato, y se quedan cortos en razonamiento complejo. Los grandes (opus, pro, sonnet) razonan mejor, pero cuestan más. Los embeddings convierten texto en vectores para búsqueda semántica.'],
                            ['code', 'php', <<<'PHP'
// Tabla mental de elección
$eleccion = [
    'Tarea simple (resumir, clasificar)' => 'modelo pequeño y barato',
    'Código y razonamiento complejo'     => 'modelo grande',
    'Búsqueda semántica'                 => 'modelo de embeddings',
    'Imágenes'                           => 'modelo multimodal/visión',
    'Audio'                              => 'modelo de voz (STT/TTS)',
];
PHP],
                            ['h', 'Dimensiones para elegir'],
                            ['list', [
                                'Tamaño: coste, latencia y capacidad de razonamiento',
                                'Modalidad: texto, imagen, audio, multimodal',
                                'Contexto: cuántos tokens admite (8k, 128k, 1M...)',
                                'Precio: entrada, salida y caché',
                                'Latencia: crítica en UX en tiempo real',
                            ]],
                            ['p', 'Comienza con el modelo más pequeño que cumpla la tarea y sube solo si la calidad no alcanza. Mide con ejemplos reales, no con impresiones: un conjunto fijo de prompts de prueba te dirá cuándo el pequeño no da la talla.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Tamaño, modalidad, contexto y precio guían la elección',
                                'El modelo pequeño bien medido ahorra coste y latencia',
                                'Embeddings para búsqueda semántica',
                                'Evalúa con un set fijo de prompts, no con impresiones',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué modelo conviene para una tarea de razonamiento complejo?', 'type' => 'single', 'answers' => [
                                    ['Un modelo grande con capacidad de razonamiento', true, 'Los grandes rinden mejor en lógica, a mayor coste.'],
                                    ['Cualquier modelo pequeño', false, 'Se quedan cortos en razonamiento complejo.'],
                                    ['Un modelo de embeddings', false, 'Los embeddings son para búsqueda, no razonamiento.'],
                                    ['Solo modelos de imagen', false, 'No aplica.'],
                                ]],
                                ['q' => '¿Para qué sirven los modelos de embeddings?', 'type' => 'multiple', 'answers' => [
                                    ['Convertir texto en vectores numéricos', true, 'Representan el significado de forma geométrica.'],
                                    ['Hacer búsqueda semántica por similitud', true, 'Texto parecido = vectores cercanos.'],
                                    ['Generar imágenes', false, 'Eso es difusión, no embeddings.'],
                                    ['Transcribir audio', false, 'Eso es STT.'],
                                ]],
                                ['q' => '¿Qué estrategia se recomienda al elegir modelo?', 'type' => 'single', 'answers' => [
                                    ['Empezar con el más pequeño que cumpla y subir solo si falla', true, 'Optimiza coste y latencia con evidencia.'],
                                    ['Usar siempre el modelo más grande', false, 'Caro y lento sin necesidad.'],
                                    ['Elegir por el nombre más moderno', false, 'El nombre no define el ajuste.'],
                                    ['Evitar medir calidad', false, 'La medición es imprescindible.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Aplicación práctica',
                'description' => 'Integración, límites y ética del uso de IA.',
                'lessons' => [
                    [
                        'slug' => 'integrar-ia-en-aplicaciones',
                        'title' => 'Integrar IA en tus aplicaciones',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Integrar IA en tus aplicaciones'],
                            ['p', 'Integrar un LLM en una aplicación real exige más que una llamada HTTP: manejar errores, timeouts y respuestas inválidas; aplicar rate limits; y diseñar una UX que comunique procesamiento y fallos. La IA es un servicio externo más, con sus particularidades.'],
                            ['p', 'Patrón recomendado: un servicio (AiClient) con timeout y reintentos, una capa de orquestación (que arma el prompt y valida la salida), y una respuesta tipada para el resto de la app. Así la IA puede fallar sin tumbar la aplicación.'],
                            ['code', 'php', <<<'PHP'
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    public function completar(string $system, string $usuario): string
    {
        $respuesta = Http::timeout(30)
            ->retry(2, 1000)
            ->withToken(config('services.ia.key'))
            ->post(config('services.ia.url'), [
                'model'    => config('services.ia.model'),
                'messages' => [
                    ['role' => 'system', 'content' => $system],
                    ['role' => 'user', 'content' => $usuario],
                ],
            ]);

        if ($respuesta->failed()) {
            Log::error('IA falló', ['status' => $respuesta->status()]);
            throw new AiException('No se pudo generar el contenido.');
        }

        return $respuesta->json('choices.0.message.content');
    }
}
PHP],
                            ['h', 'Consideraciones de integración'],
                            ['list', [
                                'Timeout y reintentos en cada llamada',
                                'Manejar errores tipados (AiException)',
                                'Rate limits del proveedor y backoff',
                                'Validar la estructura de la respuesta',
                                'UX honesta: indicador de procesamiento y fallo',
                            ]],
                            ['p', 'Si la respuesta alimenta un flujo crítico (generar un quiz, resumir un documento), valida contra un esquema: JSON con campos esperados, longitud mínima, contenido sin palabras prohibidas. Nunca insertes la salida del modelo en tu base de datos sin validar.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La IA es un servicio externo: timeout, retry, errores',
                                'Separa cliente, orquestación y respuesta tipada',
                                'Valida siempre la salida del modelo',
                                'La UX debe comunicar procesamiento y fallos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué debe hacer tu aplicación si la API de IA no responde?', 'type' => 'multiple', 'answers' => [
                                    ['Reintentar con backoff', true, 'Aguantar fallos transitorios.'],
                                    ['Fallar con un error controlado y mensaje claro', true, 'Nunca dejar la app en estado indefinido.'],
                                    ['Esperar indefinidamente', false, 'Un timeout evita bloqueos.'],
                                    ['Mostrar un error genérico sin registro', false, 'Conviene loggear para diagnosticar.'],
                                ]],
                                ['q' => '¿Por qué validar la salida del modelo antes de guardarla?', 'type' => 'single', 'answers' => [
                                    ['El modelo puede devolver texto malformado o inesperado', true, 'Validar contra un esquema evita datos basura.'],
                                    ['Porque Laravel lo obliga', false, 'Es una buena práctica, no una obligación.'],
                                    ['Para reducir la latencia', false, 'Validar no acelera; protege.'],
                                    ['Para pagar menos', false, 'No afecta al coste.'],
                                ]],
                                ['q' => '¿Qué patrón se recomienda al integrar un proveedor de IA?', 'type' => 'multiple', 'answers' => [
                                    ['Un servicio cliente con timeout y reintentos', true, 'Maneja la llamada externa con robustez.'],
                                    ['Una capa de orquestación que arma y valida', true, 'Separa prompt y validación del resto.'],
                                    ['Llamadas directas dispersas por la app', false, 'Dispersas = difícil de mantener y testear.'],
                                    ['Ignorar por completo los fallos', false, 'Los fallos se gestionan, no se ignoran.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'limites-y-alucinaciones',
                        'title' => 'Límites, sesgos y alucinaciones',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Límites, sesgos y alucinaciones'],
                            ['p', 'Los LLMs no saben lo que no saben: producen respuestas plausibles incluso cuando son falsas (alucinaciones) y reflejan sesgos presentes en su entrenamiento. Conocer estos límites define qué tareas delegarles y con qué salvaguardas.'],
                            ['p', 'Un modelo no distingue entre hecho aprendido y contexto previo; si le hablas de un "documento adjunto" que no existe, puede actuar como si existiera. Por eso los sistemas serios anclan la IA a fuentes verificadas (RAG) y exigen citas cuando el contenido se usa como hecho.'],
                            ['code', 'php', <<<'PHP'
$salvaguardas = [
    'Anclar a fuentes'        => 'RAG: dar contexto verificado en el prompt',
    'Pedir citas'             => 'solicitar referencias del contenido',
    'Confianza escalonada'    => 'revisión humana para outputs críticos',
    'Pruebas de sesgo'        => 'evaluar respuestas con casos diversos',
    'Prompt de límites'       => 'decir "si no lo sabes, dilo"',
];
PHP],
                            ['h', 'Límites que debes gestionar'],
                            ['list', [
                                'Alucinaciones: hechos inventados con seguridad',
                                'Sesgos: prejuicios heredados del entrenamiento',
                                'Conocimiento congelado: desactualización',
                                'Contexto finito: caben pocas páginas en el prompt',
                                'Sin verdad ni creencia: todo es predicción',
                            ]],
                            ['p', 'La regla de diseño: cuanto más grave es el error, más supervisión humana. Un resumen interno puede automatizarse al 100 %; un diagnóstico médico o una decisión legal, nunca sin revisión. La IA acelera, pero la responsabilidad sigue siendo humana.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Las alucinaciones son inevitables: diseña la validación',
                                'Los sesgos del entrenamiento se filtran a las respuestas',
                                'Ancla a fuentes verificadas para hechos',
                                'Gravedad alta = supervisión humana obligatoria',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es una alucinación de un LLM?', 'type' => 'single', 'answers' => [
                                    ['Una respuesta falsa presentada con total seguridad', true, 'El modelo genera texto plausible sin base real.'],
                                    ['Un error de conexión', false, 'Es un error de red, no de contenido.'],
                                    ['Una respuesta demasiado larga', false, 'La longitud no es alucinación.'],
                                    ['Un modelo que no responde', false, 'No responder no es alucinar.'],
                                ]],
                                ['q' => '¿Qué técnica ancla la IA a fuentes verificadas?', 'type' => 'multiple', 'answers' => [
                                    ['RAG (generación aumentada por recuperación)', true, 'Inyecta documentos relevantes en el prompt.'],
                                    ['Proveer contexto real en el prompt', true, 'La base de la generación con fundamento.'],
                                    ['Pedir citas de las fuentes', true, 'Obliga a referenciar el origen.'],
                                    ['Aumentar la temperatura a 1', false, 'Más creatividad empeora el problema.'],
                                ]],
                                ['q' => '¿Cuándo es obligatoria la supervisión humana?', 'type' => 'single', 'answers' => [
                                    ['Cuando el error tiene consecuencias graves', true, 'Médico, legal, financiero: revisión humana siempre.'],
                                    ['Nunca, la IA es suficiente', false, 'La responsabilidad no se delega.'],
                                    ['Solo si el cliente la pide', false, 'La gravedad del error, no el cliente, manda.'],
                                    ['Solo en proyectos grandes', false, 'La gravedad, no el tamaño.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'etica-y-uso-responsable',
                        'title' => 'Ética y uso responsable de la IA',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Ética y uso responsable de la IA'],
                            ['p', 'Usar IA con responsabilidad significa decidir conscientemente qué tareas automatizamos, con qué datos y con qué transparencia. No todo lo técnicamente posible es deseable: la opacidad, el sesgo y la pérdida de privacidad son costes reales.'],
                            ['p', 'Tres preguntas guían cada decisión: ¿qué datos alimentan el modelo y de dónde vienen? ¿Puede la respuesta dañar o engañar a alguien? ¿El usuario sabe que interactúa con una IA y cuándo interviene un humano?'],
                            ['code', 'php', <<<'PHP'
$checklistEtica = [
    'Privacidad'     => '¿Enviamos solo los datos imprescindibles?',
    'Transparencia'  => '¿El usuario sabe que hay IA y su límite?',
    'Sesgo'          => '¿Probamos con casos diversos?',
    'Supervisión'    => '¿Dónde está la revisión humana?',
    'Retención'      => '¿Cuánto guarda el proveedor y dónde?',
];
PHP],
                            ['h', 'Principios prácticos'],
                            ['list', [
                                'Envía el mínimo de datos: menos superficie de riesgo',
                                'Anonimiza antes de enviar a un proveedor externo',
                                'Informa al usuario de que hay IA generativa',
                                'Evalúa sesgo con pruebas sobre grupos diversos',
                                'Define retención de datos con el proveedor',
                            ]],
                            ['p', 'La ética no es un freno, es un requisito de producto: usuarios que confían usan más el sistema, y datos que proteges evitan sanciones. Una política de IA escrita —qué sí, qué no, cómo se audita— convierte el criterio individual en cultura de equipo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Automatizar ≠ automatizar sin criterio',
                                'Mínimo de datos y anonimización con proveedores',
                                'Transparencia sobre la presencia de IA',
                                'La política escrita convierte la ética en cultura',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué deberías hacer antes de enviar datos a un proveedor de IA externo?', 'type' => 'multiple', 'answers' => [
                                    ['Anonimizar y minimizar los datos', true, 'Envío solo lo imprescindible.'],
                                    ['Revisar la política de retención del proveedor', true, 'Sabes qué guarda y por cuánto tiempo.'],
                                    ['Enviar la base de datos completa por comodidad', false, 'Nunca se envían datos de más.'],
                                    ['Ocultar que hay IA', false, 'La transparencia es requisito.'],
                                ]],
                                ['q' => '¿Por qué informar al usuario de que interactúa con IA?', 'type' => 'single', 'answers' => [
                                    ['La transparencia construye confianza y permite criterio', true, 'El usuario decide cómo valorar la respuesta.'],
                                    ['Porque las leyes lo prohíben usar en secreto', false, 'No hay prohibición general, pero la transparencia es esperable.'],
                                    ['Para que el usuario se vaya', false, 'No es el objetivo.'],
                                    ['Porque es más barato', false, 'No tiene relación con el coste.'],
                                ]],
                                ['q' => '¿Qué papel tiene la evaluación de sesgo en el desarrollo con IA?', 'type' => 'multiple', 'answers' => [
                                    ['Detectar tratos desiguales en las respuestas', true, 'Pruebas con casos diversos lo revelan.'],
                                    ['Mejorar la experiencia para todos los grupos', true, 'Corregir sesgos amplía el público válido.'],
                                    ['Evitar demandas por discriminación', true, 'Reduce riesgo legal y reputacional.'],
                                    ['Acelerar el entrenamiento', false, 'No afecta a la velocidad.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 2. Prompt Engineering práctico
    // =====================================================================
    [
        'slug' => 'prompt-engineering-practico',
        'title' => 'Prompt Engineering práctico',
        'description' => 'Diseña prompts claros, aplica few-shot y cadena de pensamiento, y construye sistemas de prompting sólidos para código y automatización.',
        'category' => 'ia',
        'difficulty' => 'intermediate',
        'duration_hours' => 13,
        'is_free' => true,
        'learning_path' => 'desarrollo-con-ia',
        'learning_path_level' => 2,
        'order' => 2,
        'modules' => [
            [
                'title' => 'Técnicas de prompting',
                'description' => 'Prompts claros, few-shot, cadena de pensamiento y RAG.',
                'lessons' => [
                    [
                        'slug' => 'prompts-claros-y-rol',
                        'title' => 'Contexto, rol y formato en los prompts',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Contexto, rol y formato en los prompts'],
                            ['p', 'Un buen prompt es un brief de trabajo: contexto (en qué proyecto, con qué restricciones), rol (eres un revisor de seguridad) y formato (responde en JSON, en lista, con 3 ideas). El modelo no adivina: aprovecha todo lo que le expliques.'],
                            ['p', 'Los prompts buenos se escriben como especificaciones: primero el objetivo, luego las restricciones y por último el formato esperado. Instrucciones vagas producen respuestas genéricas; contexto concreto produce respuestas accionables.'],
                            ['code', 'text', <<<'TEXT'
Mal prompt:
"Explícame middleware de Laravel."

Buen prompt:
"Actúa como un mentor de Laravel para un desarrollador júnior.
Explica qué es un middleware en Laravel 12, cuándo se usa y
muestra un ejemplo de middleware de autenticación.
Responde en español, en 3 párrafos y con un bloque de código."
TEXT],
                            ['h', 'Elementos de un prompt completo'],
                            ['list', [
                                'Rol: en qué posición quieres que responda',
                                'Contexto: proyecto, stack, audiencia',
                                'Tarea: qué resultado quieres exactamente',
                                'Formato: JSON, lista, tabla, extensión',
                                'Restricciones: tono, longitud, idioma, exclusiones',
                            ]],
                            ['p', 'El formato es la parte más fácil de medir: si necesitas JSON, pídelo explícito y valida el resultado. En código, pedir "solo PHP, sin explicaciones" ahorra tokens y ruido. Explicitar el formato convierte la magia en contrato.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Rol + contexto + tarea + formato = prompt completo',
                                'El contexto concreto produce respuestas accionables',
                                'Pide el formato y valídalo',
                                'Especifica restricciones para ahorrar tokens',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué elementos forman un prompt completo?', 'type' => 'multiple', 'answers' => [
                                    ['Rol y contexto', true, 'Definen desde dónde responde el modelo.'],
                                    ['Tarea concreta', true, 'Qué resultado exacto queremos.'],
                                    ['Formato y restricciones', true, 'Cómo debe ser la salida.'],
                                    ['La opinión personal del autor', false, 'No aporta al modelo.'],
                                ]],
                                ['q' => '¿Por qué pedir explícitamente un formato de salida?', 'type' => 'multiple', 'answers' => [
                                    ['La respuesta se vuelve parseable y accionable', true, 'El JSON se procesa igual que cualquier API.'],
                                    ['Reduce la ambigüedad de la salida', true, 'El modelo se ciñe a la estructura pedida.'],
                                    ['Ahorra tokens al evitar explicaciones', true, 'Menos relleno, más contrato.'],
                                    ['Garantiza respuestas correctas', false, 'El formato no garantiza el contenido.'],
                                ]],
                                ['q' => '¿Qué diferencia un prompt vago de uno efectivo?', 'type' => 'single', 'answers' => [
                                    ['El efectivo fija rol, contexto y formato', true, 'Eso es lo que el modelo necesita para acertar.'],
                                    ['El vago es más corto siempre', false, 'Corto no es sinónimo de bueno.'],
                                    ['El efectivo usa más adjetivos', false, 'Los adjetivos vagos empeoran.'],
                                    ['No hay diferencia', false, 'Sí la hay y es notable.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'few-shot-y-cadena-de-pensamiento',
                        'title' => 'Few-shot y cadena de pensamiento',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Few-shot y cadena de pensamiento'],
                            ['p', 'Few-shot significa enseñar con ejemplos: en lugar de describir la tarea, le das 2-3 ejemplos resueltos y el modelo imita el patrón. Es la técnica más fiable para lograr un formato o estilo consistente.'],
                            ['p', 'Cadena de pensamiento (chain-of-thought) pide al modelo razonar paso a paso antes de responder. Para problemas de lógica, matemáticas o código, razonar en voz alta mejora la precisión; el resultado final va después de los pasos.'],
                            ['code', 'text', <<<'TEXT'
Few-shot (clasificación):
"Clasifica el sentimiento del comentario: POSITIVO o NEGATIVO.
Ejemplo 1: 'El curso resuelve todas mis dudas' -> POSITIVO
Ejemplo 2: 'Instalar el entorno fue un infierno' -> NEGATIVO
Ahora: 'La documentación viene incompleta' ->"

Cadena de pensamiento:
"Razona paso a paso cuántos tokens cuesta un prompt de
300 palabras. Luego responde solo con el número final."
TEXT],
                            ['h', 'Cuándo usar cada técnica'],
                            ['list', [
                                'Few-shot: formato y estilo consistentes',
                                'Zero-shot: tareas simples sin ejemplos',
                                'Cadena de pensamiento: razonamiento y lógica',
                                'Ejemplos de calidad > cantidad de ejemplos',
                                'Combínalos: ejemplos + paso a paso',
                            ]],
                            ['p', 'Elige ejemplos representativos, incluido algún caso límite: si solo enseñas el caso fácil, el modelo fallará en el difícil. La cadena de pensamiento cuesta más tokens (pide razonar), pero falla menos en problemas que exigen varios pasos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Few-shot enseña con ejemplos; imita el patrón',
                                'Cadena de pensamiento razona antes de responder',
                                'Ejemplos con casos límite enseñan más',
                                'COT mejora lógica a coste de más tokens',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un prompt few-shot?', 'type' => 'single', 'answers' => [
                                    ['Un prompt que incluye ejemplos resueltos de la tarea', true, 'El modelo sigue los ejemplos como patrón.'],
                                    ['Un prompt sin contexto', false, 'Zero-shot es sin ejemplos.'],
                                    ['Un prompt con una sola palabra', false, 'No define la técnica.'],
                                    ['Un prompt que pide reflexión paso a paso', false, 'Eso es cadena de pensamiento.'],
                                ]],
                                ['q' => '¿Para qué tareas conviene la cadena de pensamiento?', 'type' => 'multiple', 'answers' => [
                                    ['Problemas de lógica y matemáticas', true, 'Razonar en pasos mejora el resultado.'],
                                    ['Depurar código con varias hipótesis', true, 'Explorar causas en orden ayuda.'],
                                    ['Responder \'sí\' o \'no\' trivial', false, 'Sobrecarga sin beneficio.'],
                                    ['Tareas que necesitan una única palabra', false, 'El razonamiento extra no aporta.'],
                                ]],
                                ['q' => '¿Qué hace más valiosos los ejemplos few-shot?', 'type' => 'single', 'answers' => [
                                    ['Incluir casos límite representativos', true, 'El modelo aprende también los bordes.'],
                                    ['Usar siempre el mismo ejemplo repetido', false, 'No aporta variedad.'],
                                    ['Escribir ejemplos sin contexto', false, 'Sin contexto el patrón se pierde.'],
                                    ['Poner ejemplos de otra tarea', false, 'Los ejemplos deben ser de la tarea real.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'patrones-avanzados-rag',
                        'title' => 'Patrones avanzados: RAG y herramientas',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Patrones avanzados: RAG y herramientas'],
                            ['p', 'RAG (Retrieval-Augmented Generation) conecta el modelo con tus documentos: trocea el contenido, lo indexa como embeddings y, al preguntar, recupera los fragmentos relevantes y los inyecta en el prompt. El modelo responde con base real y citable.'],
                            ['p', 'Las herramientas (function calling) dan al modelo la capacidad de ejecutar acciones: consultar una BD, llamar a una API, calcular. El modelo decide qué función llamar con qué argumentos, y tu código la ejecuta y devuelve el resultado (agente).'],
                            ['code', 'php', <<<'PHP'
// Esquema RAG
// 1. Indexar: dividir y embedizar documentos
//    $vectores[] = EmbeddingService::crear($fragmento);
// 2. Guardar: tabla con texto + vector (pgvector)
// 3. Consultar: embedizar la pregunta y buscar cercanos
// 4. Responder: inyectar fragmentos en el prompt

// Esquema function calling
$herramientas = [
    ['type' => 'function', 'function' => [
        'name'        => 'buscar_curso',
        'description' => 'Busca cursos en la BD por término.',
        'parameters'  => ['term' => 'string'],
    ]],
];
PHP],
                            ['h', 'Cuándo usar RAG y herramientas'],
                            ['list', [
                                'RAG: hechos de tus documentos y dominio privado',
                                'RAG: respuestas con citas verificables',
                                'Herramientas: datos en vivo (BD, APIs)',
                                'Herramientas: acciones (enviar, crear, calcular)',
                                'Agente: modelo + herramientas + bucle de decisión',
                            ]],
                            ['p', 'RAG resuelve el conocimiento congelado; las herramientas resuelven la acción. Ambos patrones convierten al LLM en un componente de tu sistema, no en un oráculo: la fuente la pones tú, y la validación final sigue en tu código.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'RAG inyecta documentos relevantes en el prompt',
                                'Embeddings + búsqueda por similitud',
                                'Function calling deja que el modelo invoque tus APIs',
                                'RAG = conocimiento; herramientas = acción',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué problema resuelve RAG?', 'type' => 'single', 'answers' => [
                                    ['Responder con base en tus propios documentos', true, 'Recupera fragmentos y los usa como fuente.'],
                                    ['Acelerar el entrenamiento del modelo', false, 'No entrena; sólo recupera.'],
                                    ['Eliminar el prompt', false, 'Sigue habiendo prompt, aumentado.'],
                                    ['Traducir documentos', false, 'La traducción es otra aplicación.'],
                                ]],
                                ['q' => '¿Qué es el function calling?', 'type' => 'multiple', 'answers' => [
                                    ['El modelo decide llamar a una función de tu código', true, 'Propone nombre y argumentos.'],
                                    ['Tu código ejecuta la llamada y devuelve el resultado', true, 'El agente cierra el bucle.'],
                                    ['El modelo ejecuta comandos sin control', false, 'Siempre valida y ejecuta tu código.'],
                                    ['Es una base de datos', false, 'Es un patrón de integración.'],
                                ]],
                                ['q' => '¿Qué combina un agente de IA?', 'type' => 'single', 'answers' => [
                                    ['Modelo + herramientas + bucle de decisión', true, 'El modelo razona, llama y reevalúa.'],
                                    ['Solo un modelo grande', false, 'Falta la capacidad de actuar.'],
                                    ['Solo una base de datos', false, 'Falta el modelo.'],
                                    ['Una red neuronal entrenada por ti', false, 'Los agentes usan modelos ya entrenados.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Uso profesional',
                'description' => 'Prompts para código, refinamiento y automatización.',
                'lessons' => [
                    [
                        'slug' => 'prompts-para-codigo',
                        'title' => 'Prompts efectivos para generar código',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Prompts efectivos para generar código'],
                            ['p', 'Generar código con IA funciona mejor cuando describes el contrato, no la implementación: entrada, salida, casos límite y restricciones. Pedir "una función que valide emails" es vago; especificar entrada, formato, reglas y errores produce código reutilizable.'],
                            ['p', 'Incluye tu stack y convenciones: "Laravel 12, PHP 8.3, respeta el estilo PSR-12, usa validación de FormRequest". Cuanto más contexto del proyecto, más código que encaja sin reescrituras.'],
                            ['code', 'php', <<<'PHP'
// Prompt de código efectivo
$prompt = <<<'TXT'
Genera un FormRequest de Laravel 12 para crear inscripciones.
- Entrada: course_id (int), user_id (int), coupon (opcional string)
- Reglas: course_id debe existir y tener plazas;
         coupon, si existe, debe ser válido y no usado.
- Mensajes en español.
- Respóndeme solo PHP, sin explicaciones.
TXT;
PHP],
                            ['h', 'Receta para prompts de código'],
                            ['list', [
                                'Contrato: entrada, salida y casos límite',
                                'Stack y versiones concretas',
                                'Reglas de negocio explícitas',
                                'Formato de salida: solo código, con tests, con comentarios',
                                'Convenciones del equipo (estilo, naming)',
                            ]],
                            ['p', 'El código generado nunca se usa a ciegas: se revisa, se testea y se integra como cualquier otra contribución. La IA acelera el borrador; la calidad la pone tu revisión. Exige tests en el prompt y valida que los cumplen.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Describe contrato, no implementación',
                                'Da stack, versiones y convenciones',
                                'Explicita reglas de negocio y casos límite',
                                'Revisar y testear el código generado es obligatorio',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es mejor especificar en un prompt de código?', 'type' => 'single', 'answers' => [
                                    ['El contrato: entrada, salida y casos límite', true, 'La IA implementa mejor sabiendo qué debe cumplir.'],
                                    ['Solo el nombre de la función', false, 'Demasiado poco contexto.'],
                                    ['La biografía del equipo', false, 'No aporta al resultado.'],
                                    ['Nada: pedir "código"', false, 'Genera algo genérico.'],
                                ]],
                                ['q' => '¿Por qué incluir el stack y las versiones?', 'type' => 'multiple', 'answers' => [
                                    ['La sintaxis y APIs cambian entre versiones', true, 'Laravel 11 y 12 difieren.'],
                                    ['El código encaja con el proyecto sin reescrituras', true, 'Menos adaptación posterior.'],
                                    ['Porque el modelo lo exige', false, 'Es una recomendación, no un requisito.'],
                                    ['Para mostrar profesionalidad', false, 'El motivo es técnico, no estético.'],
                                ]],
                                ['q' => '¿Cuál es la regla sobre el código generado por IA?', 'type' => 'single', 'answers' => [
                                    ['Revisarlo y testearlo como cualquier código propio', true, 'La responsabilidad del código es del equipo.'],
                                    ['Confiar ciegamente porque lo generó IA', false, 'La IA se equivoca igual o más.'],
                                    ['Desplegarlo sin pruebas', false, 'Nunca se despliega sin pruebas.'],
                                    ['Prohibirlo por completo', false, 'Se usa con control, no se prohíbe.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'refinamiento-y-evaluacion',
                        'title' => 'Refinar y evaluar prompts: iteración sistemática',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Refinar y evaluar prompts: iteración sistemática'],
                            ['p', 'El prompt engineering se mejora con datos, no con intuición: defines un conjunto fijo de casos de prueba (golden set), ejecutas el prompt actual, anotas fallos y ajustas. Cada iteración mide si el prompt mejoró realmente.'],
                            ['p', 'Herramientas como evals, planillas o simples scripts comparan salidas: exactitud de formato, precisión de contenido, consistencia. El prompt es un artefacto de software: versionado, probado y con dueño.'],
                            ['code', 'php', <<<'PHP'
// Mini-eval de prompts
$casos = [
    ['input' => 'Explica middleware a un júnior', 'esperado' => 'incluye ejemplo'],
    ['input' => '¿Qué es un trait?',            'esperado' => 'no alucina'],
    ['input' => 'Código de validación',         'esperado' => 'solo PHP'],
];

function evaluar(string $prompt, array $casos): array
{
    $resultados = [];
    foreach ($casos as $caso) {
        $salida = AiService::completar('system', $prompt . "\n" . $caso['input']);
        $resultados[] = ['input' => $caso['input'], 'ok' => verificar($salida, $caso['esperado'])];
    }
    return $resultados;
}
PHP],
                            ['h', 'Ciclo de refinamiento'],
                            ['list', [
                                'Definir golden set: casos representativos',
                                'Criterios de evaluación: formato, contenido, sesgo',
                                'Ejecutar y anotar fallos',
                                'Ajustar prompt (más contexto, ejemplos, restricciones)',
                                'Re-ejecutar y comparar',
                            ]],
                            ['p', 'El refinamiento tiene rendimientos decrecientes: si el prompt falla por conocimiento (hechos), añade RAG en lugar de insistir con palabras. Distinguir entre problemas de instrucción y problemas de conocimiento te ahorra horas de tuning.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Evalúa con un golden set fijo, no con impresiones',
                                'El prompt se versiona y testea como código',
                                'Anota fallos y ajusta con evidencia',
                                'Instrucción ≠ conocimiento: RAG para hechos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un golden set de prompts?', 'type' => 'single', 'answers' => [
                                    ['Un conjunto fijo de casos de prueba para evaluar el prompt', true, 'Mide cambios de calidad entre versiones.'],
                                    ['Los prompts pagados que se compran', false, 'No es un producto comercial.'],
                                    ['Los prompts en producción', false, 'Los de producción pueden coincidir, pero no es la definición.'],
                                    ['Un modelo de oro', false, 'Es un dataset de evaluación, no un modelo.'],
                                ]],
                                ['q' => '¿Cómo se mejora un prompt de forma sistemática?', 'type' => 'multiple', 'answers' => [
                                    ['Anotando fallos del golden set', true, 'El fallo concreto guía el ajuste.'],
                                    ['Ajustando y re-ejecutando', true, 'Iteración medida.'],
                                    ['Comparando versiones del prompt', true, 'Cambios medibles, no a ciegas.'],
                                    ['Cambiando palabras al azar', false, 'Sin medición es ruido.'],
                                ]],
                                ['q' => 'Si el prompt falla por falta de hechos concretos, ¿qué conviene?', 'type' => 'single', 'answers' => [
                                    ['Añadir RAG en vez de más instrucciones', true, 'El problema es conocimiento, no instrucción.'],
                                    ['Insistir con más adjetivos', false, 'Las instrucciones más largas no añaden datos.'],
                                    ['Subir la temperatura', false, 'Más aleatoriedad empeora hechos.'],
                                    ['Cambiar el idioma del prompt', false, 'El idioma no aporta hechos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'del-prompt-a-la-funcion',
                        'title' => 'Del prompt a la función: automatizar tareas con LLMs',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Del prompt a la función: automatizar tareas con LLMs'],
                            ['p', 'El salto profesional es convertir un prompt suelto en una función del sistema: entrada tipada, prompt estable versionado, salida validada y llamada invocable desde cualquier parte de la app (un job, un comando, un endpoint).'],
                            ['p', 'Un pipeline de automatización típico: entrada (archivo, texto, evento) → prompt con contexto → llamada al modelo → validación y transformación → salida (resumen, clasificación, dataset). El prompt vive en un archivo, no incrustado en el código.'],
                            ['code', 'php', <<<'PHP'
class ResumenService
{
    public function __construct(private AiService $ia) {}

    public function resumir(string $texto, int $maxPalabras): array
    {
        $prompt = sprintf(
            file_get_contents(resource_path('prompts/resumen.txt')),
            $maxPalabras,
            $texto
        );

        $respuesta = $this->ia->completar(
            'Eres un editor técnico que resume con precisión.',
            $prompt
        );

        return [
            'resumen' => $respuesta,
            'palabras' => str_word_count($respuesta),
        ];
    }
}
PHP],
                            ['h', 'Diseño de una función de IA'],
                            ['list', [
                                'Entrada tipada y validada',
                                'Prompt versionado en archivo (no incrustado)',
                                'Llamada con timeout, retry y errores tipados',
                                'Validación de la salida (esquema, longitud)',
                                'Uso desde jobs, comandos y endpoints',
                            ]],
                            ['p', 'Cuando el prompt se versiona, el fallo se testea y la salida se valida, la automatización con IA se vuelve mantenible: otro dev puede leer, probar y modificar el pipeline sin ser un experto en prompting.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'De prompt suelto a función con contrato',
                                'Prompts en archivos versionados',
                                'Entrada y salida validadas',
                                'Automatización mantenible = testeable',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué guardar el prompt en un archivo en lugar de incrustarlo en el código?', 'type' => 'multiple', 'answers' => [
                                    ['Se versiona y revisa como código', true, 'Diff y blame sobre el prompt.'],
                                    ['Se puede editar sin tocar la lógica', true, 'Separación de responsabilidades.'],
                                    ['Se testea con más facilidad', true, 'El cambio se evalúa con el golden set.'],
                                    ['Es obligatorio en Laravel', false, 'Es una buena práctica, no una regla.'],
                                ]],
                                ['q' => '¿Qué hace de una automatización con IA algo mantenible?', 'type' => 'single', 'answers' => [
                                    ['Entrada tipada, prompt versionado y salida validada', true, 'Un contrato completo como cualquier servicio.'],
                                    ['Un prompt gigante en un solo método', false, 'Difícil de leer y probar.'],
                                    ['Respuestas sin validar', false, 'La basura entra y se guarda.'],
                                    ['Depender de un solo proveedor sin abstracción', false, 'Complica cambios.'],
                                ]],
                                ['q' => '¿Desde dónde se puede invocar una función de IA bien diseñada?', 'type' => 'multiple', 'answers' => [
                                    ['Un job en cola', true, 'Procesamiento asíncrono típico.'],
                                    ['Un comando artisan', true, 'Tareas de consola.'],
                                    ['Un endpoint HTTP', true, 'Funcionalidad bajo demanda.'],
                                    ['Solo desde el navegador con fetch directo', false, 'Las claves nunca van al navegador.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    // =====================================================================
    // 3. IA en el ciclo de desarrollo
    // =====================================================================
    [
        'slug' => 'ia-en-el-ciclo-de-desarrollo',
        'title' => 'IA en el ciclo de desarrollo',
        'description' => 'Aprovecha asistentes de código, usa IA en review y tests, y lleva sistemas generativos a producción con evaluación y seguridad.',
        'category' => 'ia',
        'difficulty' => 'intermediate',
        'duration_hours' => 12,
        'is_free' => false,
        'learning_path' => 'desarrollo-con-ia',
        'learning_path_level' => 3,
        'order' => 3,
        'modules' => [
            [
                'title' => 'Flujo de trabajo aumentado',
                'description' => 'Asistentes de código, IA en review y en diseño.',
                'lessons' => [
                    [
                        'slug' => 'asistentes-de-codigo',
                        'title' => 'Asistentes de código y pair programming con IA',
                        'type' => 'article',
                        'duration' => 16,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Asistentes de código y pair programming con IA'],
                            ['p', 'Los asistentes de IA (Copilot, Cursor, Codeium) completan código, explican fragmentos y responden preguntas sobre tu base de código. Bien usados, eliminan el trabajo mecánico; mal usados, generan código que nadie entiende.'],
                            ['p', 'Funcionan mejor con contexto: abre los archivos implicados, describe el contrato y da el stack. El asistente es un par programador con memoria de pez: recuerda el prompt, no el proyecto. Tú aportas la arquitectura y las decisiones.'],
                            ['code', 'text', <<<'TEXT'
Buen uso del asistente:
1. Describe el problema y el contrato antes de pedir código.
2. Pide el fragmento pequeño y léelo antes de integrarlo.
3. Usa autocompletado para lo repetitivo, no para el diseño.
4. Pide explicaciones del código que no entiendes.
5. Haz que genere los tests, no que los evite.
TEXT],
                            ['h', 'Roles en el pair programming con IA'],
                            ['list', [
                                'Tú: arquitectura, decisiones, validación',
                                'IA: autocompletado, borradores, explicaciones',
                                'IA: conversión entre formatos y refactor simple',
                                'Tú: revisión final línea a línea',
                                'Nunca: aceptar código sin entenderlo',
                            ]],
                            ['p', 'La métrica de un buen uso no es cuánto código genera, sino cuánto entiende el equipo del resultado. Si el asistente produce código que nadie puede explicar, has cambiado deuda técnica por deuda de comprensión.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El asistente es un par júnior veloz, no el arquitecto',
                                'Contexto claro = resultados útiles',
                                'Entender antes de integrar, siempre',
                                'Que genere tests junto con el código',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el mejor uso de un asistente de código?', 'type' => 'single', 'answers' => [
                                    ['Automatizar lo mecánico y generar borradores', true, 'Deja el diseño y las decisiones a la persona.'],
                                    ['Diseñar la arquitectura del sistema', false, 'La arquitectura es decisión humana.'],
                                    ['Aceptar todo lo que propone', false, 'Se revisa y entiende todo.'],
                                    ['Escribir código sin contexto', false, 'Los resultados serán genéricos.'],
                                ]],
                                ['q' => '¿Qué contexto mejora los resultados del asistente?', 'type' => 'multiple', 'answers' => [
                                    ['Abrir los archivos implicados', true, 'El asistente ve las convenciones reales.'],
                                    ['Describir el contrato y el stack', true, 'Sabe qué lenguaje y versiones usar.'],
                                    ['Explicar las reglas de negocio', true, 'El código generado encaja con la lógica.'],
                                    ['Ocultar el proyecto completo', false, 'Menos contexto, peores resultados.'],
                                ]],
                                ['q' => '¿Qué riesgo trae aceptar código generado sin entenderlo?', 'type' => 'single', 'answers' => [
                                    ['Deuda de comprensión: nadie puede mantenerlo', true, 'Si nadie lo entiende, cualquier bug es un misterio.'],
                                    ['El código siempre tiene virus', false, 'No es un riesgo automático.'],
                                    ['Git lo rechaza', false, 'Git acepta cualquier código.'],
                                    ['No hay ningún riesgo', false, 'El riesgo es real y común.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'ia-en-code-review-y-tests',
                        'title' => 'IA en code review, tests y documentación',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'IA en code review, tests y documentación'],
                            ['p', 'La IA destaca en las tareas de calidad que requieren leer mucho y decidir poco: detectar estilos inconsistentes, pedir tests faltantes, resumir un diff, generar casos de prueba o redactar documentación del cambio.'],
                            ['p', 'El flujo sano: la IA prepara el resumen y las alertas; el humano decide. Un revisor humano valida la lógica y las decisiones; la IA aporta exhaustividad donde la atención humana se cansa.'],
                            ['code', 'php', <<<'PHP'
// IA como segunda opinión en review
$preguntas = [
    '¿Hay tests para este cambio? Señala rutas sin cubrir.',
    '¿Hay errores comunes de seguridad (SQLi, XSS, authz)?',
    '¿El estilo respeta el del proyecto?',
    'Resume el diff en 3 frases para el contexto del PR.',
    '¿Hay código muerto o duplicado introducido?',
];
PHP],
                            ['h', 'Dónde aporta valor'],
                            ['list', [
                                'Resumen de diffs para PRs',
                                'Detección de caminos sin tests',
                                'Patrones de seguridad comunes',
                                'Generación de casos de prueba bordes',
                                'Documentación de funciones y cambios',
                            ]],
                            ['p', 'La clave es posicionar la IA como asistente del revisor, no como revisor final: sus alertas se verifican, su resumen se corrige si hace falta, y las decisiones de aprobar o rechazar siguen siendo humanas.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'IA lee mucho y decide poco: ideal para review preliminar',
                                'La decisión final es humana',
                                'Genera tests y documentación junto al código',
                                'Las alertas se verifican, no se aceptan a ciegas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué tareas de revisión delega bien a la IA?', 'type' => 'multiple', 'answers' => [
                                    ['Resumir el diff del PR', true, 'Ahorra tiempo de lectura.'],
                                    ['Buscar rutas sin tests', true, 'Exhaustividad donde se cansa la atención.'],
                                    ['Detectar patrones de seguridad típicos', true, 'Buen segundo par de ojos.'],
                                    ['Aprobar el PR', false, 'La decisión es humana.'],
                                ]],
                                ['q' => '¿Cómo se integra la IA en el flujo de review?', 'type' => 'single', 'answers' => [
                                    ['Como asistente que prepara y alerta; el humano decide', true, 'Complementa, no sustituye.'],
                                    ['Como revisor final sin intervención', false, 'Sus alertas requieren verificación.'],
                                    ['Sustituyendo los tests manuales', false, 'No sustituye la verificación.'],
                                    ['Ignorando sus comentarios', false, 'Sus alertas aportan si se verifican.'],
                                ]],
                                ['q' => '¿Qué debe acompañar al código generado por IA?', 'type' => 'multiple', 'answers' => [
                                    ['Tests que cubran los casos bordes', true, 'La calidad se demuestra con pruebas.'],
                                    ['Documentación del cambio', true, 'Mantiene el conocimiento en el repo.'],
                                    ['Una firma del proveedor', false, 'No aporta valor técnico.'],
                                    ['Permiso para omitir CI', false, 'El CI corre siempre.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'ia-en-diseno-y-arquitectura',
                        'title' => 'IA para diseño y arquitectura de soluciones',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'IA para diseño y arquitectura de soluciones'],
                            ['p', 'La IA puede ser una caja de resonancia en diseño: explicar trade-offs, recordar patrones, comparar alternativas o criticar un diseño propuesto. Pero la arquitectura es una decisión de contexto —tu dominio, tu equipo, tu escala— que la IA solo conoce si se la das.'],
                            ['p', 'Úsala como revisor temprano: describe tu diseño y pide que lo ataque, que liste riesgos y supuestos, o que compare con la alternativa. Es un consejo experto barato; la validación real vendrá del código y de la operación.'],
                            ['code', 'php', <<<'PHP'
$preguntasDeArquitectura = [
    '¿Qué riesgos ves en este diseño de microservicios?',
    '¿Cómo escalaría esta cola en 10x la carga actual?',
    '¿Qué patrón de Laravel encaja mejor para este módulo?',
    'Compara caché en Redis vs base de datos para este caso.',
    '¿Qué supuestos estoy dando por ciertos?',
];
PHP],
                            ['h', 'Cómo sacarle partido'],
                            ['list', [
                                'Dale contexto completo: dominio, tráfico, equipo',
                                'Pide listas de riesgos y supuestos',
                                'Usa comparaciones explícitas de alternativas',
                                'Pide que critique tu diseño, no que lo apruebe',
                                'La decisión final se valida con datos, no con opiniones',
                            ]],
                            ['p', 'El peligro es el sesgo de confirmación: si le pides "¿está bien mi diseño?", tiende a decir que sí. Pide explícitamente "ataca este diseño", "dame 5 razones para no hacer esto" y descubrirás supuestos que tú mismo no veías.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La IA es caja de resonancia, no arquitecta',
                                'El contexto de dominio es tuyo: dáselo',
                                'Pide críticas y riesgos, no aprobaciones',
                                'Decisión final con datos, no con opinión del modelo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cómo conviene pedir opinión de arquitectura a la IA?', 'type' => 'single', 'answers' => [
                                    ['Pidiendo que critique y liste riesgos', true, 'Evita el sesgo de confirmación.'],
                                    ['Pidiendo "¿está bien mi diseño?"', false, 'Tiende a confirmar.'],
                                    ['Sin dar contexto del sistema', false, 'Sin contexto, la opinión es genérica.'],
                                    ['Aceptando su diseño sin más', false, 'Es una herramienta de análisis, no la decisión.'],
                                ]],
                                ['q' => '¿Qué contexto necesita la IA para opinar de arquitectura?', 'type' => 'multiple', 'answers' => [
                                    ['Dominio y reglas de negocio', true, 'La arquitectura sirve al dominio.'],
                                    ['Tráfico y escala esperada', true, 'Escala distinta = decisiones distintas.'],
                                    ['Tamaño y experiencia del equipo', true, 'La arquitectura se sostiene con el equipo.'],
                                    ['El nombre de la empresa', false, 'No aporta información técnica.'],
                                ]],
                                ['q' => '¿Cuál es la validación definitiva de un diseño?', 'type' => 'single', 'answers' => [
                                    ['Los datos: carga real, operación y evidencia del código', true, 'La arquitectura se prueba en producción.'],
                                    ['La opinión del LLM', false, 'Es insumo, no evidencia.'],
                                    ['La cantidad de documentación', false, 'Documentar no valida.'],
                                    ['Que se vea moderno', false, 'La estética no valida.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Integración avanzada',
                'description' => 'Producción, evaluación y seguridad de sistemas con IA.',
                'lessons' => [
                    [
                        'slug' => 'ia-generativa-en-produccion',
                        'title' => 'Llevar IA generativa a producción',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Llevar IA generativa a producción'],
                            ['p', 'Un prototipo con IA funciona con un prompt; un sistema en producción requiere observabilidad, coste controlado, latencia predecible y plan de fallos. Las preguntas cambian: ¿cuánto cuesta cada llamada? ¿qué pasa si el proveedor cae? ¿podemos volver a una versión anterior?'],
                            ['p', 'El flujo productivo: caché de respuestas repetibles, monitoreo de tokens y errores, alerts de latencia, detección de respuestas vacías o malformadas, y un fallback (respuesta plantilla o servicio alternativo) cuando el modelo no responde.'],
                            ['code', 'php', <<<'PHP'
// Servicio productivo con caché y fallback
class AiProduccion
{
    public function resumir(string $texto): string
    {
        $clave = 'iai:' . md5($texto);

        return Cache::remember($clave, 3600, function () use ($texto) {
            try {
                $r = $this->ia->completar('...', $texto);
                Log::info('IA ok', ['tokens' => $this->ia->ultimoUso()]);
                return $r;
            } catch (AiException $e) {
                Log::error('IA caída', ['error' => $e->getMessage()]);
                return 'Resumen no disponible. Inténtalo de nuevo.';
            }
        });
    }
}
PHP],
                            ['h', 'Checklist de producción'],
                            ['list', [
                                'Caché para respuestas repetibles',
                                'Métricas de tokens, coste y latencia',
                                'Alerts ante errores y malformados',
                                'Fallback ante caídas del proveedor',
                                'Versionado de prompts y evaluación continua',
                                'Retención de datos definida y comunicada',
                            ]],
                            ['p', 'Trata la IA como un servicio externo más: con SLOs, alertas y plan de degradación. La parte más descuidada suele ser la evaluación continua: un prompt que funcionaba puede dejar de hacerlo cuando el proveedor actualiza el modelo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Producción = observabilidad + coste + fallback',
                                'Caché y métricas de tokens desde el día uno',
                                'Evaluación continua ante cambios del proveedor',
                                'La caída del modelo no puede tumbar tu app',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué métricas importan en producción con IA?', 'type' => 'multiple', 'answers' => [
                                    ['Tokens consumidos y coste por llamada', true, 'El coste escala con el uso.'],
                                    ['Latencia y tasa de error', true, 'UX y salud del servicio.'],
                                    ['Respuestas malformadas', true, 'Indican regresiones o cambios del modelo.'],
                                    ['El color del prompt en el editor', false, 'Sin valor operativo.'],
                                ]],
                                ['q' => '¿Qué hace el fallback ante una caída del proveedor?', 'type' => 'single', 'answers' => [
                                    ['Responder con una solución degradada y avisar', true, 'La app sigue viva; la respuesta puede ser plantilla.'],
                                    ['Esperar indefinidamente al proveedor', false, 'El timeout evita bloqueos.'],
                                    ['Mostrar un error 500 al usuario', false, 'Es lo que se evita.'],
                                    ['Borrar el caché', false, 'El caché ayuda, no se borra.'],
                                ]],
                                ['q' => '¿Por qué evaluar continuamente aunque no cambies nada?', 'type' => 'single', 'answers' => [
                                    ['El proveedor puede actualizar el modelo y cambiar resultados', true, 'Los modelos cambian sin aviso bajo el mismo nombre.'],
                                    ['Para gastar más tokens', false, 'Evaluar con set fijo cuesta poco.'],
                                    ['Porque es obligatorio por ley', false, 'No hay ley universal.'],
                                    ['Para que el servidor esté ocupado', false, 'No tiene sentido.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'evaluacion-y-metricas-de-ia',
                        'title' => 'Evaluación y métricas de calidad en sistemas con IA',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Evaluación y métricas de calidad en sistemas con IA'],
                            ['p', 'La calidad de la IA no es binaria: se mide por tarea. Para clasificación, precisión y recall; para generación de texto, relevancia, fidelidad y ausencia de alucinaciones; para código, que compile, pase tests y cumpla el contrato.'],
                            ['p', 'El sistema de evaluación: un conjunto de casos (golden set), criterios por tarea y ejecución periódica (CI, cron). Los cambios de prompt, modelo o datos se miden contra la línea base antes de pasar a producción.'],
                            ['code', 'php', <<<'PHP'
$metricas = [
    'Clasificación'   => ['precisión', 'recall', 'F1'],
    'Generación'      => ['relevancia (1-5)', 'fidelidad al contexto', 'alucinaciones'],
    'Código generado' => ['compila', 'tests pasan', 'cumple contrato'],
    'Conversacional'  => ['utilidad', 'tono', 'seguridad'],
];
PHP],
                            ['h', 'Cómo montar la evaluación'],
                            ['list', [
                                'Golden set curado por humanos',
                                'Criterios específicos por tipo de tarea',
                                'Evaluación automática (reglas) + muestreo humano',
                                'Ejecutar en cada cambio de prompt o modelo',
                                'Guardar histórico para detectar regresiones',
                            ]],
                            ['p', 'No hace falta un lab: empieza con 30-50 casos curados y una planilla. La evaluación automática marca sospechosos y un humano revisa una muestra. Con el tiempo, el golden set se amplía con los fallos reales que llegan de producción.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Métrica adecuada según la tarea',
                                'Golden set + ejecución periódica = línea base',
                                'Automático + muestreo humano',
                                'Los fallos de producción engordan el golden set',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué métricas aplican a una tarea de clasificación?', 'type' => 'multiple', 'answers' => [
                                    ['Precisión', true, 'De lo que predijo positivo, cuánto acertó.'],
                                    ['Recall', true, 'De lo positivo real, cuánto capturó.'],
                                    ['F1', true, 'Equilibrio entre precisión y recall.'],
                                    ['Latencia del servidor', false, 'Eso es operación, no calidad de la tarea.'],
                                ]],
                                ['q' => '¿Qué es el golden set en evaluación de IA?', 'type' => 'single', 'answers' => [
                                    ['Casos curados con resultado esperado', true, 'La referencia para medir cada cambio.'],
                                    ['Los prompts más caros', false, 'No es cuestión de precio.'],
                                    ['Un modelo secreto', false, 'Es un dataset, no un modelo.'],
                                    ['Los logs de producción', false, 'Los logs alimentan el set, no lo son.'],
                                ]],
                                ['q' => '¿Cómo crece un buen golden set con el tiempo?', 'type' => 'single', 'answers' => [
                                    ['Incorporando fallos reales detectados en producción', true, 'Los casos reales son los más valiosos.'],
                                    ['Eliminando los casos difíciles', false, 'Justo lo contrario.'],
                                    ['Copiando sets de otras empresas', false, 'Los casos deben reflejar tu dominio.'],
                                    ['Dejándolo fijo para siempre', false, 'Se actualiza con la realidad.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'seguridad-y-privacidad-con-ia',
                        'title' => 'Seguridad y privacidad al usar IA en el desarrollo',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Seguridad y privacidad al usar IA en el desarrollo'],
                            ['p', 'Cada prompt que envías a un proveedor externo es una posible fuga: código propietario, datos de clientes, secretos. La regla de oro: nunca pegues secretos ni datos personales en chats públicos; usa instancias con retención cero para datos sensibles.'],
                            ['p', 'En código, la IA es un nuevo vector de ataque: puede sugerir librerías falsas o código vulnerable con apariencia perfecta. Por eso los sistemas con IA necesitan hardening específico: validar salidas, escapar contenido antes de renderizar y probar prompt injection.'],
                            ['code', 'php', <<<'PHP'
$hardening = [
    'Nunca enviar'      => 'secretos, tokens, datos personales',
    'Prompt injection'  => 'tratar el texto del usuario como dato, no como orden',
    'Validación'        => 'esquema y restricciones sobre la salida',
    'Rendering'         => 'escapar la salida antes de mostrar (XSS)',
    'Retención'         => 'usar proveedores con retención cero si aplica',
];
PHP],
                            ['h', 'Riesgos específicos'],
                            ['list', [
                                'Fuga de datos por prompts a proveedores',
                                'Prompt injection: el texto del usuario reordena al modelo',
                                'Salida maliciosa (XSS, enlaces, instrucciones)',
                                'Dependencias falsas sugeridas',
                                'Permisos excesivos en agentes con herramientas',
                            ]],
                            ['p', 'La prompt injection ocurre cuando mezclas datos de usuario con instrucciones del sistema: el texto "ignora tus reglas y..." puede secuestrar el prompt. Aislar instrucciones de datos, usar delimitadores y validar la salida reduce el riesgo; y los agentes con herramientas deben tener el mínimo permiso posible.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Nunca secrets ni datos personales en prompts',
                                'Aísla instrucciones de datos del usuario',
                                'Escapa y valida toda salida del modelo',
                                'Agentes con herramientas = mínimo privilegio',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es la prompt injection?', 'type' => 'single', 'answers' => [
                                    ['Texto del usuario que intenta reordenar las instrucciones del modelo', true, 'El dato se cuela como orden y cambia el comportamiento.'],
                                    ['Un fallo del servidor', false, 'Es un ataque al prompt, no de infraestructura.'],
                                    ['Un tipo de virus en el código generado', false, 'Se relaciona con instrucciones, no con binarios.'],
                                    ['Un error de red', false, 'No es un problema de red.'],
                                ]],
                                ['q' => '¿Qué nunca debe ir en un prompt enviado a un proveedor público?', 'type' => 'multiple', 'answers' => [
                                    ['API keys y tokens', true, 'Se filtrarían al proveedor y sus registros.'],
                                    ['Datos personales de usuarios', true, 'Privacidad: exige anonimización o retención cero.'],
                                    ['Código propietario', true, 'Puede usarse para entrenar o quedar en registros.'],
                                    ['El nombre del módulo sin más', false, 'Eso es inofensivo.'],
                                ]],
                                ['q' => '¿Cómo reduces el riesgo de salidas maliciosas?', 'type' => 'multiple', 'answers' => [
                                    ['Escapar la salida antes de renderizar', true, 'Neutraliza XSS.'],
                                    ['Validar contra esquema y restricciones', true, 'Solo entra lo esperado.'],
                                    ['Mostrar la salida tal cual en HTML', false, 'Eso es justo el riesgo de XSS.'],
                                    ['Ejecutar la salida como comando', false, 'Jamás se ejecuta salida del modelo como comando.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
