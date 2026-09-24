<?php

return [
    'provider'       => env('AI_PROVIDER', 'null'),
    'api_key'        => env('AI_API_KEY', ''),
    'model'          => env('AI_MODEL', 'gpt-4o-mini'),
    'system_prompt'  => env('AI_SYSTEM_PROMPT',
        'Eres un asistente experto en programación, especializado en ayudar a estudiantes de Ingeniería de Sistemas. ' .
        'Explica conceptos de forma clara y concisa, usa ejemplos de código cuando sea útil, y responde siempre en español. ' .
        'Puedes ayudar con: algoritmos, estructuras de datos, POO, bases de datos, redes, sistemas operativos y cualquier tema de programación.'
    ),
];
