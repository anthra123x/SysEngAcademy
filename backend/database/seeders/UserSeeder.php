<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Docente / Administrador Principal
        $teacher = User::updateOrCreate(['email' => 'andrescamilomartinez330@gmail.com'], [
            'name'              => 'Prof. Andrés Camilo Martínez',
            'password'          => Hash::make('kimetsunoyaiBa1'),
            'role'              => 'admin',
            'email_verified_at' => now(),
        ]);

        // 2. Asignar todos los cursos al profesor
        Course::query()->update(['instructor_id' => $teacher->id]);
    }
}
