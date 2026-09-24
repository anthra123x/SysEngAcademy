<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\AiChatController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/learning-paths', [LearningPathController::class, 'index']);
Route::get('/learning-paths/{slug}', [LearningPathController::class, 'show']);
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::get('/lessons/{slug}', [LessonController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);

    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete']);

    Route::get('/ai/conversations', [AiChatController::class, 'conversations']);
    Route::post('/ai/conversations', [AiChatController::class, 'store']);
    Route::get('/ai/conversations/{conversation}', [AiChatController::class, 'show']);
    Route::post('/ai/conversations/{conversation}/message', [AiChatController::class, 'message']);
});

