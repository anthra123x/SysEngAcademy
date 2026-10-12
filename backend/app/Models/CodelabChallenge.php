<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CodelabChallenge extends Model
{
    use HasFactory;

    protected $table = 'codelab_challenges';

    protected $fillable = [
        'slug',
        'title',
        'description',
        'difficulty',
        'acceptance_rate',
        'xp',
        'category',
        'tags',
        'languages',
        'user_id',
        'author_name',
        'author_username',
        'author_role',
        'author_avatar',
        'is_official',
        'is_community',
        'is_spotlight',
        'upvotes',
        'comments_count',
        'starter_code',
        'solution_preview',
        'status',
    ];

    protected $casts = [
        'tags' => 'array',
        'languages' => 'array',
        'starter_code' => 'array',
        'solution_preview' => 'array',
        'is_official' => 'boolean',
        'is_community' => 'boolean',
        'is_spotlight' => 'boolean',
        'acceptance_rate' => 'float',
        'xp' => 'integer',
        'upvotes' => 'integer',
        'comments_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function testCases(): HasMany
    {
        return $this->hasMany(CodelabTestCase::class, 'challenge_id')->orderBy('order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(CodelabSubmission::class, 'challenge_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(CodelabVote::class, 'challenge_id');
    }
}
