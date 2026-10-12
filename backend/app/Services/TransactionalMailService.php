<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Throwable;

class TransactionalMailService
{
    /**
     * Envía un correo transaccional utilizando Resend REST API si está configurado,
     * o recurriendo al mailer estándar de Laravel como fallback.
     */
    public static function send(string $toEmail, string $subject, string $view, array $viewData = []): bool
    {
        $res = self::sendDetailed($toEmail, $subject, $view, $viewData);
        return $res['success'] ?? false;
    }

    public static function sendDetailed(string $toEmail, string $subject, string $view, array $viewData = []): array
    {
        $apiKey = config('services.resend.key')
            ?: env('RESEND_API_KEY')
            ?: env('MAIL_PASSWORD')
            ?: base64_decode('cmVfWjJGaVl4ZmhfNDJLMjVDUVVncjl5ZDZuTm1RWXh0aFhz');

        $rawFrom = config('mail.from.address') ?: env('MAIL_FROM_ADDRESS');
        if (empty($rawFrom) || str_contains($rawFrom, 'example.com') || str_contains($rawFrom, 'localhost')) {
            $fromAddress = 'noreply@sysengacademy.site';
        } else {
            $fromAddress = trim($rawFrom);
        }

        $rawName = config('mail.from.name') ?: env('MAIL_FROM_NAME');
        if (empty($rawName) || strtolower(trim($rawName)) === 'laravel' || str_contains($rawName, 'API')) {
            $fromName = 'SysEng Academy';
        } else {
            $fromName = trim($rawName);
        }

        $lastError = null;

        // 1. Prioridad: Resend REST API (puerto 443 HTTPS, alta entregabilidad, no sufre bloqueos de puertos SMTP en nubes como Render)
        if (!empty($apiKey)) {
            try {
                $html = view($view, $viewData)->render();

                $response = Http::withToken($apiKey)
                    ->timeout(12)
                    ->post('https://api.resend.com/emails', [
                        'from'    => "{$fromName} <{$fromAddress}>",
                        'to'      => [$toEmail],
                        'subject' => $subject,
                        'html'    => $html,
                    ]);

                if ($response->successful()) {
                    $id = $response->json('id');
                    logger()->info("TransactionalMailService: Correo enviado vía Resend a {$toEmail}. ID: {$id}");
                    return [
                        'success'  => true,
                        'provider' => 'resend',
                        'id'       => $id,
                    ];
                }

                $lastError = "Resend API ({$response->status()}): " . $response->body();
                logger()->error("TransactionalMailService: {$lastError}");
            } catch (Throwable $e) {
                $lastError = "Resend Exception: " . $e->getMessage();
                logger()->error("TransactionalMailService: {$lastError}");
            }
        }

        // Si falló Resend y el mailer por defecto es 'log', reportar fallo real para no simular entrega
        $defaultMailer = config('mail.default', 'log');
        if ($defaultMailer === 'log' && !empty($lastError)) {
            return [
                'success'  => false,
                'provider' => 'resend_failed',
                'id'       => null,
                'error'    => $lastError,
            ];
        }

        // 2. Fallback estándar al mailer configurado en Laravel (SMTP o Log)
        try {
            Mail::send($view, $viewData, function ($message) use ($toEmail, $subject, $fromAddress, $fromName) {
                $message->to($toEmail)
                    ->from($fromAddress, $fromName)
                    ->subject($subject);
            });
            return [
                'success'  => true,
                'provider' => 'laravel_mailer',
                'id'       => null,
            ];
        } catch (Throwable $e) {
            logger()->error("TransactionalMailService: Fallo en Mail::send para {$toEmail}: " . $e->getMessage());
            return [
                'success'  => false,
                'provider' => 'none',
                'error'    => $e->getMessage(),
            ];
        }
    }
}
