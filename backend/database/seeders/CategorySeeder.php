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
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
