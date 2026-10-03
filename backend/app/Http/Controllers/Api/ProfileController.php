<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Users\Services\StudentProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        protected StudentProfileService $profileService
    ) {}

    /**
     * Retorna el expediente, progreso y estadísticas del usuario autenticado.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'No autenticado.');
        }

        $summary = $this->profileService->getProfileSummary($user);

        return response()->json($summary);
    }

    /**
     * Retorna el historial de retroalimentaciones y llamados de atención del usuario.
     */
    public function feedbacks(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            $email = $request->query('email');
            if ($email) {
                $user = \App\Models\User::where('email', strtolower(trim($email)))->first();
            }
        }

        if (!$user) {
            return response()->json([]);
        }

        $feedbacks = \App\Models\StudentFeedback::where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($feedbacks);
    }
}
