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
        'level',
        'level_title',
        'current_xp',
        'next_level_xp',
        'weekly_quest',
    ];

    protected $casts = [
        'lines_of_research' => 'array',
        'weekly_challenge'  => 'array',
        'weekly_quest'      => 'array',
        'streak_days'       => 'integer',
        'level'             => 'integer',
        'current_xp'        => 'integer',
        'next_level_xp'     => 'integer',
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

    public function projects()
    {
        return $this->hasMany(ClanProject::class, 'clan_id');
    }

    public function tasks()
    {
        return $this->hasMany(ClanProjectTask::class, 'clan_id');
    }

    public function pullRequests()
    {
        return $this->hasMany(ClanProjectPullRequest::class, 'clan_id');
    }
}
