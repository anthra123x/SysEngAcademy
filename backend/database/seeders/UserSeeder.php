<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
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

        // 2. Administrador de Plataforma
        User::updateOrCreate(['email' => 'admin@sysengacademy.dev'], [
            'name'              => 'Admin SysEng',
            'password'          => Hash::make('admin1234'),
            'role'              => 'admin',
            'email_verified_at' => now(),
        ]);

        // 3. Docente / Instructor Colega
        $instructor = User::updateOrCreate(['email' => 'instructor@sysengacademy.dev'], [
            'name'              => 'Carlos Instructor',
            'password'          => Hash::make('instructor1234'),
            'role'              => 'instructor',
            'email_verified_at' => now(),
        ]);

        // 4. Usuario de Prueba: Estudiante Demo
        $student = User::updateOrCreate(['email' => 'estudiante@sysengacademy.dev'], [
            'name'              => 'Ana Estudiante (Demo)',
            'password'          => Hash::make('estudiante1234'),
            'role'              => 'student',
            'email_verified_at' => now(),
        ]);

        // 5. Asignar cursos a los docentes para gestión de múltiples cuentas
        $courses = Course::take(8)->get();
        foreach ($courses as $index => $course) {
            $assignedInstructor = ($index % 2 === 0) ? $teacher : $instructor;
            $course->instructor_id = $assignedInstructor->id;
            $course->save();
        }

        // 6. Matricular al estudiante de prueba en cursos con progreso real
        $sampleCourses = Course::take(4)->get();
        if ($sampleCourses->isNotEmpty()) {
            $progressData = [100, 65, 40, 100];
            foreach ($sampleCourses as $idx => $c) {
                $pct = $progressData[$idx] ?? 50;
                Enrollment::updateOrCreate(
                    ['user_id' => $student->id, 'course_id' => $c->id],
                    [
                        'enrolled_at'      => now()->subDays(15 - ($idx * 3)),
                        'completed_at'     => $pct === 100 ? now()->subDays(5 - $idx) : null,
                        'progress_percent' => $pct,
                    ]
                );
            }
        }

        // 7. Registrar lecciones completadas y notas de quizzes para el estudiante de prueba
        $lessons = Lesson::take(8)->get();
        $sampleScores = [95, 90, 100, 85, null, 100, 80, null];
        foreach ($lessons as $i => $lesson) {
            LessonProgress::updateOrCreate(
                ['user_id' => $student->id, 'lesson_id' => $lesson->id],
                [
                    'score'        => $sampleScores[$i] ?? null,
                    'completed_at' => now()->subDays(12 - $i),
                ]
            );
        }
    }
}
