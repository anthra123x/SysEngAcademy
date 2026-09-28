<?php

require __DIR__ . '/../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\Module;

echo "=== Exportando Base de Datos a Archivos de Producción Frontend ===\n";

// 1. Categorías
$categories = Category::withCount('courses')->get()->map(function ($cat) {
    return [
        'id' => $cat->id,
        'name' => $cat->name,
        'slug' => $cat->slug,
        'icon' => $cat->icon ?? 'Code',
        'color' => $cat->color ?? '#6C63FF',
        'description' => $cat->description ?? '',
        'courses_count' => $cat->courses_count,
    ];
})->values()->toArray();

echo "  ✓ Categorías procesadas: " . count($categories) . "\n";

// 2. Cursos completos con módulos y lecciones
$courses = Course::with(['category', 'learningPath', 'modules.lessons' => function ($q) {
    $q->orderBy('order');
}])->orderBy('order')->get()->map(function ($course) {
    $modules = $course->modules->sortBy('order')->map(function ($mod) {
        $lessons = $mod->lessons->sortBy('order')->map(function ($l) {
            return [
                'id' => $l->id,
                'module_id' => $l->module_id,
                'title' => $l->title,
                'slug' => $l->slug,
                'type' => $l->type,
                'duration_minutes' => $l->duration_minutes ?? 15,
                'order' => $l->order,
                'is_preview' => (bool)$l->is_preview,
            ];
        })->values()->toArray();

        return [
            'id' => $mod->id,
            'course_id' => $mod->course_id,
            'title' => $mod->title,
            'description' => $mod->description,
            'order' => $mod->order,
            'lessons' => $lessons,
        ];
    })->values()->toArray();

    $totalLessons = 0;
    foreach ($modules as $m) {
        $totalLessons += count($m['lessons']);
    }

    return [
        'id' => $course->id,
        'title' => $course->title,
        'slug' => $course->slug,
        'description' => $course->description ?? '',
        'category_id' => $course->category_id,
        'learning_path_id' => $course->learning_path_id,
        'learning_path_level_id' => $course->learning_path_level_id,
        'difficulty' => $course->difficulty ?? 'intermediate',
        'thumbnail' => $course->thumbnail,
        'is_published' => (bool)$course->is_published,
        'is_free' => (bool)$course->is_free,
        'price' => (float)($course->price ?? 0),
        'duration_hours' => $course->duration_hours ?? 10,
        'order' => $course->order,
        'lessons_count' => $totalLessons,
        'category' => $course->category ? [
            'id' => $course->category->id,
            'name' => $course->category->name,
            'slug' => $course->category->slug,
            'icon' => $course->category->icon ?? 'Code',
            'color' => $course->category->color ?? '#6C63FF',
            'description' => $course->category->description ?? '',
        ] : null,
        'modules' => $modules,
    ];
})->values()->toArray();

echo "  ✓ Cursos procesados: " . count($courses) . "\n";

// 3. Rutas de Aprendizaje completas con niveles e hitos
$paths = LearningPath::with(['category', 'levels.courses.category'])->orderBy('id')->get()->map(function ($p) {
    $levels = $p->levels->sortBy('order')->map(function ($lvl) {
        $courses = $lvl->courses->map(function ($c) {
            return [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'description' => $c->description ?? '',
                'difficulty' => $c->difficulty ?? 'intermediate',
                'is_published' => (bool)$c->is_published,
                'is_free' => (bool)$c->is_free,
                'duration_hours' => $c->duration_hours ?? 10,
                'lessons_count' => Lesson::whereIn('module_id', Module::where('course_id', $c->id)->pluck('id'))->count(),
                'category' => $c->category ? [
                    'id' => $c->category->id,
                    'name' => $c->category->name,
                    'slug' => $c->category->slug,
                    'icon' => $c->category->icon ?? 'Code',
                    'color' => $c->category->color ?? '#6C63FF',
                ] : null,
            ];
        })->values()->toArray();

        return [
            'id' => $lvl->id,
            'learning_path_id' => $lvl->learning_path_id,
            'title' => $lvl->title,
            'description' => $lvl->description,
            'order' => $lvl->order,
            'courses' => $courses,
        ];
    })->values()->toArray();

    $totalCourses = 0;
    foreach ($levels as $l) {
        $totalCourses += count($l['courses']);
    }

    return [
        'id' => $p->id,
        'title' => $p->title,
        'slug' => $p->slug,
        'description' => $p->description,
        'difficulty' => $p->difficulty ?? 'intermediate',
        'is_published' => (bool)$p->is_published,
        'estimated_hours' => $p->estimated_hours ?? 60,
        'courses_count' => $totalCourses,
        'category_id' => $p->category_id,
        'category' => $p->category ? [
            'id' => $p->category->id,
            'name' => $p->category->name,
            'slug' => $p->category->slug,
            'icon' => $p->category->icon ?? 'Code',
            'color' => $p->category->color ?? '#6C63FF',
            'description' => $p->category->description ?? '',
        ] : null,
        'levels' => $levels,
    ];
})->values()->toArray();

echo "  ✓ Rutas procesadas: " . count($paths) . "\n";

// 4. Todas las lecciones individuales didácticas
$allLessons = Lesson::with('module.course')->get();
echo "  ✓ Lecciones a exportar: " . $allLessons->count() . "\n";

$lessonsDict = [];
foreach ($allLessons as $l) {
    $course = $l->module ? $l->module->course : null;
    $lessonsDict[$l->slug] = [
        'id' => $l->id,
        'module_id' => $l->module_id,
        'title' => $l->title,
        'slug' => $l->slug,
        'type' => $l->type,
        'duration_minutes' => $l->duration_minutes ?? 15,
        'order' => $l->order,
        'is_preview' => (bool)$l->is_preview,
        'content' => $l->content ?? "### {$l->title}\n\nBienvenido a esta lección práctica.",
        'starter_code' => $l->starter_code,
        'solution' => $l->solution,
        'test_cases' => $l->test_cases,
        'hint' => $l->hint,
        'language' => $l->language ?? 'python',
        'completed' => false,
        'quiz' => null,
        'module' => $l->module ? [
            'id' => $l->module->id,
            'title' => $l->module->title,
            'course_id' => $l->module->course_id,
            'course_slug' => $course ? $course->slug : '',
            'course_title' => $course ? $course->title : '',
            'course' => $course ? [
                'id' => $course->id,
                'slug' => $course->slug,
                'title' => $course->title,
            ] : null,
        ] : null,
    ];
}

// 5. Generar frontend/src/app/core/services/fallback-data.ts
$fallbackDataContent = "import { Category, Course, LearningPath, PaginatedResponse } from '../models';\n"
    . "import { HomeData } from './home.service';\n"
    . "import { TeacherOverviewResponse } from './teacher.service';\n\n"
    . "export const FALLBACK_CATEGORIES: Category[] = " . json_encode($categories, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n"
    . "export const FALLBACK_COURSES: Course[] = " . json_encode($courses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n"
    . "export const FALLBACK_LEARNING_PATHS: LearningPath[] = " . json_encode($paths, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n\n"
    . "export const FALLBACK_HOME_DATA: HomeData = {\n"
    . "    categories: FALLBACK_CATEGORIES,\n"
    . "    learning_paths: {\n"
    . "        current_page: 1,\n"
    . "        data: FALLBACK_LEARNING_PATHS,\n"
    . "        total: " . count($paths) . ",\n"
    . "        per_page: 12,\n"
    . "        last_page: 1\n"
    . "    },\n"
    . "    courses: {\n"
    . "        current_page: 1,\n"
    . "        data: FALLBACK_COURSES,\n"
    . "        total: " . count($courses) . ",\n"
    . "        per_page: 16,\n"
    . "        last_page: " . max(1, (int)ceil(count($courses) / 16)) . "\n"
    . "    }\n};\n\n";
$popularCourses = array_slice(array_map(function($c) {
    return [
        'id' => $c['id'],
        'title' => $c['title'],
        'slug' => $c['slug'],
        'difficulty' => $c['difficulty'],
        'enrollments_count' => 84,
    ];
}, $courses), 0, 5);

$fallbackDataContent .= "export const FALLBACK_TEACHER_OVERVIEW: TeacherOverviewResponse = {\n"
    . "    stats: {\n"
    . "        total_students: 1248,\n"
    . "        total_courses: " . count($courses) . ",\n"
    . "        total_completions: 3412,\n"
    . "        total_enrollments: 2540,\n"
    . "        average_score: 94.5\n"
    . "    },\n"
    . "    recent_activity: [],\n"
    . "    popular_courses: " . json_encode($popularCourses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
    . "};\n";

$targetDataFile = __DIR__ . '/../../../frontend/src/app/core/services/fallback-data.ts';
file_put_contents($targetDataFile, $fallbackDataContent);
echo "  ✓ Escrito fallback-data.ts (" . number_format(filesize($targetDataFile)) . " bytes)\n";

// 6. Generar frontend/src/app/core/services/fallback-lessons.ts
$fallbackLessonsContent = "import { LessonDetail } from '../models';\n\n"
    . "export const FALLBACK_LESSONS: Record<string, LessonDetail> = " . json_encode($lessonsDict, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n";

$targetLessonsFile = __DIR__ . '/../../../frontend/src/app/core/services/fallback-lessons.ts';
file_put_contents($targetLessonsFile, $fallbackLessonsContent);
echo "  ✓ Escrito fallback-lessons.ts (" . number_format(filesize($targetLessonsFile)) . " bytes)\n";

echo "\n=== Exportación Completada Exitosamente ===\n";
