<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DiagnosticService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador de Evaluación Diagnóstica y Calibración de Ruta de Aprendizaje.
 * Delega la evaluación pedagógica y el cálculo determinístico a DiagnosticService.
 */
class DiagnosticController extends Controller
{
    public function __construct(
        protected DiagnosticService $diagnosticService
    ) {}

    /**
     * Consulta el dictamen diagnóstico almacenado previamente para el usuario.
     */
    public function getSavedDiagnostic(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        if ($user && !empty($user->diagnostic_result)) {
            return response()->json([
                'success' => true,
                'result'  => $user->diagnostic_result,
            ]);
        }

        return response()->json([
            'success' => false,
            'result'  => null,
        ]);
    }

    /**
     * Procesa y evalúa las respuestas diagnósticas con análisis crítico y realista.
     */
    public function evaluate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'answers'       => 'required|array',
            'questions'     => 'required|array',
            'student_name'  => 'required|string|max:200',
            'student_email' => 'required|string|max:200',
        ]);

        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $studentName = trim($validated['student_name']) ?: $user->name;

        $result = $this->diagnosticService->evaluate(
            user: $user,
            answers: $validated['answers'],
            questions: $validated['questions'],
            studentName: $studentName
        );

        return response()->json([
            'success' => true,
            'result'  => $result,
        ]);
    }

    /**
     * Resuelve de forma segura el usuario autenticado por token.
     */
    protected function resolveUser(Request $request): ?User
    {
        return $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();
    }
}
