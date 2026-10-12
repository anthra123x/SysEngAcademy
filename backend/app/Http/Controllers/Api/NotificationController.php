<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Retorna la bandeja de notificaciones del estudiante y el conteo no leído.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Sincronizar logros y verificar novedades
        $this->notificationService->syncAchievements($user);

        $notifications = $user->appNotifications()
            ->recent(40)
            ->get()
            ->map(function (Notification $n) {
                return [
                    'id'         => $n->id,
                    'type'       => $n->type,
                    'title'      => $n->title,
                    'message'    => $n->message,
                    'data'       => $n->data,
                    'read_at'    => $n->read_at ? $n->read_at->toIso8601String() : null,
                    'created_at' => $n->created_at ? $n->created_at->toIso8601String() : null,
                ];
            });

        $unreadCount = $user->appNotifications()->unread()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    /**
     * Marca una notificación específica como leída.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = $request->user()->appNotifications()->findOrFail($id);
        $notification->markAsRead();

        $unreadCount = $request->user()->appNotifications()->unread()->count();

        return response()->json([
            'success'      => true,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Marca todas las notificaciones pendientes como leídas.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->appNotifications()->unread()->update(['read_at' => now()]);

        return response()->json([
            'success'      => true,
            'unread_count' => 0,
        ]);
    }

    /**
     * Elimina una notificación de la bandeja.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = $request->user()->appNotifications()->findOrFail($id);
        $notification->delete();

        $unreadCount = $request->user()->appNotifications()->unread()->count();

        return response()->json([
            'success'      => true,
            'unread_count' => $unreadCount,
        ]);
    }
}
