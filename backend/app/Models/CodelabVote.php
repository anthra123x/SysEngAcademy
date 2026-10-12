<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodelabVote extends Model
{
    use HasFactory;

    protected $table = 'codelab_votes';

    protected $fillable = [
        'challenge_id',
        'user_id',
        'ip_address',
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
