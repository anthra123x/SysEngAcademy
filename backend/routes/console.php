<?php

use App\Services\AiCodelabChallengeService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('codelab:generate-ai-challenges {--count=2 : Cantidad de retos a generar} {--force : Forzar generación ignorando retos existentes hoy}', function (AiCodelabChallengeService $aiService) {
    $count = (int) ($this->option('count') ?: 2);
    $force = (bool) $this->option('force');

    $this->info("🤖 Iniciando Agente Algorítmico Byte AI para CodeLab...");

    if ($force) {
        $challenges = $aiService->generateMultipleChallenges($count);
    } else {
        $challenges = $aiService->ensureDailyChallenges($count);
    }

    if (empty($challenges)) {
        $this->comment("✓ La facultad ya cuenta con retos publicados hoy por la comunidad o el agente. No se requirió generación.");
    } else {
        foreach ($challenges as $c) {
            $langs = implode(', ', $c->languages ?? []);
            $this->info("✓ Reto creado: [{$c->category}] '{$c->title}' ({$c->difficulty}) en [{$langs}]");
        }
        $this->info("🎉 Se generaron " . count($challenges) . " retos con éxito.");
    }
})->purpose('Agente de IA: genera retos de programación diarios en múltiples lenguajes para CodeLab');

// Programación diaria automática: el agente se ejecuta todos los días a las 00:05
Schedule::command('codelab:generate-ai-challenges --count=2')->dailyAt('00:05');
