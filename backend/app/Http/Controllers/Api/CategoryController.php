<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        // Contenido casi estático: cache de 24h en caché de archivo
        // (evita el arranque en frío de la BD en cada visita).
        $categories = Cache::remember('api.categories.v1', now()->addDay(), function () {
            return Category::withCount('courses')->get()->toArray();
        });

        return response()->json($categories);
    }
}
