<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodelabSubmission extends Model
{
    use HasFactory;

    protected $table = 'codelab_submissions';

    protected $fillable = [
        'challenge_id',
        'user_id',
        'language',
        'code',
        'status',
        'execution_time_ms',
        'memory_mb',
        'passed_cases',
        'total_cases',
        'stdout',
        'stderr',
    ];

    protected $casts = [
        'execution_time_ms' => 'integer',
        'memory_mb' => 'float',
        'passed_cases' => 'integer',
        'total_cases' => 'integer',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(CodelabChallenge::class, 'challenge_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
