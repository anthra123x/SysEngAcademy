<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CodeExecutionController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseReviewController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\GitHubSyncController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\StreakController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

// Public routes (Rate limited para prevenir abusos y ataques DoS / fuerza bruta)
// Endpoints de salud y calentamiento continuo para cron-job.org y monitores uptime
Route::match(['GET', 'HEAD'], '/health', function () {
    $dbOk = false;
    try {
        \Illuminate\Support\Facades\DB::select('SELECT 1');
        $dbOk = true;
    } catch (\Throwable) {}

    return response()->json([
        'status' => 'ok',
        'service' => 'SysEng Academy API',
        'database' => $dbOk ? 'connected' : 'error',
        'timestamp' => now()->timestamp,
        'uptime_ping' => now()->toIso8601String(),
    ]);
});

Route::match(['GET', 'HEAD'], '/ping', fn () => response('pong', 200, ['Content-Type' => 'text/plain']));

Route::match(['GET', 'HEAD'], '/cron/keep-alive', function () {
    $dbOk = false;
    try {
        \Illuminate\Support\Facades\DB::select('SELECT 1');
        $dbOk = true;
    } catch (\Throwable) {}

    return response()->json([
        'status' => 'alive',
        'cron_source' => request()->header('User-Agent', 'cron-job'),
        'database' => $dbOk ? 'warm' : 'retry',
        'timestamp' => now()->timestamp,
    ]);
});
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->whereIn('provider', ['google', 'github']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->whereIn('provider', ['google', 'github']);
Route::post('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->whereIn('provider', ['google', 'github']);
Route::post('/auth/{provider}/exchange', [SocialAuthController::class, 'exchange'])->whereIn('provider', ['google', 'github'])->middleware('throttle:30,1');
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:15,1');
Route::post('/auth/register/request-code', [AuthController::class, 'requestRegistrationCode'])->middleware('throttle:15,1');
Route::post('/auth/register/confirm', [AuthController::class, 'confirmRegistration'])->middleware('throttle:15,1');
Route::post('/auth/register/resend-code', [AuthController::class, 'resendRegistrationCode'])->middleware('throttle:6,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:20,1');
Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:15,1');
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:10,1');

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

// Telemetría de Racha y Hábito de Estudio (público / híbrido con fallback de email o token)
Route::post('/user/activity-ping', [StreakController::class, 'ping']);
Route::get('/user/streak', [StreakController::class, 'status']);
Route::get('/user/streak/recovery-drill', [StreakController::class, 'recoveryDrill']);
Route::post('/user/streak/recover', [StreakController::class, 'recover']);

// Code execution routes (public, rate limited)
Route::get('/languages', [CodeExecutionController::class, 'languages']);
Route::post('/code/execute', [CodeExecutionController::class, 'execute']);

// Evaluación asistida por IA (híbrido: público con guardado automático para estudiantes autenticados)
Route::post('/ai/evaluate-challenge', [AiChatController::class, 'evaluateChallenge']);
Route::post('/ai/quiz-feedback', [AiChatController::class, 'quizFeedback']);

// Protected routes: JWT stateless primero (sin consulta a BD), con
// fallback a Sanctum para tokens legados / tests.
Route::middleware('auth:jwt,sanctum')->group(function () {
    // CodeLab (Retos & Sandbox Comunitario - Exclusivo para estudiantes autenticados)
    Route::get('/codelab/challenges', [\App\Http\Controllers\Api\CodelabController::class, 'index']);
    Route::get('/codelab/challenges/{slug}', [\App\Http\Controllers\Api\CodelabController::class, 'show']);
    Route::post('/codelab/challenges', [\App\Http\Controllers\Api\CodelabController::class, 'store'])->middleware('throttle:15,1');
    Route::post('/codelab/challenges/{id}/vote', [\App\Http\Controllers\Api\CodelabController::class, 'vote'])->middleware('throttle:30,1');
    Route::get('/codelab/challenges/{id}/comments', [\App\Http\Controllers\Api\CodelabController::class, 'getComments']);
    Route::post('/codelab/challenges/{id}/comments', [\App\Http\Controllers\Api\CodelabController::class, 'storeComment'])->middleware('throttle:30,1');
    Route::post('/codelab/challenges/{id}/submit', [\App\Http\Controllers\Api\CodelabController::class, 'submit'])->middleware('throttle:20,1');
    Route::get('/codelab/stats', [\App\Http\Controllers\Api\CodelabController::class, 'stats']);
    Route::get('/codelab/stream', [\App\Http\Controllers\Api\CodelabController::class, 'stream']);
    Route::post('/codelab/generate-ai-challenge', [\App\Http\Controllers\Api\CodelabController::class, 'generateAiChallenge'])->middleware('throttle:10,1');

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/test-email', [AuthController::class, 'testEmail'])->middleware('throttle:6,1');
    Route::post('/auth/confirm-test-email', [AuthController::class, 'confirmTestEmail'])->middleware('throttle:10,1');
    Route::get('/auth/social/status', [SocialAuthController::class, 'status']);
    Route::delete('/auth/social/{provider}', [SocialAuthController::class, 'disconnect'])->whereIn('provider', ['google', 'github']);
    Route::get('/github/status', [GitHubSyncController::class, 'status']);
    Route::post('/github/sync', [GitHubSyncController::class, 'sync'])->middleware('throttle:20,1');
    Route::get('/profile/summary', [ProfileController::class, 'show']);

    // Notificaciones de usuario (Bandeja / Campanita)
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);

    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);

    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete']);
    Route::post('/lessons/{lesson}/quiz/attempt', [LessonController::class, 'attempt']);
    Route::post('/lessons/sync-guest-progress', [LessonController::class, 'syncGuestProgress']);

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
    Route::get('/ai/diagnostic', [\App\Http\Controllers\Api\DiagnosticController::class, 'getSavedDiagnostic']);
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
