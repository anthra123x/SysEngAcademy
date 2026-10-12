<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodelabTestCase extends Model
{
    use HasFactory;

    protected $table = 'codelab_test_cases';

    protected $fillable = [
        'challenge_id',
        'input',
        'expected_output',
        'is_hidden',
        'label',
        'order',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
        'order' => 'integer',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(CodelabChallenge::class, 'challenge_id');
    }
}
