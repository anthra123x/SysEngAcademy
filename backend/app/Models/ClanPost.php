<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClanPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'clan_id',
        'user_id',
        'author_role',
        'title',
        'content',
        'type',
        'code_snippet',
        'code_language',
        'upvotes_count',
        'teacher_endorsement',
    ];

    protected $casts = [
        'upvotes_count'       => 'integer',
        'teacher_endorsement' => 'array',
    ];

    public function clan()
    {
        return $this->belongsTo(Clan::class, 'clan_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function comments()
    {
        return $this->hasMany(ClanPostComment::class, 'post_id')->oldest();
    }

    public function upvotes()
    {
        return $this->hasMany(ClanPostUpvote::class, 'post_id');
    }
}
