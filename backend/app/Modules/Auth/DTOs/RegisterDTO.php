<?php

namespace App\Modules\Auth\DTOs;

class RegisterDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly string $role = 'student'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: trim($data['name'] ?? ''),
            email: strtolower(trim($data['email'] ?? '')),
            password: (string) ($data['password'] ?? ''),
            role: $data['role'] ?? 'student'
        );
    }
}
