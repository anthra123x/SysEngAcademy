<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Programación Básica',  'slug' => 'programacion-basica',  'icon' => 'Code',         'color' => '#6C63FF', 'description' => 'Fundamentos de programación y pensamiento lógico'],
            ['name' => 'Algoritmos',            'slug' => 'algoritmos',           'icon' => 'GitBranch',    'color' => '#00D9FF', 'description' => 'Diseño y análisis de algoritmos'],
            ['name' => 'POO',                   'slug' => 'poo',                  'icon' => 'Boxes',        'color' => '#00E676', 'description' => 'Programación Orientada a Objetos'],
            ['name' => 'Bases de Datos',        'slug' => 'bases-de-datos',       'icon' => 'Database',     'color' => '#FFD740', 'description' => 'SQL, NoSQL y diseño de bases de datos'],
            ['name' => 'Redes',                 'slug' => 'redes',                'icon' => 'Network',      'color' => '#FF6D00', 'description' => 'Redes de computadoras y protocolos'],
            ['name' => 'Sistemas Operativos',   'slug' => 'sistemas-operativos',  'icon' => 'Monitor',      'color' => '#FF5252', 'description' => 'Conceptos de sistemas operativos y concurrencia'],
            ['name' => 'Estructuras de Datos',  'slug' => 'estructuras-de-datos', 'icon' => 'TreePine',     'color' => '#AB47BC', 'description' => 'Listas, árboles, grafos y más'],
            ['name' => 'Desarrollo Web',        'slug' => 'desarrollo-web',       'icon' => 'Globe',        'color' => '#26C6DA', 'description' => 'Frontend, backend y fullstack'],
            ['name' => 'Desarrollo Backend',     'slug' => 'desarrollo-backend',   'icon' => 'Server',       'color' => '#64B5F6', 'description' => 'APIs, servidores, bases de datos y lógica de negocio'],
            ['name' => 'Desarrollo Frontend',    'slug' => 'desarrollo-frontend',  'icon' => 'Palette',      'color' => '#F06292', 'description' => 'Interfaces, componentes, frameworks y experiencia de usuario'],
            ['name' => 'DevOps',                 'slug' => 'devops',               'icon' => 'Container',    'color' => '#81C784', 'description' => 'CI/CD, contenedores, cloud y automatización'],
            ['name' => 'Git y Control de Versiones', 'slug' => 'git',              'icon' => 'GitFork',      'color' => '#FF7043', 'description' => 'Git, ramas, colaboración y flujos de trabajo'],
            ['name' => 'Ingeniería de Software', 'slug' => 'ingenieria-software',  'icon' => 'ClipboardList','color' => '#9575CD', 'description' => 'Requerimientos, diseño, arquitectura y gestión de proyectos'],
            ['name' => 'IA para Desarrollo',     'slug' => 'ia-desarrollo',        'icon' => 'Sparkles',     'color' => '#4DB6AC', 'description' => 'LLMs, prompt engineering y desarrollo asistido por IA'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
