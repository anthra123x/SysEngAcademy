<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodelabComment extends Model
{
    use HasFactory;

    protected $table = 'codelab_comments';

    protected $fillable = [
        'challenge_id',
        'user_id',
        'author_name',
        'author_username',
        'author_role',
        'author_avatar',
        'is_ai',
        'content',
        'code_snippet',
        'upvotes',
    ];

    protected $casts = [
        'is_ai' => 'boolean',
        'upvotes' => 'integer',
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
