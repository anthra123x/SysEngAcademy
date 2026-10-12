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
            ?: base64_decode('cmVfWlF2cmRTZ3hfS0s0TVJkSEtzTXJRdnNHY1J2dE5rQ1lw');

        $fromAddress = config('mail.from.address')
            ?: env('MAIL_FROM_ADDRESS')
            ?: 'noreply@sysengacademy.site';

        $fromName = config('mail.from.name')
            ?: env('MAIL_FROM_NAME')
            ?: 'SysEng Academy';

        // 1. Prioridad: Resend REST API (puerto 443 HTTPS, alta entregabilidad, no sufre bloqueos de puertos SMTP en nubes como Render)
        if (!empty($apiKey)) {
            try {
                $html = view($view, $viewData)->render();

                $response = Http::withToken($apiKey)
                    ->timeout(10)
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

                logger()->error("TransactionalMailService: Resend API devolvió código {$response->status()}: " . $response->body());
            } catch (Throwable $e) {
                logger()->error("TransactionalMailService: Excepción conectando a Resend API: " . $e->getMessage());
            }
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
