<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@sysengacademy.dev'], [
            'name'     => 'Admin SysEng',
            'password' => Hash::make('admin1234'),
            'role'     => 'admin',
        ]);

        User::firstOrCreate(['email' => 'instructor@sysengacademy.dev'], [
            'name'     => 'Carlos Instructor',
            'password' => Hash::make('instructor1234'),
            'role'     => 'instructor',
        ]);

        User::firstOrCreate(['email' => 'estudiante@sysengacademy.dev'], [
            'name'     => 'Ana Estudiante',
            'password' => Hash::make('estudiante1234'),
            'role'     => 'student',
        ]);
    }
}
