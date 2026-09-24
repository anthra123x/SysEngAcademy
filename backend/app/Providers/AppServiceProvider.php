<?php

namespace App\Providers;

use App\Auth\JwtGuard;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Guard stateless JWT: verifica firma sin tocar la BD y resuelve
        // el usuario con cache-aside. Se usa con prioridad sobre Sanctum
        // en rutas protegidas (auth:jwt,sanctum).
        Auth::extend('jwt', function ($app) {
            return new JwtGuard(
                $app['auth']->createUserProvider(config('auth.guards.jwt.provider')),
                $app['request'],
            );
        });
    }
}
