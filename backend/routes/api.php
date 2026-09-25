<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\LessonController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/home', [HomeController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/learning-paths', [LearningPathController::class, 'index']);
Route::get('/learning-paths/{slug}', [LearningPathController::class, 'show']);
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::get('/lessons/{slug}', [LessonController::class, 'show']);

// Protected routes: JWT stateless primero (sin consulta a BD), con
// fallback a Sanctum para tokens legados / tests.
Route::middleware('auth:jwt,sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);

    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete']);
    Route::post('/lessons/{lesson}/quiz/attempt', [LessonController::class, 'attempt']);

    Route::post('/ai/ask', [AiChatController::class, 'ask']);
    Route::post('/ai/practice', [AiChatController::class, 'practice']);

    Route::get('/ai/conversations', [AiChatController::class, 'conversations']);
    Route::post('/ai/conversations', [AiChatController::class, 'store']);
    Route::get('/ai/conversations/{conversation}', [AiChatController::class, 'show']);
    Route::post('/ai/conversations/{conversation}/message', [AiChatController::class, 'message']);
    Route::post('/ai/conversations/{conversation}/stream', [AiChatController::class, 'streamMessage']);
});
