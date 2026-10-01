<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clan extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'tag',
        'category',
        'description',
        'lines_of_research',
        'streak_days',
        'weekly_challenge',
        'created_by',
    ];

    protected $casts = [
        'lines_of_research' => 'array',
        'weekly_challenge' => 'array',
        'streak_days' => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->hasMany(ClanMember::class, 'clan_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'clan_members', 'clan_id', 'user_id')
                    ->withPivot('role', 'joined_at');
    }

    public function posts()
    {
        return $this->hasMany(ClanPost::class, 'clan_id')->latest();
    }
}
