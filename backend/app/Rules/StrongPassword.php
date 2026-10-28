<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('La contraseña debe ser una cadena de texto.');
            return;
        }

        if (strlen($value) < 8) {
            $fail('La contraseña debe contener al menos 8 caracteres.');
            return;
        }

        if (!preg_match('/[a-zA-Z]/', $value)) {
            $fail('Por seguridad, la contraseña debe contener al menos una letra.');
            return;
        }

        if (!preg_match('/[0-9]/', $value)) {
            $fail('Por seguridad, la contraseña debe contener al menos un número.');
            return;
        }
    }
}
