<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CodeExecutionController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseReviewController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\ClanController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StreakController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);

Route::get('/home', [HomeController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/learning-paths', [LearningPathController::class, 'index']);
Route::get('/learning-paths/{slug}', [LearningPathController::class, 'show']);
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);
Route::get('/courses/{slug}/reviews', [CourseReviewController::class, 'index']);
Route::get('/lessons/{slug}', [LessonController::class, 'show']);
Route::get('/courses/{course}/forum', [ForumController::class, 'index']);
Route::get('/forum/posts/{id}', [ForumController::class, 'show']);
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// Clanes y Telemetría de Racha (público / híbrido con fallback de email o token)
Route::get('/clans', [ClanController::class, 'index']);
Route::get('/clans/{id}', [ClanController::class, 'show']);
Route::post('/user/activity-ping', [StreakController::class, 'ping']);
Route::get('/user/streak', [StreakController::class, 'status']);
Route::get('/user/streak/recovery-drill', [StreakController::class, 'recoveryDrill']);
Route::post('/user/streak/recover', [StreakController::class, 'recover']);
Route::post('/clans/{id}/join', [ClanController::class, 'join']);
Route::post('/clans/{id}/leave', [ClanController::class, 'leave']);
Route::post('/clans/{id}/posts', [ClanController::class, 'storePost']);
Route::post('/clans/posts/{postId}/upvote', [ClanController::class, 'toggleUpvote']);
Route::post('/clans/posts/{postId}/comments', [ClanController::class, 'storeComment']);
Route::post('/clans', [ClanController::class, 'storeClan']);

// Workflow de Ingeniería de Clanes (Kanban, Git, PRs, Vercel, Cátedra)
Route::post('/clans/{id}/projects/{projectId}/tasks', [ClanController::class, 'storeProjectTask']);
Route::patch('/clans/{id}/projects/{projectId}/tasks/{taskId}/status', [ClanController::class, 'updateProjectTaskStatus']);
Route::post('/clans/{id}/projects/{projectId}/tasks/{taskId}/assign', [ClanController::class, 'assignProjectTask']);
Route::post('/clans/{id}/projects/{projectId}/pull-requests', [ClanController::class, 'storeProjectPullRequest']);
Route::post('/clans/{id}/projects/{projectId}/pull-requests/{prId}/reviews', [ClanController::class, 'reviewProjectPullRequest']);
Route::post('/clans/{id}/projects/{projectId}/pull-requests/{prId}/merge', [ClanController::class, 'mergeProjectPullRequest']);
Route::post('/clans/{id}/posts/{postId}/endorse', [ClanController::class, 'endorsePost']);
Route::post('/clans/{id}/drills/resolve', [ClanController::class, 'resolveDrill']);

// Code execution routes (public, rate limited)
Route::get('/languages', [CodeExecutionController::class, 'languages']);
Route::post('/code/execute', [CodeExecutionController::class, 'execute']);

// Protected routes: JWT stateless primero (sin consulta a BD), con
// fallback a Sanctum para tokens legados / tests.
Route::middleware('auth:jwt,sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/profile/summary', [ProfileController::class, 'show']);

    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);

    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete']);
    Route::post('/lessons/{lesson}/quiz/attempt', [LessonController::class, 'attempt']);

    // Calificaciones y Reseñas
    Route::post('/courses/{slug}/reviews', [CourseReviewController::class, 'store']);
    Route::delete('/courses/{slug}/reviews', [CourseReviewController::class, 'destroy']);

    // Forum protected routes
    Route::post('/courses/{course}/forum', [ForumController::class, 'store']);
    Route::post('/forum/posts/{id}/replies', [ForumController::class, 'storeReply']);
    Route::post('/forum/posts/{id}/upvote', [ForumController::class, 'upvotePost']);
    Route::post('/forum/replies/{id}/solution', [ForumController::class, 'markSolution']);

    Route::post('/ai/ask', [AiChatController::class, 'ask']);
    Route::post('/ai/practice', [AiChatController::class, 'practice']);

    Route::get('/ai/conversations', [AiChatController::class, 'conversations']);
    Route::post('/ai/conversations', [AiChatController::class, 'store']);
    Route::get('/ai/conversations/{conversation}', [AiChatController::class, 'show']);
    Route::post('/ai/conversations/{conversation}/message', [AiChatController::class, 'message']);
    Route::post('/ai/conversations/{conversation}/stream', [AiChatController::class, 'streamMessage']);

    // Evaluación diagnóstica con IA
    Route::post('/ai/diagnostic', [\App\Http\Controllers\Api\DiagnosticController::class, 'evaluate']);

    Route::get('/profile/feedbacks', [ProfileController::class, 'feedbacks']);
    Route::get('/student/feedbacks', [ProfileController::class, 'feedbacks']);
    Route::post('/student/feedbacks/{id}/remediate', [ProfileController::class, 'remediateFeedback']);
    Route::post('/student/feedbacks/{id}/dismiss', [ProfileController::class, 'dismissFeedback']);
    Route::post('/student/feedbacks/clear-resolved', [ProfileController::class, 'clearResolvedFeedbacks']);

    // Teacher & Admin Dashboard routes
    Route::prefix('teacher')->group(function () {
        Route::get('/overview', [TeacherController::class, 'overview']);
        Route::get('/students', [TeacherController::class, 'students']);
        Route::get('/students/{id}', [TeacherController::class, 'studentDetail']);
        Route::patch('/students/{id}', [TeacherController::class, 'updateStudent']);
        Route::delete('/students/{id}', [TeacherController::class, 'deleteStudent']);
        Route::post('/students/{id}/feedback', [TeacherController::class, 'sendFeedback']);
        Route::get('/students/{id}/feedbacks', [TeacherController::class, 'listFeedbacks']);
        Route::post('/send-digest', [TeacherController::class, 'sendProgressDigest']);
        Route::post('/send-streak-reminders', [TeacherController::class, 'sendStreakReminder']);
    });
});
