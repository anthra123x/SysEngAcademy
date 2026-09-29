<?php

namespace App\Modules\Users\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    /**
     * Obtiene usuarios filtrados por rol con paginación opcional.
     */
    public function getUsersByRole(string $role, int $perPage = 25): LengthAwarePaginator
    {
        return User::where('role', $role)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Verifica si un usuario tiene rol docente o administrador.
     */
    public function isTeacherOrAdmin(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return in_array($user->role, ['admin', 'instructor'], true)
            || $user->email === 'andrescamilomartinez330@gmail.com';
    }

    /**
     * Obtiene el listado de docentes disponibles para asignación curricular.
     */
    public function getInstructors(): Collection
    {
        return User::whereIn('role', ['instructor', 'admin'])
            ->select('id', 'name', 'email', 'role')
            ->get();
    }

    /**
     * Busca usuarios por nombre o correo electrónico.
     */
    public function search(string $term, ?string $role = null): Collection
    {
        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        return $query->where(function ($q) use ($term) {
            $q->where('name', 'ilike', "%{$term}%")
              ->orWhere('email', 'ilike', "%{$term}%");
        })->take(20)->get();
    }
}
