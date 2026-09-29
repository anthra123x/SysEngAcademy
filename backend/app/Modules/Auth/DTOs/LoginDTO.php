<?php

namespace App\Modules\Auth\DTOs;

class LoginDTO
{
    public function __construct(
        public readonly string $email,
        public readonly string $password
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            email: strtolower(trim($data['email'] ?? '')),
            password: (string) ($data['password'] ?? '')
        );
    }
}
