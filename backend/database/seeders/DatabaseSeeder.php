<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            LearningPathSeeder::class,
            CourseSeeder::class,
        ]);

        // El contenido sembrado invalida cualquier caché previa para que
        // las respuestas de la API se regeneren con los datos nuevos.
        Cache::flush();
    }
}
