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
        $apiKey = config('services.resend.key')
            ?: env('RESEND_API_KEY')
            ?: env('MAIL_PASSWORD');
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
                    ->timeout(8)
                    ->post('https://api.resend.com/emails', [
                        'from'    => "{$fromName} <{$fromAddress}>",
                        'to'      => [$toEmail],
                        'subject' => $subject,
                        'html'    => $html,
                    ]);

                if ($response->successful()) {
                    $id = $response->json('id');
                    logger()->info("TransactionalMailService: Correo enviado vía Resend a {$toEmail}. ID: {$id}");
                    return true;
                }

                logger()->warning("TransactionalMailService: Resend API devolvió código {$response->status()}: " . $response->body());
            } catch (Throwable $e) {
                logger()->error("TransactionalMailService: Excepción conectando a Resend API: " . $e->getMessage());
            }
        }

        // 2. Fallback estándar al mailer configurado en Laravel (SMTP o Log)
        try {
            Mail::send($view, $viewData, function ($message) use ($toEmail, $subject) {
                $message->to($toEmail)->subject($subject);
            });
            return true;
        } catch (Throwable $e) {
            logger()->error("TransactionalMailService: Fallo en Mail::send para {$toEmail}: " . $e->getMessage());
            return false;
        }
    }
}
